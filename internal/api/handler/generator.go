package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/unsealdev/unseal/internal/model"
	"github.com/unsealdev/unseal/internal/util"

	"github.com/labstack/echo/v4"
)

type CreateGeneratorRequest struct {
	Name      string `json:"name" validate:"required"`
	Prompt    string `json:"prompt" validate:"required"`
	Provider  string `json:"provider" validate:"required"`
	Model     string `json:"model" validate:"required"`
	Modality  string `json:"modality" validate:"required"`
	ImageURLs string `json:"image_urls"`
}

type UpdateGeneratorRequest struct {
	Name      string `json:"name" validate:"required"`
	Prompt    string `json:"prompt" validate:"required"`
	Provider  string `json:"provider" validate:"required"`
	Model     string `json:"model" validate:"required"`
	Modality  string `json:"modality" validate:"required"`
	ImageURLs string `json:"image_urls"`
}

type GetGeneratorResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Prompt      string `json:"prompt"`
	Provider    string `json:"provider"`
	Model       string `json:"model"`
	Modality    string `json:"modality"`
	ImageURLs   string `json:"image_urls"`
	CreatedAt   string `json:"created_at"`
	CreatedBy   string `json:"created_by"`
	UpdatedAt   string `json:"updated_at"`
	UpdatedBy   string `json:"updated_by"`
	WorkspaceID string `json:"workspace_id"`
}

func (h Handler) GetGenerators(c echo.Context) error {
	workspaceId := c.Param("workspaceId")
	pageSize := 20
	pageNumber := 1
	if ps := c.QueryParam("pageSize"); ps != "" {
		if v, err := strconv.Atoi(ps); err == nil && v > 0 {
			pageSize = v
		}
	}
	if pn := c.QueryParam("pageNumber"); pn != "" {
		if v, err := strconv.Atoi(pn); err == nil && v > 0 {
			pageNumber = v
		}
	}

	query := c.QueryParam("query")

	filter := model.GeneratorFilter{
		WorkspaceID: workspaceId,
		PageSize:    pageSize,
		PageNumber:  pageNumber,
		Query:       query,
	}

	generators, err := h.db.FindGenerators(filter)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	res := make([]GetGeneratorResponse, 0)
	for _, g := range generators {
		res = append(res, GetGeneratorResponse{
			ID:          g.ID,
			Name:        g.Name,
			Prompt:      g.Prompt,
			Provider:    g.Provider,
			Model:       g.Model,
			Modality:    g.Modality,
			ImageURLs:   g.ImageURLs,
			CreatedAt:   g.CreatedAt,
			CreatedBy:   g.CreatedBy,
			UpdatedAt:   g.UpdatedAt,
			UpdatedBy:   g.UpdatedBy,
			WorkspaceID: g.WorkspaceID,
		})
	}

	return c.JSON(http.StatusOK, res)
}

func (h Handler) GetGenerator(c echo.Context) error {
	workspaceId := c.Param("workspaceId")
	if workspaceId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Workspace id is required")
	}

	id := c.Param("id")
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Generator id is required")
	}

	g := model.Generator{WorkspaceID: workspaceId, ID: id}
	g, err := h.db.FindGenerator(g)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	res := GetGeneratorResponse{
		ID:          g.ID,
		Name:        g.Name,
		Prompt:      g.Prompt,
		Provider:    g.Provider,
		Model:       g.Model,
		Modality:    g.Modality,
		ImageURLs:   g.ImageURLs,
		CreatedAt:   g.CreatedAt,
		CreatedBy:   g.CreatedBy,
		UpdatedAt:   g.UpdatedAt,
		UpdatedBy:   g.UpdatedBy,
		WorkspaceID: g.WorkspaceID,
	}

	return c.JSON(http.StatusOK, res)
}

func (h Handler) CreateGenerator(c echo.Context) error {
	workspaceId := c.Param("workspaceId")
	if workspaceId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "workspace id is required")
	}
	var req CreateGeneratorRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Validation failed: " + err.Error(),
		})
	}

	var g model.Generator
	user := c.Get("user").(model.User)

	g.WorkspaceID = workspaceId
	g.ID = util.NewId()
	g.Name = req.Name
	g.Prompt = req.Prompt
	g.Provider = req.Provider
	g.Model = req.Model
	g.Modality = req.Modality
	g.ImageURLs = req.ImageURLs
	g.CreatedAt = time.Now().UTC().String()
	g.CreatedBy = user.ID
	g.UpdatedAt = time.Now().UTC().String()
	g.UpdatedBy = user.ID

	err := h.db.CreateGenerator(g)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusCreated, g)
}

func (h Handler) DeleteGenerator(c echo.Context) error {
	workspaceId := c.Param("workspaceId")
	id := c.Param("id")
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Generator id is required")
	}
	generator := model.Generator{WorkspaceID: workspaceId, ID: id}

	existingGenerator, err := h.db.FindGenerator(generator)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user := c.Get("user").(model.User)

	if existingGenerator.CreatedBy != user.ID {
		return echo.NewHTTPError(http.StatusForbidden, "you do not have permission to delete this Generator")
	}

	if err := h.db.DeleteGenerator(generator); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

func (h Handler) UpdateGenerator(c echo.Context) error {
	workspaceId := c.Param("workspaceId")
	if workspaceId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "workspace id is required")
	}
	id := c.Param("id")
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Generator id is required")
	}

	var req UpdateGeneratorRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Validation failed: " + err.Error(),
		})
	}

	existingGenerator, err := h.db.FindGenerator(model.Generator{ID: id})

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user := c.Get("user").(model.User)

	if existingGenerator.CreatedBy != user.ID {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	var g model.Generator

	g.WorkspaceID = workspaceId
	g.ID = existingGenerator.ID
	g.Name = req.Name
	g.Prompt = req.Prompt
	g.Provider = req.Provider
	g.Model = req.Model
	g.Modality = req.Modality
	g.ImageURLs = req.ImageURLs
	g.CreatedAt = existingGenerator.CreatedAt
	g.CreatedBy = existingGenerator.CreatedBy
	g.UpdatedAt = time.Now().UTC().String()
	g.UpdatedBy = user.ID

	err = h.db.UpdateGenerator(g)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, g)
}

// ListGenModels lists all available AI models from all providers with their modalities
func (h Handler) ListGenModels(c echo.Context) error {
	user := c.Get("user").(model.User)
	if user.ID == "" {
		return c.JSON(http.StatusUnauthorized, "")
	}

	// Get models from the gen service
	models, err := h.genService.ListModels()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, models)
}

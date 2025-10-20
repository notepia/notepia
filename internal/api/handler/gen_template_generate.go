package handler

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/unsealdev/unseal/internal/ai/gen"
	"github.com/unsealdev/unseal/internal/config"
	"github.com/unsealdev/unseal/internal/model"
	"github.com/unsealdev/unseal/internal/util"
)

type GenerateFromTemplateRequest struct {
	TemplateID string   `json:"template_id" validate:"required"`
	Prompt     string   `json:"prompt" validate:"required"`
	ImageURLs  []string `json:"image_urls"`
}

type GenerateFromTemplateResponse struct {
	HistoryID string `json:"history_id"`
	Content   string `json:"content"`
	Error     string `json:"error"`
}

func (h Handler) GenerateFromTemplate(c echo.Context) error {
	workspaceId := c.Param("workspaceId")
	if workspaceId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "workspace id is required")
	}

	var req GenerateFromTemplateRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Validation failed: " + err.Error(),
		})
	}

	user := c.Get("user").(model.User)
	if user.ID == "" {
		return c.JSON(http.StatusUnauthorized, "")
	}

	// Find the template
	template, err := h.db.FindGenTemplate(model.GenTemplate{
		WorkspaceID: workspaceId,
		ID:          req.TemplateID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Template not found: "+err.Error())
	}

	// Get user settings for AI providers
	userSettings, err := h.db.FindUserSettingsByID(user.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// Use provider from template
	provider := template.Provider
	if provider == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Template provider is not set"})
	}

	// Get and decrypt API key from user settings based on provider
	secret := config.C.GetString(config.APP_SECRET)
	var encryptedKey *string

	if provider == "openai" {
		encryptedKey = userSettings.OpenAIKey
	} else if provider == "gemini" {
		encryptedKey = userSettings.GeminiKey
	} else {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("Unsupported provider: %s", provider)})
	}

	if encryptedKey == nil || *encryptedKey == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": fmt.Sprintf("API key for %s not configured in user settings", provider),
		})
	}

	// Decrypt the API key
	apiKey, err := util.Decrypt(*encryptedKey, secret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": fmt.Sprintf("Failed to decrypt API key: %s", err.Error()),
		})
	}

	if apiKey == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": fmt.Sprintf("API key for %s is empty after decryption", provider),
		})
	}

	// Prepare generation request (IMPORTANT: API key is passed here, NOT stored in provider)
	genReq := gen.GenerateRequest{
		Provider: provider,
		Model:    template.Model,
		Modality: template.Modality,
		Prompt:   req.Prompt,
		APIKey:   apiKey, // API key from user settings
	}

	// Add images if modality supports them
	if template.Modality == "textimage2text" || template.Modality == "textimage2image" {
		genReq.Images = req.ImageURLs
	}

	// Generate content
	var responseContent string
	var responseError string

	genRes, err := h.genService.Generate(genReq)
	if err != nil {
		responseError = err.Error()
	} else {
		responseContent = genRes.Content
	}

	// Save to history
	history := model.GenHistory{
		ID:               util.NewId(),
		WorkspaceID:      workspaceId,
		TemplateID:       req.TemplateID,
		RequestPrompt:    req.Prompt,
		RequestModel:     template.Model,
		RequestModality:  template.Modality,
		RequestImageURLs: strings.Join(req.ImageURLs, ","),
		ResponseContent:  responseContent,
		ResponseError:    responseError,
		CreatedAt:        time.Now().UTC().String(),
		CreatedBy:        user.ID,
	}

	if err := h.db.CreateGenHistory(history); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to save history: "+err.Error())
	}

	return c.JSON(http.StatusOK, GenerateFromTemplateResponse{
		HistoryID: history.ID,
		Content:   responseContent,
		Error:     responseError,
	})
}

package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/pinbook/pinbook/internal/ai/textgen"
	"github.com/pinbook/pinbook/internal/ai/textgen/providers/gemini"
	"github.com/pinbook/pinbook/internal/ai/textgen/providers/openai"
	"github.com/pinbook/pinbook/internal/model"
)

func (h *Handler) ListTextModels(c echo.Context) error {
	user := c.Get("user").(model.User)

	if user.ID == "" {
		return c.JSON(http.StatusUnauthorized, "")
	}

	userSettings, err := h.db.FindUserSettingsByID(user.ID)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	ts := createTextGenService(userSettings)

	models, err := ts.ListModels()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, models)
}

func (h Handler) GenerateText(c echo.Context) error {
	req := textgen.GenerateRequest{}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user := c.Get("user").(model.User)

	if user.ID == "" {
		return c.JSON(http.StatusUnauthorized, "")
	}

	userSettings, err := h.db.FindUserSettingsByID(user.ID)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	ts := createTextGenService(userSettings)

	res, err := ts.Generate(req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, res)
}

func createTextGenService(u model.UserSettings) *textgen.Service {
	var providers []textgen.Provider
	if u.OpenAIKey != nil {
		providers = append(providers, openai.NewOpenaiTextGen(*u.OpenAIKey))
	}
	if u.GeminiKey != nil {
		providers = append(providers, gemini.NewGeminiTextGen(*u.GeminiKey))
	}

	return textgen.NewService(providers...)
}

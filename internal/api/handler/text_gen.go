package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/unsealdev/unseal/internal/ai/textgen"
	"github.com/unsealdev/unseal/internal/ai/textgen/providers/gemini"
	"github.com/unsealdev/unseal/internal/ai/textgen/providers/openai"
	"github.com/unsealdev/unseal/internal/config"
	"github.com/unsealdev/unseal/internal/model"
	"github.com/unsealdev/unseal/internal/util"
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

	ts, err := createTextGenService(userSettings)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

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

	ts, err := createTextGenService(userSettings)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	res, err := ts.Generate(req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, res)
}

func createTextGenService(u model.UserSettings) (*textgen.Service, error) {
	var providers []textgen.Provider
	secret := config.C.GetString(config.APP_SECRET)

	if u.OpenAIKey != nil {
		apikey, err := util.Decrypt(*u.OpenAIKey, secret)

		if err != nil {
			return nil, err
		}

		if apikey != "" {
			providers = append(providers, openai.NewOpenaiTextGen(apikey))
		}
	}
	if u.GeminiKey != nil {
		apikey, err := util.Decrypt(*u.GeminiKey, secret)

		if err != nil {
			return nil, err
		}

		if apikey != "" {
			providers = append(providers, gemini.NewGeminiTextGen(apikey))
		}
	}

	return textgen.NewService(providers...), nil
}

package route

import (
	"github.com/labstack/echo/v4"
	"github.com/pinbook/pinbook/internal/api/handler"
	"github.com/pinbook/pinbook/internal/api/middlewares"
)

func RegisterPublic(api *echo.Group, h handler.Handler, a middlewares.AuthMiddleware) {
	g := api.Group("/public")
	g.Use(a.ParseJWT())

	g.GET("/notes", h.GetPublicNotes)
}

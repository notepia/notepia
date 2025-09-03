package route

import (
	"github.com/pinbook/pinbook/internal/api/handler"
	"github.com/pinbook/pinbook/internal/api/middlewares"

	"github.com/labstack/echo/v4"
)

func RegisterUser(api *echo.Group, h handler.Handler, authMiddleware middlewares.AuthMiddleware) {
	g := api.Group("/users")
	g.Use(authMiddleware.JWT())
	g.PUT("/:id/password", h.ChangePassword)
	g.PUT("/:id/avatar", h.ChangeAvatar)
}

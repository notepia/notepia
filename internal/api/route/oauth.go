package route

import (
	"github.com/notepia/notepia/internal/api/handler"

	"github.com/labstack/echo/v4"
)

func RegisterOAuth(e *echo.Echo, h handler.Handler) {
	// OAuth authorization flow endpoints (public, no authentication required for authorize page)
	e.GET("/oauth/authorize", h.ShowAuthorizationPage)
	e.POST("/oauth/authorize", h.HandleAuthorization)

	// OAuth token endpoint (public, authentication via client credentials)
	e.POST("/oauth/token", h.TokenEndpoint)

	// OAuth revocation endpoint (public)
	e.POST("/oauth/revoke", h.RevokeToken)
}

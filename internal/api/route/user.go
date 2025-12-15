package route

import (
	"github.com/notepia/notepia/internal/api/handler"
	"github.com/notepia/notepia/internal/api/middlewares"

	"github.com/labstack/echo/v4"
)

func RegisterUser(api *echo.Group, h handler.Handler, authMiddleware middlewares.AuthMiddleware) {
	g := api.Group("/users")
	g.Use(authMiddleware.CheckJWT())
	g.Use(authMiddleware.ParseJWT())
	g.PATCH("/:id/preferences", h.UpdatePreferences)

	// API Key management routes
	apiKeys := g.Group("/:id/api-keys")
	apiKeys.GET("", h.ListAPIKeys)           // GET /api/v1/users/:id/api-keys
	apiKeys.POST("", h.CreateAPIKey)         // POST /api/v1/users/:id/api-keys
	apiKeys.DELETE("/:keyId", h.DeleteAPIKey) // DELETE /api/v1/users/:id/api-keys/:keyId

	// OAuth Client management routes
	oauthClients := g.Group("/:id/oauth-clients")
	oauthClients.GET("", h.ListOAuthClients)                    // GET /api/v1/users/:id/oauth-clients
	oauthClients.POST("", h.CreateOAuthClient)                  // POST /api/v1/users/:id/oauth-clients
	oauthClients.GET("/:clientId", h.GetOAuthClient)            // GET /api/v1/users/:id/oauth-clients/:clientId
	oauthClients.PATCH("/:clientId", h.UpdateOAuthClient)       // PATCH /api/v1/users/:id/oauth-clients/:clientId
	oauthClients.DELETE("/:clientId", h.DeleteOAuthClient)      // DELETE /api/v1/users/:id/oauth-clients/:clientId
}

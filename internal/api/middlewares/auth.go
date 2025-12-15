package middlewares

import (
	"net/http"
	"strings"
	"time"

	"github.com/notepia/notepia/internal/api/auth"
	"github.com/notepia/notepia/internal/db"
	"github.com/notepia/notepia/internal/util"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type AuthMiddleware struct {
	db db.DB
}

func NewAuthMiddleware(db db.DB) *AuthMiddleware {
	return &AuthMiddleware{
		db: db,
	}
}

func (a AuthMiddleware) ParseJWT() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) (returnErr error) {
			// STEP 1: Check for Authorization header with Bearer token (API Key or OAuth Access Token)
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				token := strings.TrimPrefix(authHeader, "Bearer ")

				// Try API Key first
				if util.ValidateAPIKeyFormat(token) {
					// Extract prefix for lookup
					prefix := util.ExtractPrefix(token)

					// Find API key by prefix
					apiKeyRecord, err := a.db.FindAPIKeyByPrefix(prefix)
					if err == nil {
						// Check expiration
						if apiKeyRecord.ExpiresAt != "" {
							expiresAt, err := time.Parse(time.RFC3339, apiKeyRecord.ExpiresAt)
							if err == nil && time.Now().UTC().After(expiresAt) {
								return echo.NewHTTPError(http.StatusUnauthorized, "API key expired")
							}
						}

						// Verify full key with bcrypt (constant-time comparison)
						err = bcrypt.CompareHashAndPassword([]byte(apiKeyRecord.KeyHash), []byte(token))
						if err == nil {
							// Load user
							user, err := a.db.FindUserByID(apiKeyRecord.UserID)
							if err != nil {
								return echo.NewHTTPError(http.StatusUnauthorized, "user not found")
							}

							// Check if user is disabled
							if user.Disabled {
								return echo.NewHTTPError(http.StatusUnauthorized, "user account disabled")
							}

							// Update last_used_at asynchronously (don't block request)
							go func() {
								apiKeyRecord.LastUsedAt = time.Now().UTC().Format(time.RFC3339)
								a.db.UpdateAPIKey(apiKeyRecord)
							}()

							// Set user in context
							c.Set("user", user)
							return next(c)
						}
					}
				}

				// Try OAuth Access Token
				if util.ValidateOAuthAccessTokenFormat(token) {
					// Extract prefix for lookup
					prefix := util.ExtractOAuthAccessTokenPrefix(token)

					// Find OAuth token by access prefix
					oauthToken, err := a.db.FindOAuthTokenByAccessPrefix(prefix)
					if err == nil {
						// Check if revoked
						if oauthToken.Revoked {
							return echo.NewHTTPError(http.StatusUnauthorized, "OAuth token has been revoked")
						}

						// Check expiration
						expiresAt, err := time.Parse(time.RFC3339, oauthToken.AccessTokenExpiresAt)
						if err == nil && time.Now().UTC().After(expiresAt) {
							return echo.NewHTTPError(http.StatusUnauthorized, "OAuth access token expired")
						}

						// Verify full token with bcrypt (constant-time comparison)
						err = bcrypt.CompareHashAndPassword([]byte(oauthToken.AccessTokenHash), []byte(token))
						if err == nil {
							// Load user
							user, err := a.db.FindUserByID(oauthToken.UserID)
							if err != nil {
								return echo.NewHTTPError(http.StatusUnauthorized, "user not found")
							}

							// Check if user is disabled
							if user.Disabled {
								return echo.NewHTTPError(http.StatusUnauthorized, "user account disabled")
							}

							// Update last_used_at asynchronously (don't block request)
							go func() {
								oauthToken.LastUsedAt = time.Now().UTC().Format(time.RFC3339)
								a.db.UpdateOAuthToken(oauthToken)
							}()

							// Set user in context
							c.Set("user", user)
							return next(c)
						}
					}
				}

				// If we get here, the Bearer token format is invalid or verification failed
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid bearer token")
			}

			// STEP 2: Fall back to cookie-based JWT authentication
			cookie, err := c.Cookie("token")
			if err != nil || cookie.Value == "" {
				return next(c)
			}

			user, err := auth.GetUserFromCookie(cookie)
			if err != nil || user == nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
			}

			c.Set("user", *user)

			return next(c)
		}
	}
}

func (a AuthMiddleware) CheckJWT() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) (returnErr error) {
			cookie, err := c.Cookie("token")
			if err != nil || cookie.Value == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing or invalid token")
			}
			return next(c)
		}
	}
}

func (a AuthMiddleware) RequireOwnerOrAdmin() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) (returnErr error) {
			role := c.Get("role").(string)

			if role == "" {
				return c.JSON(http.StatusUnauthorized, "please login")
			}
			if role != "owner" && role != "admin" {
				return c.JSON(http.StatusForbidden, "insufficient permissions")
			}

			return next(c)
		}
	}
}

package handler

import (
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/notepia/notepia/internal/api/auth"
	"github.com/notepia/notepia/internal/model"
	"github.com/notepia/notepia/internal/util"
	"golang.org/x/crypto/bcrypt"
)

// ShowAuthorizationPage displays the OAuth consent page
// GET /oauth/authorize?client_id=xxx&redirect_uri=xxx&response_type=code&state=xxx&code_challenge=xxx&code_challenge_method=S256
func (h Handler) ShowAuthorizationPage(c echo.Context) error {
	// Get query parameters
	clientID := c.QueryParam("client_id")
	redirectURI := c.QueryParam("redirect_uri")
	responseType := c.QueryParam("response_type")
	state := c.QueryParam("state")
	codeChallenge := c.QueryParam("code_challenge")
	codeChallengeMethod := c.QueryParam("code_challenge_method")

	// Validate required parameters
	if clientID == "" || redirectURI == "" || responseType == "" {
		return c.String(http.StatusBadRequest, "Missing required parameters: client_id, redirect_uri, response_type")
	}

	if responseType != "code" {
		return c.String(http.StatusBadRequest, "Only 'code' response_type is supported")
	}

	// Get current user from cookie
	cookie, err := c.Cookie("token")
	if err != nil || cookie.Value == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "You must be logged in to authorize applications")
	}

	currentUser, err := auth.GetUserFromCookie(cookie)
	if err != nil || currentUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid session")
	}

	// Find OAuth client
	oauthClient, err := h.db.FindOAuthClientByClientID(clientID)
	if err != nil {
		return c.String(http.StatusBadRequest, "Invalid client_id")
	}

	// Validate redirect URI
	validRedirect := false
	for _, uri := range oauthClient.RedirectURIs {
		if uri == redirectURI {
			validRedirect = true
			break
		}
	}
	if !validRedirect {
		return c.String(http.StatusBadRequest, "Invalid redirect_uri")
	}

	// Get client owner info
	clientOwner, err := h.db.FindUserByID(oauthClient.UserID)
	if err != nil {
		clientOwner = model.User{Name: "Unknown"}
	}

	// Render consent page (simplified HTML for now, can be enhanced later)
	html := `
<!DOCTYPE html>
<html>
<head>
    <title>Authorize Application</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 500px; margin: 100px auto; padding: 20px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1 { margin-top: 0; }
        .app-info { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .buttons { display: flex; gap: 10px; margin-top: 20px; }
        button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
        .approve { background: #0066cc; color: white; flex: 1; }
        .deny { background: #ccc; color: #333; flex: 1; }
        .approve:hover { background: #0052a3; }
        .deny:hover { background: #bbb; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Authorize Application</h1>
        <p><strong>` + oauthClient.Name + `</strong> wants to access your Notepia account.</p>
        <div class="app-info">
            <p><strong>Application:</strong> ` + oauthClient.Name + `</p>
            <p><strong>Developer:</strong> ` + clientOwner.Name + `</p>
            <p><strong>Description:</strong> ` + oauthClient.Description + `</p>
        </div>
        <p>This application will have access to your notes and data.</p>
        <form method="POST" action="/oauth/authorize">
            <input type="hidden" name="client_id" value="` + clientID + `">
            <input type="hidden" name="redirect_uri" value="` + redirectURI + `">
            <input type="hidden" name="response_type" value="` + responseType + `">
            <input type="hidden" name="state" value="` + state + `">
            <input type="hidden" name="code_challenge" value="` + codeChallenge + `">
            <input type="hidden" name="code_challenge_method" value="` + codeChallengeMethod + `">
            <div class="buttons">
                <button type="submit" name="action" value="approve" class="approve">Approve</button>
                <button type="submit" name="action" value="deny" class="deny">Deny</button>
            </div>
        </form>
    </div>
</body>
</html>
`

	return c.HTML(http.StatusOK, html)
}

// HandleAuthorization processes the user's approval or denial
// POST /oauth/authorize
func (h Handler) HandleAuthorization(c echo.Context) error {
	// Get form parameters
	clientID := c.FormValue("client_id")
	redirectURI := c.FormValue("redirect_uri")
	state := c.FormValue("state")
	action := c.FormValue("action")
	codeChallenge := c.FormValue("code_challenge")
	codeChallengeMethod := c.FormValue("code_challenge_method")

	// Get current user
	cookie, err := c.Cookie("token")
	if err != nil || cookie.Value == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "Missing session")
	}

	currentUser, err := auth.GetUserFromCookie(cookie)
	if err != nil || currentUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid session")
	}

	// Build redirect URL
	redirectURL, err := url.Parse(redirectURI)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid redirect_uri")
	}

	query := redirectURL.Query()
	if state != "" {
		query.Set("state", state)
	}

	// Handle denial
	if action != "approve" {
		query.Set("error", "access_denied")
		query.Set("error_description", "User denied the authorization request")
		redirectURL.RawQuery = query.Encode()
		return c.Redirect(http.StatusFound, redirectURL.String())
	}

	// Generate authorization code
	code, err := util.GenerateOAuthCode()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate authorization code")
	}

	// Create authorization code record (expires in 10 minutes)
	authCode := model.OAuthAuthorizationCode{
		ID:                  util.NewId(),
		Code:                code,
		ClientID:            clientID,
		UserID:              currentUser.ID,
		RedirectURI:         redirectURI,
		CodeChallenge:       codeChallenge,
		CodeChallengeMethod: codeChallengeMethod,
		ExpiresAt:           time.Now().UTC().Add(10 * time.Minute).Format(time.RFC3339),
		Used:                false,
		CreatedAt:           time.Now().UTC().Format(time.RFC3339),
	}

	if err := h.db.CreateOAuthAuthorizationCode(authCode); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create authorization code")
	}

	// Redirect back with authorization code
	query.Set("code", code)
	redirectURL.RawQuery = query.Encode()

	return c.Redirect(http.StatusFound, redirectURL.String())
}

// TokenEndpoint handles token requests (authorization_code, refresh_token, and client_credentials grants)
// POST /oauth/token
func (h Handler) TokenEndpoint(c echo.Context) error {
	grantType := c.FormValue("grant_type")

	switch grantType {
	case "authorization_code":
		return h.handleAuthorizationCodeGrant(c)
	case "refresh_token":
		return h.handleRefreshTokenGrant(c)
	case "client_credentials":
		return h.handleClientCredentialsGrant(c)
	default:
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "unsupported_grant_type",
			"error_description": "Supported grant types: 'authorization_code', 'refresh_token', 'client_credentials'",
		})
	}
}

func (h Handler) handleAuthorizationCodeGrant(c echo.Context) error {
	code := c.FormValue("code")
	clientID := c.FormValue("client_id")
	clientSecret := c.FormValue("client_secret")
	redirectURI := c.FormValue("redirect_uri")
	codeVerifier := c.FormValue("code_verifier")

	// Validate client credentials
	oauthClient, err := h.db.FindOAuthClientByClientID(clientID)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error":             "invalid_client",
			"error_description": "Invalid client_id",
		})
	}

	// Verify client secret
	if err := bcrypt.CompareHashAndPassword([]byte(oauthClient.ClientSecretHash), []byte(clientSecret)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error":             "invalid_client",
			"error_description": "Invalid client_secret",
		})
	}

	// Find authorization code
	authCode, err := h.db.FindOAuthAuthorizationCode(code)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Invalid or expired authorization code",
		})
	}

	// Verify code hasn't been used
	if authCode.Used {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Authorization code has already been used",
		})
	}

	// Verify code hasn't expired
	expiresAt, _ := time.Parse(time.RFC3339, authCode.ExpiresAt)
	if time.Now().UTC().After(expiresAt) {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Authorization code has expired",
		})
	}

	// Verify client ID matches
	if authCode.ClientID != clientID {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Authorization code was issued to a different client",
		})
	}

	// Verify redirect URI matches
	if authCode.RedirectURI != redirectURI {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Redirect URI mismatch",
		})
	}

	// Verify PKCE if code_challenge was used
	if authCode.CodeChallenge != "" {
		if !util.VerifyPKCEChallenge(codeVerifier, authCode.CodeChallenge, authCode.CodeChallengeMethod) {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error":             "invalid_grant",
				"error_description": "Invalid code_verifier",
			})
		}
	}

	// Mark code as used
	if err := h.db.MarkOAuthAuthorizationCodeAsUsed(code); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to mark code as used")
	}

	// Generate tokens
	accessToken, accessTokenPrefix, err := util.GenerateOAuthAccessToken()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate access token")
	}

	refreshToken, refreshTokenPrefix, err := util.GenerateOAuthRefreshToken()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate refresh token")
	}

	// Hash tokens
	accessTokenHash, err := bcrypt.GenerateFromPassword([]byte(accessToken), 12)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash access token")
	}

	refreshTokenHash, err := bcrypt.GenerateFromPassword([]byte(refreshToken), 12)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash refresh token")
	}

	// Create token record
	now := time.Now().UTC()
	oauthToken := model.OAuthToken{
		ID:                     util.NewId(),
		AccessTokenHash:        string(accessTokenHash),
		AccessTokenPrefix:      accessTokenPrefix,
		RefreshTokenHash:       string(refreshTokenHash),
		RefreshTokenPrefix:     refreshTokenPrefix,
		ClientID:               clientID,
		UserID:                 authCode.UserID,
		AccessTokenExpiresAt:   now.Add(1 * time.Hour).Format(time.RFC3339),
		RefreshTokenExpiresAt:  now.Add(30 * 24 * time.Hour).Format(time.RFC3339),
		Revoked:                false,
		CreatedAt:              now.Format(time.RFC3339),
		UpdatedAt:              now.Format(time.RFC3339),
	}

	if err := h.db.CreateOAuthToken(oauthToken); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create token")
	}

	// Return token response
	response := model.TokenResponse{
		AccessToken:  accessToken,
		TokenType:    "Bearer",
		ExpiresIn:    3600, // 1 hour in seconds
		RefreshToken: refreshToken,
	}

	return c.JSON(http.StatusOK, response)
}

func (h Handler) handleRefreshTokenGrant(c echo.Context) error {
	refreshToken := c.FormValue("refresh_token")
	clientID := c.FormValue("client_id")
	clientSecret := c.FormValue("client_secret")

	// Validate client credentials
	oauthClient, err := h.db.FindOAuthClientByClientID(clientID)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error":             "invalid_client",
			"error_description": "Invalid client_id",
		})
	}

	// Verify client secret
	if err := bcrypt.CompareHashAndPassword([]byte(oauthClient.ClientSecretHash), []byte(clientSecret)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error":             "invalid_client",
			"error_description": "Invalid client_secret",
		})
	}

	// Extract prefix from refresh token
	refreshTokenPrefix := util.ExtractOAuthRefreshTokenPrefix(refreshToken)
	if refreshTokenPrefix == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Invalid refresh token format",
		})
	}

	// Find token by refresh prefix
	oauthToken, err := h.db.FindOAuthTokenByRefreshPrefix(refreshTokenPrefix)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Invalid refresh token",
		})
	}

	// Verify refresh token hash
	if err := bcrypt.CompareHashAndPassword([]byte(oauthToken.RefreshTokenHash), []byte(refreshToken)); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Invalid refresh token",
		})
	}

	// Verify token hasn't been revoked
	if oauthToken.Revoked {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Refresh token has been revoked",
		})
	}

	// Verify refresh token hasn't expired
	expiresAt, _ := time.Parse(time.RFC3339, oauthToken.RefreshTokenExpiresAt)
	if time.Now().UTC().After(expiresAt) {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Refresh token has expired",
		})
	}

	// Verify client ID matches
	if oauthToken.ClientID != clientID {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_grant",
			"error_description": "Refresh token was issued to a different client",
		})
	}

	// Generate new tokens
	newAccessToken, newAccessTokenPrefix, err := util.GenerateOAuthAccessToken()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate access token")
	}

	newRefreshToken, newRefreshTokenPrefix, err := util.GenerateOAuthRefreshToken()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate refresh token")
	}

	// Hash new tokens
	newAccessTokenHash, err := bcrypt.GenerateFromPassword([]byte(newAccessToken), 12)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash access token")
	}

	newRefreshTokenHash, err := bcrypt.GenerateFromPassword([]byte(newRefreshToken), 12)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash refresh token")
	}

	// Update token record (rotate tokens)
	now := time.Now().UTC()
	oauthToken.AccessTokenHash = string(newAccessTokenHash)
	oauthToken.AccessTokenPrefix = newAccessTokenPrefix
	oauthToken.RefreshTokenHash = string(newRefreshTokenHash)
	oauthToken.RefreshTokenPrefix = newRefreshTokenPrefix
	oauthToken.AccessTokenExpiresAt = now.Add(1 * time.Hour).Format(time.RFC3339)
	oauthToken.RefreshTokenExpiresAt = now.Add(30 * 24 * time.Hour).Format(time.RFC3339)
	oauthToken.UpdatedAt = now.Format(time.RFC3339)

	if err := h.db.UpdateOAuthToken(oauthToken); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update token")
	}

	// Return new token response
	response := model.TokenResponse{
		AccessToken:  newAccessToken,
		TokenType:    "Bearer",
		ExpiresIn:    3600, // 1 hour in seconds
		RefreshToken: newRefreshToken,
	}

	return c.JSON(http.StatusOK, response)
}

// handleClientCredentialsGrant handles the client_credentials grant type
// This is used for machine-to-machine (M2M) authentication without user involvement
func (h Handler) handleClientCredentialsGrant(c echo.Context) error {
	clientID := c.FormValue("client_id")
	clientSecret := c.FormValue("client_secret")

	// Validate client credentials
	oauthClient, err := h.db.FindOAuthClientByClientID(clientID)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error":             "invalid_client",
			"error_description": "Invalid client_id",
		})
	}

	// Verify client secret
	if err := bcrypt.CompareHashAndPassword([]byte(oauthClient.ClientSecretHash), []byte(clientSecret)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error":             "invalid_client",
			"error_description": "Invalid client_secret",
		})
	}

	// Generate access token
	accessToken, accessTokenPrefix, err := util.GenerateOAuthAccessToken()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate access token")
	}

	// Hash access token
	accessTokenHash, err := bcrypt.GenerateFromPassword([]byte(accessToken), 12)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash access token")
	}

	// For client_credentials flow, we don't need refresh tokens
	// But we still need to fill the refresh token fields in the database
	// We'll use the same access token as placeholder for refresh token fields

	// Create token record (associated with the OAuth client owner)
	now := time.Now().UTC()
	oauthToken := model.OAuthToken{
		ID:                     util.NewId(),
		AccessTokenHash:        string(accessTokenHash),
		AccessTokenPrefix:      accessTokenPrefix,
		RefreshTokenHash:       string(accessTokenHash), // Use same hash as placeholder
		RefreshTokenPrefix:     accessTokenPrefix,       // Use same prefix as placeholder
		ClientID:               clientID,
		UserID:                 oauthClient.UserID, // Token belongs to the client owner
		AccessTokenExpiresAt:   now.Add(1 * time.Hour).Format(time.RFC3339),
		RefreshTokenExpiresAt:  now.Add(1 * time.Hour).Format(time.RFC3339), // Same as access token
		Revoked:                false,
		CreatedAt:              now.Format(time.RFC3339),
		UpdatedAt:              now.Format(time.RFC3339),
	}

	if err := h.db.CreateOAuthToken(oauthToken); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create token")
	}

	// Return token response (no refresh_token for client_credentials flow)
	response := model.TokenResponse{
		AccessToken: accessToken,
		TokenType:   "Bearer",
		ExpiresIn:   3600, // 1 hour in seconds
	}

	return c.JSON(http.StatusOK, response)
}

// RevokeToken revokes an access or refresh token
// POST /oauth/revoke
func (h Handler) RevokeToken(c echo.Context) error {
	token := c.FormValue("token")
	tokenTypeHint := c.FormValue("token_type_hint") // "access_token" or "refresh_token"

	if token == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "invalid_request",
			"error_description": "Token parameter is required",
		})
	}

	// Try to extract prefix and determine token type
	var prefix string
	if tokenTypeHint == "refresh_token" || strings.HasPrefix(token, util.OAuthRefreshTokenPrefix) {
		prefix = util.ExtractOAuthRefreshTokenPrefix(token)
	} else {
		prefix = util.ExtractOAuthAccessTokenPrefix(token)
	}

	if prefix == "" {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"}) // Silently succeed per OAuth spec
	}

	// Revoke the token
	_ = h.db.RevokeOAuthToken(prefix)

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

package handler

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/notepia/notepia/internal/api/auth"
	"github.com/notepia/notepia/internal/model"
	"github.com/notepia/notepia/internal/util"
	"golang.org/x/crypto/bcrypt"
)

type CreateOAuthClientRequest struct {
	Name         string   `json:"name" validate:"required"`
	RedirectURIs []string `json:"redirect_uris"`
	Description  string   `json:"description"`
}

type UpdateOAuthClientRequest struct {
	Name         string   `json:"name"`
	RedirectURIs []string `json:"redirect_uris"`
	Description  string   `json:"description"`
}

// ListOAuthClients returns all OAuth clients for a user
func (h Handler) ListOAuthClients(c echo.Context) error {
	userID := c.Param("id")

	// Get current user from context
	cookie, err := c.Cookie("token")
	if err != nil || cookie.Value == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "missing or invalid token")
	}

	currentUser, err := auth.GetUserFromCookie(cookie)
	if err != nil || currentUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	// Users can only list their own OAuth clients
	if currentUser.ID != userID {
		return echo.NewHTTPError(http.StatusForbidden, "you can only manage your own OAuth clients")
	}

	// Find all clients for this user
	clients, err := h.db.FindOAuthClients(model.OAuthClientFilter{UserID: userID})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch OAuth clients")
	}

	// Convert to response format (without secret)
	responses := make([]model.OAuthClientResponse, len(clients))
	for i, client := range clients {
		responses[i] = model.OAuthClientResponse{
			ID:                 client.ID,
			UserID:             client.UserID,
			Name:               client.Name,
			ClientID:           client.ClientID,
			ClientSecretPrefix: client.ClientSecretPrefix,
			RedirectURIs:       client.RedirectURIs,
			Description:        client.Description,
			CreatedAt:          client.CreatedAt,
			UpdatedAt:          client.UpdatedAt,
		}
	}

	return c.JSON(http.StatusOK, responses)
}

// CreateOAuthClient generates a new OAuth client
func (h Handler) CreateOAuthClient(c echo.Context) error {
	userID := c.Param("id")

	// Get current user from context
	cookie, err := c.Cookie("token")
	if err != nil || cookie.Value == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "missing or invalid token")
	}

	currentUser, err := auth.GetUserFromCookie(cookie)
	if err != nil || currentUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	// Users can only create their own OAuth clients
	if currentUser.ID != userID {
		return echo.NewHTTPError(http.StatusForbidden, "you can only manage your own OAuth clients")
	}

	// Parse request
	var req CreateOAuthClientRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if req.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "name is required")
	}

	// Generate client ID
	clientID, _, err := util.GenerateOAuthClientID()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate client ID")
	}

	// Generate client secret
	clientSecret, clientSecretPrefix, err := util.GenerateOAuthClientSecret()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate client secret")
	}

	// Hash the client secret with bcrypt (cost 12)
	secretHash, err := bcrypt.GenerateFromPassword([]byte(clientSecret), 12)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to hash client secret")
	}

	// Create OAuth client record
	oauthClient := model.OAuthClient{
		ID:                 util.NewId(),
		UserID:             userID,
		Name:               req.Name,
		ClientID:           clientID,
		ClientSecretHash:   string(secretHash),
		ClientSecretPrefix: clientSecretPrefix,
		RedirectURIs:       req.RedirectURIs,
		Description:        req.Description,
		CreatedAt:          time.Now().UTC().Format(time.RFC3339),
		UpdatedAt:          time.Now().UTC().Format(time.RFC3339),
	}

	// Save to database
	if err := h.db.CreateOAuthClient(oauthClient); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create OAuth client")
	}

	// Return response with full client secret (ONLY TIME IT'S RETURNED)
	response := model.OAuthClientCreationResponse{
		OAuthClientResponse: model.OAuthClientResponse{
			ID:                 oauthClient.ID,
			UserID:             oauthClient.UserID,
			Name:               oauthClient.Name,
			ClientID:           oauthClient.ClientID,
			ClientSecretPrefix: oauthClient.ClientSecretPrefix,
			RedirectURIs:       oauthClient.RedirectURIs,
			Description:        oauthClient.Description,
			CreatedAt:          oauthClient.CreatedAt,
			UpdatedAt:          oauthClient.UpdatedAt,
		},
		ClientSecret: clientSecret,
	}

	return c.JSON(http.StatusCreated, response)
}

// GetOAuthClient returns a single OAuth client
func (h Handler) GetOAuthClient(c echo.Context) error {
	userID := c.Param("id")
	clientID := c.Param("clientId")

	// Get current user from context
	cookie, err := c.Cookie("token")
	if err != nil || cookie.Value == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "missing or invalid token")
	}

	currentUser, err := auth.GetUserFromCookie(cookie)
	if err != nil || currentUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	// Users can only view their own OAuth clients
	if currentUser.ID != userID {
		return echo.NewHTTPError(http.StatusForbidden, "you can only manage your own OAuth clients")
	}

	// Find the client
	client, err := h.db.FindOAuthClientByID(clientID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "OAuth client not found")
	}

	// Verify ownership
	if client.UserID != userID {
		return echo.NewHTTPError(http.StatusForbidden, "this OAuth client does not belong to you")
	}

	// Convert to response format
	response := model.OAuthClientResponse{
		ID:                 client.ID,
		UserID:             client.UserID,
		Name:               client.Name,
		ClientID:           client.ClientID,
		ClientSecretPrefix: client.ClientSecretPrefix,
		RedirectURIs:       client.RedirectURIs,
		Description:        client.Description,
		CreatedAt:          client.CreatedAt,
		UpdatedAt:          client.UpdatedAt,
	}

	return c.JSON(http.StatusOK, response)
}

// UpdateOAuthClient updates an OAuth client's details
func (h Handler) UpdateOAuthClient(c echo.Context) error {
	userID := c.Param("id")
	clientID := c.Param("clientId")

	// Get current user from context
	cookie, err := c.Cookie("token")
	if err != nil || cookie.Value == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "missing or invalid token")
	}

	currentUser, err := auth.GetUserFromCookie(cookie)
	if err != nil || currentUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	// Users can only update their own OAuth clients
	if currentUser.ID != userID {
		return echo.NewHTTPError(http.StatusForbidden, "you can only manage your own OAuth clients")
	}

	// Find the client
	client, err := h.db.FindOAuthClientByID(clientID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "OAuth client not found")
	}

	// Verify ownership
	if client.UserID != userID {
		return echo.NewHTTPError(http.StatusForbidden, "this OAuth client does not belong to you")
	}

	// Parse request
	var req UpdateOAuthClientRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	// Update fields if provided
	if req.Name != "" {
		client.Name = req.Name
	}
	if len(req.RedirectURIs) > 0 {
		client.RedirectURIs = req.RedirectURIs
	}
	if req.Description != "" {
		client.Description = req.Description
	}
	client.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	// Save to database
	if err := h.db.UpdateOAuthClient(client); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update OAuth client")
	}

	// Convert to response format
	response := model.OAuthClientResponse{
		ID:                 client.ID,
		UserID:             client.UserID,
		Name:               client.Name,
		ClientID:           client.ClientID,
		ClientSecretPrefix: client.ClientSecretPrefix,
		RedirectURIs:       client.RedirectURIs,
		Description:        client.Description,
		CreatedAt:          client.CreatedAt,
		UpdatedAt:          client.UpdatedAt,
	}

	return c.JSON(http.StatusOK, response)
}

// DeleteOAuthClient removes an OAuth client
func (h Handler) DeleteOAuthClient(c echo.Context) error {
	userID := c.Param("id")
	clientID := c.Param("clientId")

	// Get current user from context
	cookie, err := c.Cookie("token")
	if err != nil || cookie.Value == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "missing or invalid token")
	}

	currentUser, err := auth.GetUserFromCookie(cookie)
	if err != nil || currentUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	// Users can only delete their own OAuth clients
	if currentUser.ID != userID {
		return echo.NewHTTPError(http.StatusForbidden, "you can only manage your own OAuth clients")
	}

	// Find the client
	client, err := h.db.FindOAuthClientByID(clientID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "OAuth client not found")
	}

	// Verify ownership
	if client.UserID != userID {
		return echo.NewHTTPError(http.StatusForbidden, "this OAuth client does not belong to you")
	}

	// Delete the client (CASCADE will delete associated codes and tokens)
	if err := h.db.DeleteOAuthClient(clientID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete OAuth client")
	}

	return c.NoContent(http.StatusNoContent)
}

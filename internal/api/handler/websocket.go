package handler

import (
	"log"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/notepia/notepia/internal/model"
	ws "github.com/notepia/notepia/internal/websocket"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// In production, you should check the origin properly
		// For now, allow all origins
		return true
	},
}

// HandleViewWebSocket handles WebSocket connections for a specific view
func (h *Handler) HandleViewWebSocket(c echo.Context) error {
	// Get view ID from URL path
	viewID := c.Param("viewId")

	// Log full request details for debugging
	log.Printf("WebSocket connection request:")
	log.Printf("  - Full Path: %s", c.Request().URL.Path)
	log.Printf("  - ViewID param (raw): %s", viewID)

	if viewID == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "View ID is required")
	}

	// y-websocket appends the room name to the URL, which causes duplication
	// Extract the first part if there's a duplicate (e.g., "id/id" -> "id")
	parts := strings.Split(viewID, "/")
	if len(parts) > 0 {
		viewID = parts[0]
		log.Printf("  - ViewID (cleaned): %s", viewID)
	}

	// Get authenticated user from context
	user, ok := c.Get("user").(model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User not authenticated")
	}

	// Verify the view exists and user has access to it
	// TODO: Add proper permission checking based on workspace membership
	view, err := h.db.FindView(model.View{ID: viewID})
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "View not found")
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return err
	}

	// Get or create room based on view type
	var room ws.RoomInterface
	if view.Type == "whiteboard" {
		room = h.hub.GetOrCreateWhiteboardRoom(viewID)
		log.Printf("Using whiteboard room for view %s", viewID)
	} else {
		room = h.hub.GetOrCreateRoom(viewID)
		log.Printf("Using Y.js room for view %s", viewID)
	}

	// Create client
	client := ws.NewClient(conn, user.ID, user.Name, viewID, room)

	// Register client with the room
	room.Register(client)

	// Start client's read and write pumps
	client.Run()

	return nil
}

// HandleHubStats returns statistics about the WebSocket hub
func (h *Handler) HandleHubStats(c echo.Context) error {
	stats := h.hub.Stats()
	return c.JSON(http.StatusOK, stats)
}

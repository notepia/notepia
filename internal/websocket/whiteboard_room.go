package websocket

import (
	"context"
	"encoding/json"
	"log"

	"github.com/notepia/notepia/internal/redis"
)

// WhiteboardMessageType represents the type of whiteboard message
type WhiteboardMessageType string

const (
	WhiteboardMessageTypeAuth               WhiteboardMessageType = "auth"
	WhiteboardMessageTypeInit               WhiteboardMessageType = "init"
	WhiteboardMessageTypeAddCanvasObject    WhiteboardMessageType = "add_canvas_object"
	WhiteboardMessageTypeUpdateCanvasObject WhiteboardMessageType = "update_canvas_object"
	WhiteboardMessageTypeDeleteCanvasObject WhiteboardMessageType = "delete_canvas_object"
	WhiteboardMessageTypeAddViewObject      WhiteboardMessageType = "add_view_object"
	WhiteboardMessageTypeUpdateViewObject   WhiteboardMessageType = "update_view_object"
	WhiteboardMessageTypeDeleteViewObject   WhiteboardMessageType = "delete_view_object"
	WhiteboardMessageTypeClearAll           WhiteboardMessageType = "clear_all"
)

// WhiteboardMessage represents a whiteboard WebSocket message
type WhiteboardMessage struct {
	Type          WhiteboardMessageType          `json:"type"`
	Token         string                         `json:"token,omitempty"`
	CanvasObjects map[string]redis.CanvasObject  `json:"canvas_objects,omitempty"`
	ViewObjects   map[string]redis.ViewObject    `json:"view_objects,omitempty"`
	Object        json.RawMessage                `json:"object,omitempty"`
	ID            string                         `json:"id,omitempty"`
}

// WhiteboardRoom manages all clients for a specific whiteboard view
type WhiteboardRoom struct {
	// View ID
	viewID string

	// Registered clients
	clients map[*Client]bool

	// Inbound messages from clients
	broadcast chan *Message

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Whiteboard cache for persisting updates
	cache *redis.WhiteboardCache

	// Context for cancellation
	ctx context.Context

	// Cancel function
	cancel context.CancelFunc
}

// NewWhiteboardRoom creates a new whiteboard room
func NewWhiteboardRoom(viewID string, cache *redis.WhiteboardCache) *WhiteboardRoom {
	ctx, cancel := context.WithCancel(context.Background())

	return &WhiteboardRoom{
		viewID:     viewID,
		clients:    make(map[*Client]bool),
		broadcast:  make(chan *Message, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		cache:      cache,
		ctx:        ctx,
		cancel:     cancel,
	}
}

// Run starts the whiteboard room's main loop
func (r *WhiteboardRoom) Run() {
	defer func() {
		log.Printf("Whiteboard room %s stopped", r.viewID)
	}()

	for {
		select {
		case <-r.ctx.Done():
			// Room is being shut down
			for client := range r.clients {
				close(client.send)
			}
			return

		case client := <-r.register:
			r.clients[client] = true
			log.Printf("Client %s (%s) joined whiteboard room %s. Total clients: %d",
				client.UserID, client.UserName, r.viewID, len(r.clients))

			// Send initial state to the new client
			go r.sendInitialState(client)

		case client := <-r.unregister:
			if _, ok := r.clients[client]; ok {
				delete(r.clients, client)
				close(client.send)
				log.Printf("Client %s (%s) left whiteboard room %s. Remaining clients: %d",
					client.UserID, client.UserName, r.viewID, len(r.clients))
			}

		case message := <-r.broadcast:
			// Parse and handle the message
			r.handleMessage(message)
		}
	}
}

// sendInitialState sends the current whiteboard state to a newly connected client
func (r *WhiteboardRoom) sendInitialState(client *Client) {
	// Get canvas objects from cache
	canvasObjects, err := r.cache.GetCanvasObjects(r.ctx, r.viewID)
	if err != nil {
		log.Printf("Error loading canvas objects: %v", err)
		canvasObjects = make(map[string]redis.CanvasObject)
	}

	// Get view objects from cache
	viewObjects, err := r.cache.GetViewObjects(r.ctx, r.viewID)
	if err != nil {
		log.Printf("Error loading view objects: %v", err)
		viewObjects = make(map[string]redis.ViewObject)
	}

	// Send initial state message
	initMsg := WhiteboardMessage{
		Type:          WhiteboardMessageTypeInit,
		CanvasObjects: canvasObjects,
		ViewObjects:   viewObjects,
	}

	data, err := json.Marshal(initMsg)
	if err != nil {
		log.Printf("Error marshaling init message: %v", err)
		return
	}

	select {
	case client.send <- data:
		log.Printf("Sent initial state to client %s (%d canvas objects, %d view objects)",
			client.UserID, len(canvasObjects), len(viewObjects))
	default:
		log.Printf("Failed to send initial state to client %s", client.UserID)
	}
}

// handleMessage processes incoming whiteboard messages
func (r *WhiteboardRoom) handleMessage(msg *Message) {
	// Parse the JSON message
	var whiteboardMsg WhiteboardMessage
	if err := json.Unmarshal(msg.Data, &whiteboardMsg); err != nil {
		log.Printf("Error parsing whiteboard message: %v", err)
		return
	}

	switch whiteboardMsg.Type {
	case WhiteboardMessageTypeAddCanvasObject, WhiteboardMessageTypeUpdateCanvasObject:
		// Parse the object
		var obj redis.CanvasObject
		if err := json.Unmarshal(whiteboardMsg.Object, &obj); err != nil {
			log.Printf("Error parsing canvas object: %v", err)
			return
		}

		// Store in cache
		if err := r.cache.SetCanvasObject(r.ctx, r.viewID, obj); err != nil {
			log.Printf("Error storing canvas object in cache: %v", err)
		}

	case WhiteboardMessageTypeDeleteCanvasObject:
		// Delete from cache
		if err := r.cache.DeleteCanvasObject(r.ctx, r.viewID, whiteboardMsg.ID); err != nil {
			log.Printf("Error deleting canvas object from cache: %v", err)
		}

	case WhiteboardMessageTypeAddViewObject, WhiteboardMessageTypeUpdateViewObject:
		// Parse the object
		var obj redis.ViewObject
		if err := json.Unmarshal(whiteboardMsg.Object, &obj); err != nil {
			log.Printf("Error parsing view object: %v", err)
			return
		}

		// Store in cache
		if err := r.cache.SetViewObject(r.ctx, r.viewID, obj); err != nil {
			log.Printf("Error storing view object in cache: %v", err)
		}

	case WhiteboardMessageTypeDeleteViewObject:
		// Delete from cache
		if err := r.cache.DeleteViewObject(r.ctx, r.viewID, whiteboardMsg.ID); err != nil {
			log.Printf("Error deleting view object from cache: %v", err)
		}

	case WhiteboardMessageTypeClearAll:
		// Clear all objects from cache
		if err := r.cache.ClearCanvasObjects(r.ctx, r.viewID); err != nil {
			log.Printf("Error clearing canvas objects: %v", err)
		}
		if err := r.cache.ClearViewObjects(r.ctx, r.viewID); err != nil {
			log.Printf("Error clearing view objects: %v", err)
		}
	}

	// Broadcast to all clients except sender
	for client := range r.clients {
		if client != msg.Sender {
			select {
			case client.send <- msg.Data:
			default:
				// Client's send buffer is full, remove client
				close(client.send)
				delete(r.clients, client)
				log.Printf("Client %s send buffer full, disconnecting", client.UserID)
			}
		}
	}

	// Refresh TTL since there's activity
	if err := r.cache.RefreshTTL(r.ctx, r.viewID); err != nil {
		log.Printf("Error refreshing TTL: %v", err)
	}
}

// Stop stops the room and disconnects all clients
func (r *WhiteboardRoom) Stop() {
	r.cancel()
}

// ClientCount returns the number of clients in the room
func (r *WhiteboardRoom) ClientCount() int {
	return len(r.clients)
}

// Register registers a client with the room
func (r *WhiteboardRoom) Register(client *Client) {
	r.register <- client
}

// Unregister unregisters a client from the room
func (r *WhiteboardRoom) Unregister(client *Client) {
	r.unregister <- client
}

// Broadcast sends a message to the room's broadcast channel
func (r *WhiteboardRoom) Broadcast(message *Message) {
	r.broadcast <- message
}

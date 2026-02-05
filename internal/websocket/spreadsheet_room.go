package websocket

import (
	"context"
	"encoding/json"
	"log"

	"github.com/collabreef/collabreef/internal/redis"
)

// SpreadsheetMessageType represents the type of spreadsheet message
type SpreadsheetMessageType string

const (
	SpreadsheetMessageTypeInit           SpreadsheetMessageType = "init"
	SpreadsheetMessageTypeAcquireLock    SpreadsheetMessageType = "acquire_lock"
	SpreadsheetMessageTypeLockAcquired   SpreadsheetMessageType = "lock_acquired"
	SpreadsheetMessageTypeInitializeData SpreadsheetMessageType = "initialize_data"
	SpreadsheetMessageTypeOp             SpreadsheetMessageType = "op"
	SpreadsheetMessageTypeSync           SpreadsheetMessageType = "sync"
)

// SpreadsheetMessage represents a spreadsheet WebSocket message
type SpreadsheetMessage struct {
	Type         SpreadsheetMessageType `json:"type"`
	Sheets       json.RawMessage        `json:"sheets,omitempty"`
	Ops          json.RawMessage        `json:"ops,omitempty"`
	Initialized  bool                   `json:"initialized,omitempty"`
	LockAcquired bool                   `json:"lock_acquired,omitempty"`
}

// SpreadsheetRoom manages all clients for a specific spreadsheet view
type SpreadsheetRoom struct {
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

	// Spreadsheet cache for persisting updates
	cache *redis.SpreadsheetCache

	// Context for cancellation
	ctx context.Context

	// Cancel function
	cancel context.CancelFunc
}

// NewSpreadsheetRoom creates a new spreadsheet room
func NewSpreadsheetRoom(viewID string, cache *redis.SpreadsheetCache) *SpreadsheetRoom {
	ctx, cancel := context.WithCancel(context.Background())

	return &SpreadsheetRoom{
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

// Run starts the spreadsheet room's main loop
func (r *SpreadsheetRoom) Run() {
	defer func() {
		log.Printf("Spreadsheet room %s stopped", r.viewID)
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
			log.Printf("Client %s (%s) joined spreadsheet room %s. Total clients: %d",
				client.UserID, client.UserName, r.viewID, len(r.clients))

			// Send initial state to the new client
			go r.sendInitialStateToClient(client)

		case client := <-r.unregister:
			if _, ok := r.clients[client]; ok {
				delete(r.clients, client)
				close(client.send)
				log.Printf("Client %s (%s) left spreadsheet room %s. Remaining clients: %d",
					client.UserID, client.UserName, r.viewID, len(r.clients))
			}

		case message := <-r.broadcast:
			// Parse and handle the message
			r.handleMessage(message)
		}
	}
}

// sendInitialStateToClient sends the current cached spreadsheet state to a newly connected client
func (r *SpreadsheetRoom) sendInitialStateToClient(client *Client) {
	// Recover from panic if client disconnects while sending
	defer func() {
		if rec := recover(); rec != nil {
			log.Printf("Recovered from panic in sendInitialStateToClient for client %s: %v", client.UserID, rec)
		}
	}()

	// Check if already initialized in Redis
	initialized, err := r.cache.IsSpreadsheetInitialized(r.ctx, r.viewID)
	if err != nil {
		log.Printf("Error checking initialization status: %v", err)
	}

	// Get sheets from cache (empty if not initialized)
	var sheets json.RawMessage
	if initialized {
		sheets, err = r.cache.GetSheets(r.ctx, r.viewID)
		if err != nil && err.Error() != "redis: nil" {
			log.Printf("Error loading sheets: %v", err)
		}
	}

	// Send initial state message with initialization status
	initMsg := SpreadsheetMessage{
		Type:        SpreadsheetMessageTypeInit,
		Sheets:      sheets,
		Initialized: initialized,
	}

	data, err := json.Marshal(initMsg)
	if err != nil {
		log.Printf("Error marshaling init message: %v", err)
		return
	}

	select {
	case client.send <- data:
		log.Printf("Sent initial state to client %s (initialized=%v)", client.UserID, initialized)
	default:
		log.Printf("Failed to send initial state to client %s", client.UserID)
	}
}

// handleMessage processes incoming spreadsheet messages
func (r *SpreadsheetRoom) handleMessage(msg *Message) {
	// Parse the JSON message
	var spreadsheetMsg SpreadsheetMessage
	if err := json.Unmarshal(msg.Data, &spreadsheetMsg); err != nil {
		log.Printf("Error parsing spreadsheet message: %v", err)
		return
	}

	// Ignore write operations from read-only clients
	if msg.Sender.IsReadOnly {
		switch spreadsheetMsg.Type {
		case SpreadsheetMessageTypeAcquireLock:
			// Allow read-only clients to try acquiring lock (will be denied)
		default:
			log.Printf("Ignoring write operation from read-only client %s: %s", msg.Sender.UserID, spreadsheetMsg.Type)
			return
		}
	}

	switch spreadsheetMsg.Type {
	case SpreadsheetMessageTypeAcquireLock:
		// Client wants to acquire initialization lock
		acquired, err := r.cache.AcquireSpreadsheetInitLock(r.ctx, r.viewID)
		if err != nil {
			log.Printf("Error acquiring init lock: %v", err)
			acquired = false
		}

		// Send response back to the requesting client
		response := SpreadsheetMessage{
			Type:         SpreadsheetMessageTypeLockAcquired,
			LockAcquired: acquired,
		}
		data, err := json.Marshal(response)
		if err != nil {
			log.Printf("Error marshaling lock response: %v", err)
			return
		}

		select {
		case msg.Sender.send <- data:
			log.Printf("Sent lock acquisition response to client %s: %v", msg.Sender.UserID, acquired)
		default:
			log.Printf("Failed to send lock response to client %s", msg.Sender.UserID)
		}

	case SpreadsheetMessageTypeInitializeData:
		// Client is sending initial data after fetching from DB
		if spreadsheetMsg.Sheets != nil {
			if err := r.cache.SetSheets(r.ctx, r.viewID, spreadsheetMsg.Sheets); err != nil {
				log.Printf("Error storing sheets during init: %v", err)
			}
		}

		// Mark as initialized
		if err := r.cache.MarkSpreadsheetInitialized(r.ctx, r.viewID); err != nil {
			log.Printf("Error marking spreadsheet as initialized: %v", err)
		}

		// Release the lock
		if err := r.cache.ReleaseSpreadsheetInitLock(r.ctx, r.viewID); err != nil {
			log.Printf("Error releasing init lock: %v", err)
		}

		log.Printf("Spreadsheet %s initialized by client %s", r.viewID, msg.Sender.UserID)

		// Broadcast the initialization data to all other clients
		for client := range r.clients {
			if client != msg.Sender {
				select {
				case client.send <- msg.Data:
				default:
					close(client.send)
					delete(r.clients, client)
					log.Printf("Client %s send buffer full during init, disconnecting", client.UserID)
				}
			}
		}

	case SpreadsheetMessageTypeOp:
		// Client is sending operations
		if spreadsheetMsg.Ops != nil {
			if err := r.cache.AppendOps(r.ctx, r.viewID, spreadsheetMsg.Ops); err != nil {
				log.Printf("Error appending ops: %v", err)
			}
		}

		// Broadcast operations to all other clients
		for client := range r.clients {
			if client != msg.Sender {
				select {
				case client.send <- msg.Data:
				default:
					close(client.send)
					delete(r.clients, client)
					log.Printf("Client %s send buffer full, disconnecting", client.UserID)
				}
			}
		}
	}

	// Refresh TTL since there's activity
	if err := r.cache.RefreshTTL(r.ctx, r.viewID); err != nil {
		log.Printf("Error refreshing TTL: %v", err)
	}
}

// Stop stops the room and disconnects all clients
func (r *SpreadsheetRoom) Stop() {
	r.cancel()
}

// ClientCount returns the number of clients in the room
func (r *SpreadsheetRoom) ClientCount() int {
	return len(r.clients)
}

// Register registers a client with the room
func (r *SpreadsheetRoom) Register(client *Client) {
	r.register <- client
}

// Unregister unregisters a client from the room
func (r *SpreadsheetRoom) Unregister(client *Client) {
	r.unregister <- client
}

// Broadcast sends a message to the room's broadcast channel
func (r *SpreadsheetRoom) Broadcast(message *Message) {
	r.broadcast <- message
}

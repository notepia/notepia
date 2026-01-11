package websocket

import (
	"time"

	"github.com/gorilla/websocket"
)

// NoteClient represents a WebSocket client for note editing
// All messages are JSON format (TEXT)
type NoteClient struct {
	*Client // Embed the regular client
}

// NewNoteClient creates a new note WebSocket client
func NewNoteClient(conn *websocket.Conn, userID, userName, noteID string, room RoomInterface) *NoteClient {
	client := &Client{
		conn:     conn,
		UserID:   userID,
		UserName: userName,
		ViewID:   noteID, // Reuse ViewID field for noteID
		send:     make(chan []byte, 256),
		room:     room,
	}
	return &NoteClient{
		Client: client,
	}
}

// writePump pumps messages from the room to the WebSocket connection
// All messages are now JSON format (TEXT)
func (c *NoteClient) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The room closed the channel
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			// All messages are JSON (TEXT)
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

			// Process any queued messages
			n := len(c.send)
			for i := 0; i < n; i++ {
				queuedMsg := <-c.send
				if err := c.conn.WriteMessage(websocket.TextMessage, queuedMsg); err != nil {
					return
				}
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Run starts the client's read and write pumps
func (c *NoteClient) Run() {
	go c.writePump()
	go c.readPump()
}

package model

import "encoding/json"

type Block struct {
	WorkspaceID string          `json:"workspace_id"`
	NoteID      string          `json:"note_id"`
	ID          string          `json:"id"`
	Type        string          `json:"type"`
	Data        json.RawMessage `json:"data"`
}

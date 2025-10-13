package model

import "time"

type UserGenCommand struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Name      string    `json:"name"`
	MenuType  string    `json:"menu_type"`
	Prompt    string    `json:"prompt"`
	Modality  string    `json:"modality"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

package model

import "time"

type FileFilter struct {
	WorkspaceID string
	ID          string
	Exts        []string
}

type File struct {
	WorkspaceID      string
	ID               string
	Name             string
	Size             int64
	Ext              string
	OriginalFilename string `json:"original_filename"`
	CreatedAt        time.Time
	CreatedBy        string
	UpdatedAt        time.Time
	UpdatedBy        string
}

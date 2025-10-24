package model

type FileFilter struct {
	WorkspaceID string
	ID          string
	Exts        []string
	Query       string
	PageSize    int
	PageNumber  int
}

type File struct {
	WorkspaceID      string
	ID               string
	Name             string
	Size             int64
	Ext              string
	OriginalFilename string `json:"original_filename"`
	Visibility       string
	CreatedAt        string
	CreatedBy        string
	UpdatedAt        string
	UpdatedBy        string
}

package model

type WorkspaceFilter struct {
	WorkspaceIDs []string
	PageSize     int
	PageNumber   int
}

type Workspace struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
	CreatedBy string `json:"created_by"`
	UpdatedAt string `json:"updated_at"`
	UpdatedBy string `json:"updated_by"`
}

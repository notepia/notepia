package model

type WorkspaceUserFilter struct {
	WorkspaceID string
	UserID      string
	PageSize    int
	PageNumber  int
}

type WorkspaceUser struct {
	WorkspaceID string
	UserID      string
	Role        string
	CreatedAt   string
	CreatedBy   string
	UpdatedAt   string
	UpdatedBy   string
}

const (
	WorkspaceUserRoleOwner = "owner"
	WorkspaceUserRoleAdmin = "admin"
	WorkspaceUserRoleUser  = "user"
)

var validWorkspaceUserRole = map[string]struct{}{
	WorkspaceUserRoleOwner: {},
	WorkspaceUserRoleAdmin: {},
	WorkspaceUserRoleUser:  {},
}

func IsValidWorkspaceUserRole(input string) bool {
	_, exists := validWorkspaceUserRole[input]
	return exists
}

package model

type UserFilter struct {
	UserID      string
	NameOrEmail string
	Disabled    bool
}

type User struct {
	ID           string
	Email        string
	Name         string
	PasswordHash string
	Role         string
	AvatarUrl    string
	Disabled     bool
	CreatedBy    string
	CreatedAt    string
	UpdatedBy    string
	UpdatedAt    string
}

const (
	RoleOwner = "owner"
	RoleAdmin = "admin"
	RoleUser  = "user"
)

var validRole = map[string]struct{}{
	RoleOwner: {},
	RoleAdmin: {},
	RoleUser:  {},
}

func IsValidRole(input string) bool {
	_, exists := validRole[input]
	return exists
}

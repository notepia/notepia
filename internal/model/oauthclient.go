package model

type OAuthClientFilter struct {
	UserID   string
	ID       string
	ClientID string
}

type OAuthClient struct {
	ID                 string   `json:"id"`
	UserID             string   `json:"user_id"`
	Name               string   `json:"name"`
	ClientID           string   `json:"client_id"`
	ClientSecretHash   string   `json:"-"` // Never expose hash in JSON
	ClientSecretPrefix string   `json:"client_secret_prefix"`
	RedirectURIs       []string `json:"redirect_uris"`
	Description        string   `json:"description"`
	CreatedAt          string   `json:"created_at"`
	UpdatedAt          string   `json:"updated_at"`
}

// OAuthClientResponse is what we return to clients (without secret)
type OAuthClientResponse struct {
	ID                 string   `json:"id"`
	UserID             string   `json:"user_id"`
	Name               string   `json:"name"`
	ClientID           string   `json:"client_id"`
	ClientSecretPrefix string   `json:"client_secret_prefix"`
	RedirectURIs       []string `json:"redirect_uris"`
	Description        string   `json:"description"`
	CreatedAt          string   `json:"created_at"`
	UpdatedAt          string   `json:"updated_at"`
}

// OAuthClientCreationResponse includes the full client secret (only returned once)
type OAuthClientCreationResponse struct {
	OAuthClientResponse
	ClientSecret string `json:"client_secret"` // Only included on creation
}

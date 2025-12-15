package model

type OAuthToken struct {
	ID                     string `json:"id"`
	AccessTokenHash        string `json:"-"` // Never expose hash in JSON
	AccessTokenPrefix      string `json:"access_token_prefix"`
	RefreshTokenHash       string `json:"-"` // Never expose hash in JSON
	RefreshTokenPrefix     string `json:"refresh_token_prefix"`
	ClientID               string `json:"client_id"`
	UserID                 string `json:"user_id"`
	AccessTokenExpiresAt   string `json:"access_token_expires_at"`
	RefreshTokenExpiresAt  string `json:"refresh_token_expires_at"`
	Revoked                bool   `json:"revoked"`
	LastUsedAt             string `json:"last_used_at"`
	CreatedAt              string `json:"created_at"`
	UpdatedAt              string `json:"updated_at"`
}

// TokenResponse is the standard OAuth 2.0 token response
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"` // Always "Bearer"
	ExpiresIn    int    `json:"expires_in"` // Seconds until expiration
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope,omitempty"` // Optional, we may not use this
}

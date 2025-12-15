package model

type OAuthAuthorizationCode struct {
	ID                    string `json:"id"`
	Code                  string `json:"code"`
	ClientID              string `json:"client_id"`
	UserID                string `json:"user_id"`
	RedirectURI           string `json:"redirect_uri"`
	CodeChallenge         string `json:"code_challenge"`
	CodeChallengeMethod   string `json:"code_challenge_method"`
	ExpiresAt             string `json:"expires_at"`
	Used                  bool   `json:"used"`
	CreatedAt             string `json:"created_at"`
}

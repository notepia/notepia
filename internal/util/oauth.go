package util

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
)

const (
	OAuthClientIDPrefix      = "ntpc_"
	OAuthClientSecretPrefix  = "ntps_"
	OAuthAccessTokenPrefix   = "ntpt_"
	OAuthRefreshTokenPrefix  = "ntpr_"
	OAuthTokenLength         = 32 // characters after prefix
	OAuthCodeLength          = 32 // bytes before base64 encoding
)

// GenerateOAuthClientID generates a client ID with format: ntpc_<32-hex>
// Returns: fullClientID, prefix (first 12 chars), error
func GenerateOAuthClientID() (string, string, error) {
	randomBytes := make([]byte, 16) // 16 bytes = 32 hex characters
	if _, err := rand.Read(randomBytes); err != nil {
		return "", "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	randomString := hex.EncodeToString(randomBytes)
	fullClientID := OAuthClientIDPrefix + randomString
	prefix := fullClientID[:12]

	return fullClientID, prefix, nil
}

// GenerateOAuthClientSecret generates a client secret with format: ntps_<32-hex>
// Returns: fullSecret, prefix (first 12 chars), error
func GenerateOAuthClientSecret() (string, string, error) {
	randomBytes := make([]byte, 16) // 16 bytes = 32 hex characters
	if _, err := rand.Read(randomBytes); err != nil {
		return "", "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	randomString := hex.EncodeToString(randomBytes)
	fullSecret := OAuthClientSecretPrefix + randomString
	prefix := fullSecret[:12]

	return fullSecret, prefix, nil
}

// GenerateOAuthCode generates an authorization code (base64-encoded random string)
// Returns: code, error
func GenerateOAuthCode() (string, error) {
	randomBytes := make([]byte, OAuthCodeLength)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	code := base64.URLEncoding.EncodeToString(randomBytes)
	return code, nil
}

// GenerateOAuthAccessToken generates an access token with format: ntpt_<32-hex>
// Returns: fullToken, prefix (first 12 chars), error
func GenerateOAuthAccessToken() (string, string, error) {
	randomBytes := make([]byte, 16) // 16 bytes = 32 hex characters
	if _, err := rand.Read(randomBytes); err != nil {
		return "", "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	randomString := hex.EncodeToString(randomBytes)
	fullToken := OAuthAccessTokenPrefix + randomString
	prefix := fullToken[:12]

	return fullToken, prefix, nil
}

// GenerateOAuthRefreshToken generates a refresh token with format: ntpr_<32-hex>
// Returns: fullToken, prefix (first 12 chars), error
func GenerateOAuthRefreshToken() (string, string, error) {
	randomBytes := make([]byte, 16) // 16 bytes = 32 hex characters
	if _, err := rand.Read(randomBytes); err != nil {
		return "", "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	randomString := hex.EncodeToString(randomBytes)
	fullToken := OAuthRefreshTokenPrefix + randomString
	prefix := fullToken[:12]

	return fullToken, prefix, nil
}

// VerifyPKCEChallenge verifies that a code verifier matches the code challenge
// Supports "S256" (SHA256) and "plain" methods
func VerifyPKCEChallenge(verifier, challenge, method string) bool {
	if method == "" || method == "plain" {
		return verifier == challenge
	}

	if method == "S256" {
		hash := sha256.Sum256([]byte(verifier))
		computedChallenge := base64.URLEncoding.WithPadding(base64.NoPadding).EncodeToString(hash[:])
		return computedChallenge == challenge
	}

	return false
}

// ExtractOAuthClientSecretPrefix extracts the prefix from a full client secret
func ExtractOAuthClientSecretPrefix(secret string) string {
	if len(secret) < 12 {
		return ""
	}
	return secret[:12]
}

// ExtractOAuthAccessTokenPrefix extracts the prefix from a full access token
func ExtractOAuthAccessTokenPrefix(token string) string {
	if len(token) < 12 {
		return ""
	}
	return token[:12]
}

// ExtractOAuthRefreshTokenPrefix extracts the prefix from a full refresh token
func ExtractOAuthRefreshTokenPrefix(token string) string {
	if len(token) < 12 {
		return ""
	}
	return token[:12]
}

// ValidateOAuthClientSecretFormat checks if the client secret has valid format
func ValidateOAuthClientSecretFormat(secret string) bool {
	expectedLength := len(OAuthClientSecretPrefix) + OAuthTokenLength
	if len(secret) != expectedLength {
		return false
	}
	if secret[:len(OAuthClientSecretPrefix)] != OAuthClientSecretPrefix {
		return false
	}
	return true
}

// ValidateOAuthAccessTokenFormat checks if the access token has valid format
func ValidateOAuthAccessTokenFormat(token string) bool {
	expectedLength := len(OAuthAccessTokenPrefix) + OAuthTokenLength
	if len(token) != expectedLength {
		return false
	}
	if token[:len(OAuthAccessTokenPrefix)] != OAuthAccessTokenPrefix {
		return false
	}
	return true
}

// ValidateOAuthRefreshTokenFormat checks if the refresh token has valid format
func ValidateOAuthRefreshTokenFormat(token string) bool {
	expectedLength := len(OAuthRefreshTokenPrefix) + OAuthTokenLength
	if len(token) != expectedLength {
		return false
	}
	if token[:len(OAuthRefreshTokenPrefix)] != OAuthRefreshTokenPrefix {
		return false
	}
	return true
}

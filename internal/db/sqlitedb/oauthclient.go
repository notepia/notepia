package sqlitedb

import (
	"encoding/json"
	"strings"

	"github.com/notepia/notepia/internal/model"
)

// dbOAuthClient is the database model for OAuth clients
// We use this separate type to handle JSON marshaling of redirect_uris
type dbOAuthClient struct {
	ID                 string `gorm:"column:id;primaryKey"`
	UserID             string `gorm:"column:user_id"`
	Name               string `gorm:"column:name"`
	ClientID           string `gorm:"column:client_id"`
	ClientSecretHash   string `gorm:"column:client_secret_hash"`
	ClientSecretPrefix string `gorm:"column:client_secret_prefix"`
	RedirectURIs       string `gorm:"column:redirect_uris"` // Stored as JSON string in database
	Description        string `gorm:"column:description"`
	CreatedAt          string `gorm:"column:created_at"`
	UpdatedAt          string `gorm:"column:updated_at"`
}

func (dbOAuthClient) TableName() string {
	return "oauth_clients"
}

// toModel converts dbOAuthClient to model.OAuthClient
func (d *dbOAuthClient) toModel() (model.OAuthClient, error) {
	var redirectURIs []string
	if d.RedirectURIs != "" {
		if err := json.Unmarshal([]byte(d.RedirectURIs), &redirectURIs); err != nil {
			return model.OAuthClient{}, err
		}
	}

	return model.OAuthClient{
		ID:                 d.ID,
		UserID:             d.UserID,
		Name:               d.Name,
		ClientID:           d.ClientID,
		ClientSecretHash:   d.ClientSecretHash,
		ClientSecretPrefix: d.ClientSecretPrefix,
		RedirectURIs:       redirectURIs,
		Description:        d.Description,
		CreatedAt:          d.CreatedAt,
		UpdatedAt:          d.UpdatedAt,
	}, nil
}

// fromModel converts model.OAuthClient to dbOAuthClient
func (d *dbOAuthClient) fromModel(c model.OAuthClient) error {
	redirectURIsJSON, err := json.Marshal(c.RedirectURIs)
	if err != nil {
		return err
	}

	d.ID = c.ID
	d.UserID = c.UserID
	d.Name = c.Name
	d.ClientID = c.ClientID
	d.ClientSecretHash = c.ClientSecretHash
	d.ClientSecretPrefix = c.ClientSecretPrefix
	d.RedirectURIs = string(redirectURIsJSON)
	d.Description = c.Description
	d.CreatedAt = c.CreatedAt
	d.UpdatedAt = c.UpdatedAt

	return nil
}

func (s SqliteDB) CreateOAuthClient(c model.OAuthClient) error {
	var dbClient dbOAuthClient
	if err := dbClient.fromModel(c); err != nil {
		return err
	}
	return s.db.Create(&dbClient).Error
}

func (s SqliteDB) FindOAuthClients(f model.OAuthClientFilter) ([]model.OAuthClient, error) {
	query := s.getDB().Model(&dbOAuthClient{})

	var conds []string
	var args []interface{}

	if f.UserID != "" {
		conds = append(conds, "user_id = ?")
		args = append(args, f.UserID)
	}

	if f.ID != "" {
		conds = append(conds, "id = ?")
		args = append(args, f.ID)
	}

	if f.ClientID != "" {
		conds = append(conds, "client_id = ?")
		args = append(args, f.ClientID)
	}

	var dbClients []dbOAuthClient
	err := query.
		Where(strings.Join(conds, " AND "), args...).
		Find(&dbClients).Error

	if err != nil {
		return nil, err
	}

	clients := make([]model.OAuthClient, 0, len(dbClients))
	for _, dbClient := range dbClients {
		client, err := dbClient.toModel()
		if err != nil {
			return nil, err
		}
		clients = append(clients, client)
	}

	return clients, nil
}

func (s SqliteDB) FindOAuthClientByID(id string) (model.OAuthClient, error) {
	var dbClient dbOAuthClient
	err := s.getDB().
		Where("id = ?", id).
		First(&dbClient).Error

	if err != nil {
		return model.OAuthClient{}, err
	}

	return dbClient.toModel()
}

func (s SqliteDB) FindOAuthClientByClientID(clientID string) (model.OAuthClient, error) {
	var dbClient dbOAuthClient
	err := s.getDB().
		Where("client_id = ?", clientID).
		First(&dbClient).Error

	if err != nil {
		return model.OAuthClient{}, err
	}

	return dbClient.toModel()
}

func (s SqliteDB) UpdateOAuthClient(c model.OAuthClient) error {
	var dbClient dbOAuthClient
	if err := dbClient.fromModel(c); err != nil {
		return err
	}

	return s.getDB().
		Where("id = ?", c.ID).
		Updates(&dbClient).Error
}

func (s SqliteDB) DeleteOAuthClient(id string) error {
	return s.getDB().
		Where("id = ?", id).
		Delete(&dbOAuthClient{}).Error
}

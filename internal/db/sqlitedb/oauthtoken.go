package sqlitedb

import (
	"context"

	"github.com/notepia/notepia/internal/model"
	"gorm.io/gorm"
)

func (s SqliteDB) CreateOAuthToken(t model.OAuthToken) error {
	return gorm.G[model.OAuthToken](s.db).Create(context.Background(), &t)
}

func (s SqliteDB) FindOAuthTokenByAccessPrefix(prefix string) (model.OAuthToken, error) {
	return gorm.
		G[model.OAuthToken](s.getDB()).
		Where("access_token_prefix = ?", prefix).
		Take(context.Background())
}

func (s SqliteDB) FindOAuthTokenByRefreshPrefix(prefix string) (model.OAuthToken, error) {
	return gorm.
		G[model.OAuthToken](s.getDB()).
		Where("refresh_token_prefix = ?", prefix).
		Take(context.Background())
}

func (s SqliteDB) UpdateOAuthToken(t model.OAuthToken) error {
	_, err := gorm.G[model.OAuthToken](s.getDB()).
		Where("id = ?", t.ID).
		Updates(context.Background(), t)

	return err
}

func (s SqliteDB) RevokeOAuthToken(accessTokenPrefix string) error {
	update := model.OAuthToken{Revoked: true}
	_, err := gorm.G[model.OAuthToken](s.getDB()).
		Where("access_token_prefix = ?", accessTokenPrefix).
		Updates(context.Background(), update)

	return err
}

func (s SqliteDB) DeleteOAuthToken(id string) error {
	_, err := gorm.G[model.OAuthToken](s.getDB()).
		Where("id = ?", id).
		Delete(context.Background())

	return err
}

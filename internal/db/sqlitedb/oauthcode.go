package sqlitedb

import (
	"context"

	"github.com/notepia/notepia/internal/model"
	"gorm.io/gorm"
)

func (s SqliteDB) CreateOAuthAuthorizationCode(c model.OAuthAuthorizationCode) error {
	return gorm.G[model.OAuthAuthorizationCode](s.db).Create(context.Background(), &c)
}

func (s SqliteDB) FindOAuthAuthorizationCode(code string) (model.OAuthAuthorizationCode, error) {
	return gorm.
		G[model.OAuthAuthorizationCode](s.getDB()).
		Where("code = ?", code).
		Take(context.Background())
}

func (s SqliteDB) MarkOAuthAuthorizationCodeAsUsed(code string) error {
	update := model.OAuthAuthorizationCode{Used: true}
	_, err := gorm.G[model.OAuthAuthorizationCode](s.getDB()).
		Where("code = ?", code).
		Updates(context.Background(), update)

	return err
}

func (s SqliteDB) DeleteExpiredOAuthAuthorizationCodes() error {
	_, err := gorm.G[model.OAuthAuthorizationCode](s.getDB()).
		Where("expires_at < datetime('now')").
		Delete(context.Background())

	return err
}

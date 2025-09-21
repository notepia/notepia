package sqlitedb

import (
	"context"
	"errors"

	"github.com/pinbook/pinbook/internal/model"
	"gorm.io/gorm"
)

func (s SqliteDB) SaveUserSettings(settings model.UserSettings) error {
	var existing model.UserSettings
	err := s.getDB().Where("user_id = ?", settings.UserID).First(&existing).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return gorm.G[model.UserSettings](s.getDB()).Create(context.Background(), &settings)
	} else if err != nil {
		return err
	}

	_, err = gorm.G[model.UserSettings](s.getDB()).Updates(context.Background(), settings)

	return err
}

func (s SqliteDB) FindUserSettingsByID(id string) (model.UserSettings, error) {
	var existing model.UserSettings
	err := s.getDB().Where("user_id = ?", id).First(&existing).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return model.UserSettings{UserID: id}, nil
	}

	return existing, err
}

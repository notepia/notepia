package sqlitedb

import "github.com/pinbook/pinbook/internal/model"

func (db SqliteDB) SaveUserKey(u model.UserSettings) error {

	return nil
}

func (db SqliteDB) GetUserKey(uid string) (model.UserSettings, error) {

	return model.UserSettings{}, nil
}

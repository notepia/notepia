package sqlitedb

import "github.com/pinbook/pinbook/internal/model"

func (db SqliteDB) SaveUserKey(u model.UserKey) error {

	return nil
}

func (db SqliteDB) GetUserKeyByPlatform(uid string, platform string) (model.UserKey, error) {

	return model.UserKey{}, nil
}

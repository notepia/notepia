package sqlitedb

import (
	"context"

	"github.com/unsealdev/unseal/internal/model"
	"gorm.io/gorm"
)

func (s SqliteDB) CreateFile(u model.File) error {
	return gorm.G[model.File](s.getDB()).Create(context.Background(), &u)
}

func (s SqliteDB) FindFiles(f model.FileFilter) ([]model.File, error) {
	query := gorm.
		G[model.File](s.getDB())

	var conds []string
	var args []interface{}

	Files, err := query.
		Where(conds, args...).
		Find(context.Background())

	return Files, err
}

func (s SqliteDB) FindFileByID(id string) (model.File, error) {
	return gorm.
		G[model.File](s.getDB()).
		Where("id = ?", id).
		Take(context.Background())
}

func (s SqliteDB) UpdateFile(f model.File) error {
	_, err := gorm.G[model.File](s.getDB()).Where("id = ?", f.ID).Updates(context.Background(), f)

	return err
}

func (s SqliteDB) DeleteFile(f model.FileFilter) error {
	_, err := gorm.G[model.File](s.getDB()).Where("workspace_id = ? AND id = ?", f.WorkspaceID, f.ID).Delete(context.Background())

	return err
}

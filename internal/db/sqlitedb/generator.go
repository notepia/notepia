package sqlitedb

import (
	"context"

	"github.com/unsealdev/unseal/internal/model"
	"gorm.io/gorm"
)

func (s SqliteDB) CreateGenerator(g model.Generator) error {
	return gorm.G[model.Generator](s.getDB()).Create(context.Background(), &g)
}

func (s SqliteDB) UpdateGenerator(g model.Generator) error {
	_, err := gorm.G[model.Generator](s.getDB()).
		Where("id = ?", g.ID).
		Select("*").
		Updates(context.Background(), g)
	return err
}

func (s SqliteDB) DeleteGenerator(g model.Generator) error {
	_, err := gorm.G[model.Generator](s.getDB()).Where("id = ?", g.ID).Delete(context.Background())
	return err
}

func (s SqliteDB) FindGenerator(g model.Generator) (model.Generator, error) {
	generator, err := gorm.
		G[model.Generator](s.getDB()).
		Where("id = ?", g.ID).
		Take(context.Background())

	if err != nil {
		return model.Generator{}, err
	}

	return generator, nil
}

func (s SqliteDB) FindGenerators(f model.GeneratorFilter) ([]model.Generator, error) {
	var generators []model.Generator

	db := s.getDB().Model(&model.Generator{})

	if f.WorkspaceID != "" {
		db = db.Where("workspace_id = ?", f.WorkspaceID)
	}

	if f.Query != "" {
		searchQuery := "%" + f.Query + "%"
		db = db.Where("name LIKE ? OR prompt LIKE ?", searchQuery, searchQuery)
	}

	err := db.
		Order("created_at DESC").
		Offset((f.PageNumber - 1) * f.PageSize).
		Limit(f.PageSize).
		Find(&generators).Error

	return generators, err
}

package sqlitedb

import (
	"context"
	"strings"

	"github.com/pinbook/pinbook/internal/model"
	"gorm.io/gorm"
)

func (s SqliteDB) CreateNote(n model.Note) error {
	return gorm.G[model.Note](s.getDB()).Create(context.Background(), &n)
}

func (s SqliteDB) UpdateNote(n model.Note) error {
	db := s.getDB().Begin()
	defer func() {
		if r := recover(); r != nil {
			db.Rollback()
			panic(r)
		}
	}()

	_, err := gorm.G[model.Block](db).Where("note_id = ?", n.ID).Delete(context.Background())

	if err != nil {
		s.Rollback()
		return err
	}

	result := db.Create(n.Blocks)

	if result.Error != nil {
		db.Rollback()
		return result.Error
	}

	db.Commit()

	return nil
}

func (s SqliteDB) DeleteNote(n model.Note) error {
	db := s.getDB().Begin()
	defer func() {
		if r := recover(); r != nil {
			db.Rollback()
			panic(r)
		}
	}()

	_, err := gorm.G[model.Block](db).Where("note_id = ?", n.ID).Delete(context.Background())

	if err != nil {
		s.Rollback()
		return err
	}

	_, err = gorm.G[model.Note](db).Where("id = ?", n.ID).Delete(context.Background())

	if err != nil {
		db.Rollback()
		return err
	}
	db.Commit()

	return nil
}

func (s SqliteDB) FindNote(n model.Note) (model.Note, error) {
	note, err := gorm.
		G[model.Note](s.getDB()).
		Where("id = ?", n.ID).
		Take(context.Background())

	if err != nil {
		return model.Note{}, err
	}
	query := gorm.
		G[model.Block](s.getDB())

	blocks, err := query.
		Where("note_id = ?", n.ID).
		Find(context.Background())

	if err != nil {
		return model.Note{}, err
	}

	note.Blocks = blocks

	return note, err
}

func (s SqliteDB) FindNotes(f model.NoteFilter) ([]model.Note, error) {

	var conds []string
	var args []interface{}

	if f.WorkspaceID != "" {
		conds = append(conds, "workspace_id = ?")
		args = append(args, f.WorkspaceID)
	}

	var notes []model.Note

	err := s.getDB().Model(&model.Note{}).
		Preload("Blocks").
		Where(strings.Join(conds, " AND "), args...).
		Order("created_at DESC").
		Offset((f.PageNumber - 1) * f.PageSize).
		Limit(f.PageSize).
		Find(&notes).Error

	return notes, err
}

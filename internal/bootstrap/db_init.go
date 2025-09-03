package bootstrap

import (
	"fmt"

	"github.com/pinbook/pinbook/internal/config"
	"github.com/pinbook/pinbook/internal/db"
	"github.com/pinbook/pinbook/internal/db/sqlitedb"
)

func NewDB(cfg config.DatabaseConfig) (db.DB, error) {
	switch cfg.Driver {
	case "sqlite3":
		return sqlitedb.NewSqliteDB(cfg)
	}

	return nil, fmt.Errorf("unsupported database driver: %s", cfg.Driver)
}

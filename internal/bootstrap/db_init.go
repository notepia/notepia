package bootstrap

import (
	"fmt"

	"github.com/unsealdev/unseal/internal/config"
	"github.com/unsealdev/unseal/internal/db"
	"github.com/unsealdev/unseal/internal/db/sqlitedb"
)

func NewDB() (db.DB, error) {
	driver := config.C.GetString(config.DB_DRIVER)
	switch driver {
	case "sqlite3":
		return sqlitedb.NewSqliteDB()
	}

	return nil, fmt.Errorf("unsupported database driver: %s", driver)
}

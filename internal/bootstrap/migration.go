package bootstrap

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/pinbook/pinbook/internal/config"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigration(cfg config.AppConfig) error {
	switch cfg.DB.Driver {
	case "sqlite3":
		return runSqlite3Migrations(cfg)
	}

	return fmt.Errorf("unsupported database driver: %s", cfg.DB.Driver)
}

func runSqlite3Migrations(config config.AppConfig) error {
	db, err := sql.Open(config.DB.Driver, config.DB.DSN)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		log.Fatal(err)
	}

	migrateInstance, err := migrate.NewWithDatabaseInstance(
		config.DB.MigrationPath+config.DB.Driver,
		"main",
		driver,
	)

	if err != nil {
		return fmt.Errorf("Error creating migration instance: %w", err)
	}

	if err := migrateInstance.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("Error applying migrations: %w", err)
	}

	fmt.Println("Migrations applied successfully!")
	return nil
}

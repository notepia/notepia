package main

import (
	"log"
	"os"

	"github.com/pinbook/pinbook/internal/bootstrap"
	"github.com/pinbook/pinbook/internal/config"
	"github.com/pinbook/pinbook/internal/server"
)

func main() {
	cfg := config.LoadConfig()

	if err := bootstrap.RunMigration(cfg); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	db, err := bootstrap.NewDB(cfg.DB)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	storage := bootstrap.NewStorage(cfg.Storage)
	if storage == nil {
		log.Fatal("Failed to initialize storage")
	}

	e, err := server.New(cfg, db, storage)
	if err != nil {
		log.Fatalf("Failed to setup server: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := e.Start(":" + port); err != nil {
		e.Logger.Fatal(err)
	}
}

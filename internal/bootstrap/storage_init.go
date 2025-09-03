package bootstrap

import (
	"github.com/pinbook/pinbook/internal/config"
	"github.com/pinbook/pinbook/internal/storage"
	"github.com/pinbook/pinbook/internal/storage/localfile"
)

func NewStorage(cfg config.StorageConfig) storage.Storage {
	switch cfg.Type {
	case "local":
		return localfile.NewLocalFileStorage(cfg.Root)
	}

	return nil
}

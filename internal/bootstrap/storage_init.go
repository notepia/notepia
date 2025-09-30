package bootstrap

import (
	"fmt"

	"github.com/unsealdev/unseal/internal/config"
	"github.com/unsealdev/unseal/internal/storage"
	"github.com/unsealdev/unseal/internal/storage/localfile"
)

func NewStorage() (storage.Storage, error) {
	storageType := config.C.GetString(config.STORAGE_TYPE)
	storageRoot := config.C.GetString(config.STORAGE_ROOT)

	switch storageType {
	case "local":
		return localfile.NewLocalFileStorage(storageRoot), nil
	}

	return nil, fmt.Errorf("unsupported database driver: %s", storageType)
}

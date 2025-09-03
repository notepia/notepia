package config

type DatabaseConfig struct {
	Driver        string
	DSN           string
	MaxIdle       int
	MaxOpen       int
	MigrationPath string
}

type StorageConfig struct {
	Type string
	Root string
}

type ServerConfig struct {
	ApiRootPath string
	Port        string
	Timeout     int
}

type AppConfig struct {
	DB      DatabaseConfig
	Storage StorageConfig
	Server  ServerConfig
}

func LoadConfig() AppConfig {
	return AppConfig{
		DB: DatabaseConfig{
			Driver:        "sqlite3",
			DSN:           "bin/pinbook.db",
			MaxIdle:       10,
			MaxOpen:       100,
			MigrationPath: "file://migrations/",
		},
		Storage: StorageConfig{
			Type: "local",
			Root: "./bin/uploads/",
		},
		Server: ServerConfig{
			ApiRootPath: "/api/v1",
		},
	}
}

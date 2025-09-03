package storage

import "io"

type Storage interface {
	Save(segments []string, reader io.Reader) error
	Load(segments []string) (io.ReadCloser, error)
	Delete(segments []string) error
}

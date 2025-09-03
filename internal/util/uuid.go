package util

import "github.com/google/uuid"

func NewId() string {
	uuid, err := uuid.NewV7()

	if err != nil {
		return err.Error()
	}
	return uuid.String()
}

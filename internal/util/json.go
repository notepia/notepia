package util

import (
	"encoding/json"
)

// ParseJSONStringArray parses JSON string array
func ParseJSONStringArray(data []byte) []string {
	if len(data) == 0 {
		return []string{}
	}

	var result []string
	if err := json.Unmarshal(data, &result); err != nil {
		return []string{}
	}
	return result
}

// ToJSONStringArray converts string array to JSON string
func ToJSONStringArray(arr []string) []byte {
	if len(arr) == 0 {
		return []byte("[]")
	}

	result, err := json.Marshal(arr)
	if err != nil {
		return []byte("[]")
	}
	return result
}

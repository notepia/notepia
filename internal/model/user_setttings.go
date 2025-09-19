package model

type UserSettings struct {
	UserID    string
	OpenAIKey string `gorm:"column:openai_api_key"`
	GEMINIKey string `gorm:"column:gemini_api_key"`
	CreatedAt int64
}

package textgen

type Model struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Provider string `json:"provider"`
}

type GenerateRequest struct {
	Provider string `json:"provider" validate:"required"`
	Model    string `json:"model" validate:"required"`
	Prompt   string `json:"prompt" validate:"required"`
}

type GenerateResponse struct {
	Output string `json:"output"`
}

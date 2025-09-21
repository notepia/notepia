package textgen

type Model struct {
	ID       string
	Name     string
	Provider string
}

type GenerateRequest struct {
	Model  string `validate:"required"`
	Prompt string `validate:"required"`
}

type GenerateResponse struct {
	Text string
}

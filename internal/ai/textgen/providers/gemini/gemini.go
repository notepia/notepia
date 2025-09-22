package gemini

import (
	"context"

	"github.com/pinbook/pinbook/internal/ai/textgen"
	"google.golang.org/genai"
)

type GeminiTextGen struct {
	apiKey string
}

func NewGeminiTextGen(apiKey string) GeminiTextGen {
	return GeminiTextGen{apiKey: apiKey}
}

func (g GeminiTextGen) Name() string {
	return "gemini"
}

func (g GeminiTextGen) ListModels() ([]textgen.Model, error) {
	// client, err := genai.NewClient(context.Background(), &genai.ClientConfig{
	// 	APIKey:  g.apiKey,
	// 	Backend: genai.BackendGeminiAPI,
	// })
	// if err != nil {
	// 	return nil, err
	// }
	// res, err := client.Models.List(context.Background(), &genai.ListModelsConfig{})
	// if err != nil {
	// 	return nil, err
	// }
	var models []textgen.Model

	// for _, m := range res.Items {
	// 	for _, action := range m.SupportedActions {
	// 		if action == "generateContent" {
	// 			models = append(models, textgen.Model{ID: m.DisplayName, Name: m.DisplayName, Provider: "gemini"})
	// 		}
	// 	}
	// }

	models = append(models, textgen.Model{ID: "gemini-2.5-pro", Name: "gemini-2.5-pro", Provider: g.Name()})
	models = append(models, textgen.Model{ID: "gemini-2.5-flash", Name: "gemini-2.5-flash", Provider: g.Name()})
	models = append(models, textgen.Model{ID: "gemini-2.5-flash-lite", Name: "gemini-2.5-flash-lite", Provider: g.Name()})

	return models, nil
}

func (g GeminiTextGen) Generate(req textgen.GenerateRequest) (*textgen.GenerateResponse, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  g.apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, err
	}

	result, err := client.Models.GenerateContent(
		ctx,
		req.Model,
		genai.Text(req.Prompt),
		nil,
	)
	if err != nil {
		return nil, err
	}

	return &textgen.GenerateResponse{Output: result.Text()}, nil
}

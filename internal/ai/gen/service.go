package gen

import "fmt"

// Service manages multiple AI generation providers organized by modality
type Service struct {
	// providers stores providers indexed by "provider:modality" key
	providers map[string]Provider
}

// providerKey creates a composite key from provider name and modality
func providerKey(providerName, modality string) string {
	return fmt.Sprintf("%s:%s", providerName, modality)
}

// NewService creates a new AI generation service with the given providers
func NewService(providers ...Provider) *Service {
	m := make(map[string]Provider)
	for _, p := range providers {
		key := providerKey(p.Name(), p.Modality())
		m[key] = p
	}
	return &Service{providers: m}
}

// ListModels returns all available models from all providers
func (s *Service) ListModels() ([]Model, error) {
	var all []Model
	seen := make(map[string]bool) // Deduplicate models by ID

	for _, p := range s.providers {
		models, err := p.ListModels()
		if err != nil {
			return nil, fmt.Errorf("failed to list models from provider %s: %w", p.Name(), err)
		}
		for _, model := range models {
			// Use composite key to deduplicate models
			modelKey := fmt.Sprintf("%s:%s:%s", model.Provider, model.ID, model.Modality)
			if !seen[modelKey] {
				all = append(all, model)
				seen[modelKey] = true
			}
		}
	}
	return all, nil
}

// Generate performs AI generation using the specified provider and modality
func (s *Service) Generate(req GenerateRequest) (*GenerateResponse, error) {
	if req.Modality == "" {
		return nil, fmt.Errorf("modality is required")
	}

	key := providerKey(req.Provider, req.Modality)
	p, ok := s.providers[key]
	if !ok {
		return nil, fmt.Errorf("provider not found: %s with modality %s", req.Provider, req.Modality)
	}

	return p.Generate(req)
}

// GetProvider returns a provider by name and modality
func (s *Service) GetProvider(name, modality string) (Provider, bool) {
	key := providerKey(name, modality)
	p, ok := s.providers[key]
	return p, ok
}

// ListProviders returns all registered provider names (deduplicated)
func (s *Service) ListProviders() []string {
	seen := make(map[string]bool)
	var names []string
	for _, p := range s.providers {
		if !seen[p.Name()] {
			names = append(names, p.Name())
			seen[p.Name()] = true
		}
	}
	return names
}

// ListModalities returns all registered modalities
func (s *Service) ListModalities() []string {
	seen := make(map[string]bool)
	var modalities []string
	for _, p := range s.providers {
		if !seen[p.Modality()] {
			modalities = append(modalities, p.Modality())
			seen[p.Modality()] = true
		}
	}
	return modalities
}
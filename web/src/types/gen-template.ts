export type Modality = 'text2text';

export interface GenTemplate {
  id: string;
  workspace_id: string;
  name: string;
  prompt: string;
  provider: string; // AI provider: openai, gemini, etc.
  model: string;
  modality: Modality;
  image_urls: string; // Comma-separated image URLs
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface CreateGenTemplateRequest {
  name: string;
  prompt: string;
  provider: string;
  model: string;
  modality: Modality;
  image_urls?: string; // Comma-separated image URLs
}

export interface UpdateGenTemplateRequest {
  name: string;
  prompt: string;
  provider: string;
  model: string;
  modality: Modality;
  image_urls?: string; // Comma-separated image URLs
}

export interface GenHistory {
  id: string;
  workspace_id: string;
  template_id: string;
  request_prompt: string;
  request_model: string;
  request_modality: string;
  request_image_urls: string; // Comma-separated image URLs
  response_content: string;
  response_error: string;
  created_at: string;
  created_by: string;
}

export interface GenerateFromTemplateRequest {
  template_id: string;
  prompt: string;
  image_urls?: string[];
}

export interface GenerateFromTemplateResponse {
  history_id: string;
  content: string;
  error: string;
}

export interface GenModel {
  id: string;
  name: string;
  provider: string;
  provider_display_name: string;
  modality: Modality;
  description?: string;
}
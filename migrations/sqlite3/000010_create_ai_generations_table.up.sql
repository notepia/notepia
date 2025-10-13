CREATE TABLE ai_generations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  modality TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Request fields
  request_prompt TEXT NOT NULL,
  request_system_prompt TEXT,
  request_image_urls TEXT,  -- JSON array

  -- Response fields
  response_text TEXT,
  response_image_url TEXT,

  -- Error tracking
  error_message TEXT,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_modality ON ai_generations(modality);
CREATE INDEX idx_ai_generations_created_at ON ai_generations(created_at);
CREATE TABLE user_gencommands (
  id TEXT  PRIMARY KEY,
  user_id TEXT ,
  name TEXT,
  menu_type TEXT,
  prompt TEXT,
  modality TEXT,
  model TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
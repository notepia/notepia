CREATE TABLE "blocks" (
    "workspace_id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "id" TEXT PRIMARY KEY,
    "type" TEXT NOT NULL,
    "data" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
    FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE
);
CREATE INDEX "idx_blocks_note_id" ON "blocks" ("note_id");
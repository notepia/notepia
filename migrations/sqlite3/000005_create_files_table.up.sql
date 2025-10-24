CREATE TABLE `files` (
    `workspace_id` text NOT NULL,
    `id` text,
    `name` text,
    `original_filename` text,
    `size` integer,
    `ext` text,
    `visibility` text,
    `created_by` text,
    `created_at` text,
    `updated_by` text,
    `updated_at` text,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_files_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE
);
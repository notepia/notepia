CREATE TABLE `gen_templates` (
    `workspace_id` text,
    `id` text,
    `name` text,
    `prompt` text,
    `provider` text NOT NULL,
    `model` text,
    `modality` text,
    `image_urls` text,
    `created_at` text,                                 
    `created_by` text,
    `updated_at` text,
    `updated_by` text,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_gen_templates_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE
);
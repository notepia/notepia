CREATE TABLE `workspace_users` (
    `user_id` text,
    `workspace_id` text,
    `role` text,
    `created_by` text,
    `created_at` text,
    `updated_at` text,
    `updated_by` text,
    CONSTRAINT `fk_workspace_users_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_workspace_users_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE
);
CREATE TABLE `users` (
    `id` text,
    `email` text NOT NULL,
    `name` text NOT NULL,
    `password_hash` text NOT NULL,
    `role` text NOT NULL,
    `avatar_url` text,
    `disabled` integer DEFAULT 0,
    `created_by` text,
    `created_at` text,
    `updated_by` text,
    `updated_at` text,
    PRIMARY KEY (`id`),
    CONSTRAINT `uni_users_email` UNIQUE (`email`),
    CONSTRAINT `uni_users_name` UNIQUE (`name`)
);
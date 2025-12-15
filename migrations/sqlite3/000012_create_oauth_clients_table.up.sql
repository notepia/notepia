CREATE TABLE `oauth_clients` (
    `id` text,
    `user_id` text NOT NULL,
    `name` text NOT NULL,
    `client_id` text NOT NULL,
    `client_secret_hash` text NOT NULL,
    `client_secret_prefix` text NOT NULL,
    `redirect_uris` text NOT NULL,
    `description` text,
    `created_at` text NOT NULL,
    `updated_at` text NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_oauth_clients_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `uni_oauth_clients_client_id` UNIQUE (`client_id`),
    CONSTRAINT `uni_oauth_clients_client_secret_prefix` UNIQUE (`client_secret_prefix`)
);

CREATE INDEX `idx_oauth_clients_user_id` ON `oauth_clients` (`user_id`);
CREATE INDEX `idx_oauth_clients_client_id` ON `oauth_clients` (`client_id`);
CREATE INDEX `idx_oauth_clients_client_secret_prefix` ON `oauth_clients` (`client_secret_prefix`);

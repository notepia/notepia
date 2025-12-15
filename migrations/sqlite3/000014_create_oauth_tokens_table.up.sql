CREATE TABLE `oauth_tokens` (
    `id` text,
    `access_token_hash` text NOT NULL,
    `access_token_prefix` text NOT NULL,
    `refresh_token_hash` text NOT NULL,
    `refresh_token_prefix` text NOT NULL,
    `client_id` text NOT NULL,
    `user_id` text NOT NULL,
    `access_token_expires_at` text NOT NULL,
    `refresh_token_expires_at` text NOT NULL,
    `revoked` integer NOT NULL DEFAULT 0,
    `last_used_at` text,
    `created_at` text NOT NULL,
    `updated_at` text NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_oauth_tokens_client` FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`client_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_oauth_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `uni_oauth_tokens_access_token_prefix` UNIQUE (`access_token_prefix`),
    CONSTRAINT `uni_oauth_tokens_refresh_token_prefix` UNIQUE (`refresh_token_prefix`)
);

CREATE INDEX `idx_oauth_tokens_access_token_prefix` ON `oauth_tokens` (`access_token_prefix`);
CREATE INDEX `idx_oauth_tokens_refresh_token_prefix` ON `oauth_tokens` (`refresh_token_prefix`);
CREATE INDEX `idx_oauth_tokens_client_id` ON `oauth_tokens` (`client_id`);
CREATE INDEX `idx_oauth_tokens_user_id` ON `oauth_tokens` (`user_id`);

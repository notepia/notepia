CREATE TABLE `oauth_authorization_codes` (
    `id` text,
    `code` text NOT NULL,
    `client_id` text NOT NULL,
    `user_id` text NOT NULL,
    `redirect_uri` text NOT NULL,
    `code_challenge` text,
    `code_challenge_method` text,
    `expires_at` text NOT NULL,
    `used` integer NOT NULL DEFAULT 0,
    `created_at` text NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_oauth_authorization_codes_client` FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`client_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_oauth_authorization_codes_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `uni_oauth_authorization_codes_code` UNIQUE (`code`)
);

CREATE INDEX `idx_oauth_authorization_codes_code` ON `oauth_authorization_codes` (`code`);
CREATE INDEX `idx_oauth_authorization_codes_client_id` ON `oauth_authorization_codes` (`client_id`);
CREATE INDEX `idx_oauth_authorization_codes_user_id` ON `oauth_authorization_codes` (`user_id`);
CREATE INDEX `idx_oauth_authorization_codes_expires_at` ON `oauth_authorization_codes` (`expires_at`);

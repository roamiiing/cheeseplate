CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tag` text NOT NULL,
	`chat_id` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_tag_chat_unique` ON `tags` (`tag`,`chat_id`);--> statement-breakpoint
CREATE INDEX `tags_chat_idx` ON `tags` (`chat_id`);--> statement-breakpoint
CREATE TABLE `user_tags` (
	`user_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_tags_pair_unique` ON `user_tags` (`user_id`,`tag_id`);--> statement-breakpoint
CREATE INDEX `user_tags_user_idx` ON `user_tags` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_tags_tag_idx` ON `user_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`telegram_id` integer NOT NULL,
	`chat_id` integer NOT NULL,
	`display_name` text NOT NULL,
	`telegram_username` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_chat_unique` ON `users` (`telegram_id`,`chat_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_display_chat_unique` ON `users` (`display_name`,`chat_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_chat_unique` ON `users` (`telegram_username`,`chat_id`);--> statement-breakpoint
CREATE INDEX `users_chat_idx` ON `users` (`chat_id`);
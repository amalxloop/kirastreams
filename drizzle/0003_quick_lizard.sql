CREATE TABLE `content_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_id` text NOT NULL,
	`content_type` text NOT NULL,
	`theme_name` text NOT NULL,
	`primary_color` text NOT NULL,
	`secondary_color` text NOT NULL,
	`accent_color` text NOT NULL,
	`gradient_from` text,
	`gradient_to` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skip_timestamps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_id` text NOT NULL,
	`content_type` text NOT NULL,
	`intro_start` integer,
	`intro_end` integer,
	`outro_start` integer,
	`outro_end` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `watch_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`content_id` text NOT NULL,
	`content_type` text NOT NULL,
	`title` text NOT NULL,
	`poster_path` text,
	`watched_at` integer NOT NULL,
	`progress_seconds` integer DEFAULT 0 NOT NULL,
	`total_seconds` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `watch_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`content_id` text NOT NULL,
	`content_type` text NOT NULL,
	`progress_seconds` integer DEFAULT 0 NOT NULL,
	`total_seconds` integer NOT NULL,
	`last_watched_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

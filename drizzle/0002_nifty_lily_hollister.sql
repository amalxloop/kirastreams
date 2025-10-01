CREATE TABLE `admin_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform_name` text DEFAULT 'KiraStreams' NOT NULL,
	`logo_url` text,
	`primary_color` text DEFAULT '#8b5cf6' NOT NULL,
	`cdn_base_url` text,
	`watermark_enabled` integer DEFAULT false,
	`theme` text DEFAULT 'dark' NOT NULL,
	`updated_at` text NOT NULL
);

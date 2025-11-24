ALTER TABLE `admin_settings` ADD `site_tagline` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `seo_description` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `seo_keywords` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `favicon_url` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `banner_message` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `banner_enabled` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `contact_email` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `twitter_url` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `facebook_url` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `instagram_url` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `discord_url` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `footer_text` text;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `enable_registration` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `admin_settings` ADD `maintenance_mode` integer DEFAULT false;
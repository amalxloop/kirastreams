import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Users table with admin role management
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'), // 'user', 'admin'
  status: text('status').notNull().default('active'), // 'active', 'banned'
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Content table for movies and TV series
export const content = sqliteTable('content', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'movie', 'tv'
  genre: text('genre', { mode: 'json' }), // JSON array of genres
  language: text('language').notNull().default('en'),
  thumbnailUrl: text('thumbnail_url'),
  posterUrl: text('poster_url'),
  trailerUrl: text('trailer_url'),
  videoUrl: text('video_url'),
  subtitleUrls: text('subtitle_urls', { mode: 'json' }), // JSON object
  tmdbId: integer('tmdb_id'),
  releaseDate: text('release_date'),
  duration: integer('duration'), // minutes
  status: text('status').notNull().default('draft'), // 'published', 'draft'
  viewCount: integer('view_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Analytics table for tracking user viewing behavior
export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  contentId: integer('content_id').references(() => content.id),
  watchDuration: integer('watch_duration'), // seconds
  completed: integer('completed', { mode: 'boolean' }).default(false),
  deviceType: text('device_type'),
  createdAt: text('created_at').notNull(),
});

// Platform settings table for configuration
export const platformSettings = sqliteTable('platform_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value', { mode: 'json' }),
  category: text('category').notNull(), // 'branding', 'config', 'theme'
  updatedAt: text('updated_at').notNull(),
});

// Add admins table
export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: text('created_at').notNull(),
  lastLoginAt: text('last_login_at'),
});

// Add admin_settings table
export const adminSettings = sqliteTable('admin_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  platformName: text('platform_name').notNull().default('KiraStreams'),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').notNull().default('#8b5cf6'),
  cdnBaseUrl: text('cdn_base_url'),
  watermarkEnabled: integer('watermark_enabled', { mode: 'boolean' }).default(false),
  theme: text('theme').notNull().default('dark'),
  updatedAt: text('updated_at').notNull(),
});
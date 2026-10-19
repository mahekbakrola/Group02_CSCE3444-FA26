CREATE TABLE `ai_operations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`operation` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ai_user_time` ON `ai_operations` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `bullet_sources` (
	`profile_id` text NOT NULL,
	`bullet_id` text NOT NULL,
	`fact_id` text NOT NULL,
	`source_revision` integer NOT NULL,
	PRIMARY KEY(`profile_id`, `bullet_id`, `fact_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bullets` (
	`profile_id` text NOT NULL,
	`id` text NOT NULL,
	`resume_id` text NOT NULL,
	`position` integer NOT NULL,
	`data` text NOT NULL,
	PRIMARY KEY(`profile_id`, `id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`profile_id` text NOT NULL,
	`id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`dates` text NOT NULL,
	PRIMARY KEY(`profile_id`, `id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `facts` (
	`profile_id` text NOT NULL,
	`id` text NOT NULL,
	`entity_id` text NOT NULL,
	`question_id` text NOT NULL,
	`value` text NOT NULL,
	`confirmed` integer NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`profile_id`, `id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `resume_history` (
	`profile_id` text NOT NULL,
	`id` text NOT NULL,
	`resume_id` text NOT NULL,
	`data` text NOT NULL,
	PRIMARY KEY(`profile_id`, `id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`mode` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`write_token` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_profiles_user` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `resumes` (
	`profile_id` text NOT NULL,
	`id` text NOT NULL,
	`data` text NOT NULL,
	PRIMARY KEY(`profile_id`, `id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `saved_jobs` (
	`profile_id` text NOT NULL,
	`job_id` text NOT NULL,
	PRIMARY KEY(`profile_id`, `job_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);

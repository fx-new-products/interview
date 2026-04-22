CREATE TABLE `interview_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`interview_id` integer NOT NULL,
	`question_key` text NOT NULL,
	`score` integer,
	`note` text,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_interview_question` ON `interview_scores` (`interview_id`,`question_key`);--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`calendar_event_id` text,
	`candidate_initials` text NOT NULL,
	`candidate_hash` text NOT NULL,
	`stage` text,
	`location` text,
	`position` text,
	`scheduled_at` integer NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`interviewer_initials` text,
	`decision` text,
	`good_notes` text,
	`concern_notes` text,
	`availability_notes` text,
	`overall_ai_aptitude` integer,
	`overall_communication` integer,
	`overall_total` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interviews_calendar_event_id_unique` ON `interviews` (`calendar_event_id`);
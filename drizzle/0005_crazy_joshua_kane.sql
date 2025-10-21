ALTER TABLE `readings` ADD `name` varchar(255);--> statement-breakpoint
ALTER TABLE `readings` ADD `gender` enum('male','female','unknown') DEFAULT 'unknown' NOT NULL;
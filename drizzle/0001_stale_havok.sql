CREATE TABLE `feedback` (
	`id` varchar(64) NOT NULL,
	`readingId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`overallRating` int,
	`featureAccuracy` text,
	`lifeAspectAccuracy` text,
	`specificFeedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` varchar(64) NOT NULL,
	`readingId` varchar(64) NOT NULL,
	`imageType` enum('frontal_neutral','frontal_smile','left_profile','right_profile','three_quarter_left','three_quarter_right','closeup_eyes','closeup_nose','closeup_mouth','closeup_ears') NOT NULL,
	`filePath` varchar(512) NOT NULL,
	`qualityScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `readings` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`modelVersion` varchar(64) NOT NULL DEFAULT 'v1.0',
	`status` enum('pending','uploading','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`executiveSummary` text,
	`detailedAnalysis` text,
	`pdfPath` varchar(512),
	`accuracyRating` int,
	`errorMessage` text,
	CONSTRAINT `readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` varchar(64) NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_key_unique` UNIQUE(`key`)
);

CREATE TABLE `advancedAnalysis` (
	`id` varchar(64) NOT NULL,
	`readingId` varchar(64) NOT NULL,
	`executiveSummary` text,
	`detailedAnalysis` text,
	`stunningInsights` text,
	`moleAnalysis` text,
	`compatibilityAnalysis` text,
	`decadeTimeline` text,
	`pdfPath` varchar(512),
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `advancedAnalysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `advancedImages` (
	`id` varchar(64) NOT NULL,
	`readingId` varchar(64) NOT NULL,
	`imageType` varchar(50) NOT NULL,
	`filePath` varchar(512) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `advancedImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `advancedReadings` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`gender` enum('male','female','other') NOT NULL,
	`dateOfBirth` varchar(20),
	`status` enum('pending','uploading','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	`errorMessage` text,
	CONSTRAINT `advancedReadings_id` PRIMARY KEY(`id`)
);

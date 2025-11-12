CREATE TABLE `advancedImages` (
	`id` varchar(64) NOT NULL,
	`advancedReadingId` varchar(64) NOT NULL,
	`imageType` enum('frontal_neutral','frontal_smile','left_profile','right_profile','three_quarter_left','three_quarter_right','closeup_eyes','closeup_nose','closeup_mouth','closeup_left_ear','closeup_right_ear') NOT NULL,
	`filePath` varchar(512) NOT NULL,
	`qualityScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `advancedImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `advancedReadings` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`name` varchar(255),
	`gender` enum('male','female','unknown') NOT NULL DEFAULT 'unknown',
	`status` enum('pending','uploading','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`executiveSummary` text,
	`detailedAnalysis` text,
	`stunningInsights` text,
	`moleAnalysis` text,
	`compatibilityAnalysis` text,
	`decadeTimeline` text,
	`pdfPath` varchar(512),
	`accuracyRating` int,
	`errorMessage` text,
	`processingTimeSeconds` int,
	`tokensUsed` int,
	CONSTRAINT `advancedReadings_id` PRIMARY KEY(`id`)
);

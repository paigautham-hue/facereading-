CREATE TABLE `aiModelLogs` (
	`id` varchar(64) NOT NULL,
	`readingId` varchar(64),
	`modelName` enum('gemini-2.5-pro','gpt-5','grok-4') NOT NULL,
	`operation` enum('vision_analysis','face_reading','stunning_insights') NOT NULL,
	`status` enum('success','failure') NOT NULL,
	`responseTime` int,
	`confidenceScore` int,
	`tokensUsed` int,
	`errorMessage` text,
	`errorStack` text,
	`requestData` text,
	`responseData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiModelLogs_id` PRIMARY KEY(`id`)
);

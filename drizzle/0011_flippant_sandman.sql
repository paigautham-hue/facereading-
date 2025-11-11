ALTER TABLE `readings` MODIFY COLUMN `executiveSummary` mediumtext;--> statement-breakpoint
ALTER TABLE `readings` MODIFY COLUMN `detailedAnalysis` mediumtext;--> statement-breakpoint
ALTER TABLE `readings` MODIFY COLUMN `stunningInsights` mediumtext;--> statement-breakpoint
ALTER TABLE `readings` DROP COLUMN `userEmail`;--> statement-breakpoint
ALTER TABLE `readings` DROP COLUMN `emailSent`;
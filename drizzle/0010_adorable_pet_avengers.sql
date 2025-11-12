ALTER TABLE `readings` ADD `userEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `readings` ADD `emailSent` boolean DEFAULT false;
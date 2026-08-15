ALTER TABLE `visitor_feedback` MODIFY COLUMN `comment` text;--> statement-breakpoint
ALTER TABLE `site_comments` ADD `visitorId` varchar(64);--> statement-breakpoint
ALTER TABLE `site_comments` ADD `deletedAt` timestamp;
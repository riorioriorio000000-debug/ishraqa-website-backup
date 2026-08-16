CREATE TABLE `comment_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageKey` varchar(160) NOT NULL,
	`commentId` int NOT NULL,
	`parentReplyId` int,
	`visitorId` varchar(64) NOT NULL,
	`displayName` varchar(64) NOT NULL,
	`avatarKind` varchar(32) NOT NULL DEFAULT 'wave',
	`avatarUrl` varchar(1024),
	`body` text NOT NULL,
	`status` enum('pending','published','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `comment_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_reply_reactions` (
	`id` varchar(160) NOT NULL,
	`replyId` int NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`reaction` enum('heart','broken') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comment_reply_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterVisitorId` varchar(64) NOT NULL,
	`targetType` enum('comment','reply') NOT NULL,
	`targetId` int NOT NULL,
	`reason` enum('abuse','illegal','profile','name','other') NOT NULL,
	`details` varchar(700),
	`status` enum('pending','actioned','dismissed','recheck_requested') NOT NULL DEFAULT 'pending',
	`aiVerdict` enum('remove_and_restrict','no_violation','needs_review'),
	`aiSummary` varchar(900),
	`recheckCount` int NOT NULL DEFAULT 0,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_reports_reporter_target_unique` UNIQUE(`reporterVisitorId`,`targetType`,`targetId`)
);
--> statement-breakpoint
CREATE TABLE `content_restrictions` (
	`visitorId` varchar(64) NOT NULL,
	`sourceReportId` int NOT NULL,
	`reason` varchar(900) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`restrictedAt` timestamp NOT NULL DEFAULT (now()),
	`liftedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_restrictions_visitorId` PRIMARY KEY(`visitorId`)
);
--> statement-breakpoint
CREATE TABLE `site_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`type` enum('reply','reaction','comment_published','comment_deleted','comment_reverted','comment_restricted','report_review') NOT NULL,
	`title` varchar(160) NOT NULL,
	`message` varchar(900) NOT NULL,
	`targetPath` varchar(280),
	`entityType` enum('comment','reply','report','system'),
	`entityId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `comment_replies_comment_created_idx` ON `comment_replies` (`commentId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `comment_replies_parent_idx` ON `comment_replies` (`parentReplyId`);--> statement-breakpoint
CREATE INDEX `content_reports_status_created_idx` ON `content_reports` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `content_restrictions_report_idx` ON `content_restrictions` (`sourceReportId`);--> statement-breakpoint
CREATE INDEX `site_notifications_visitor_created_idx` ON `site_notifications` (`visitorId`,`createdAt`);
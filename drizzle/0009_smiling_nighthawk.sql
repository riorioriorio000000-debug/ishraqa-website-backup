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

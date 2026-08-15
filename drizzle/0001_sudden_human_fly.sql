CREATE TABLE `comment_reactions` (
	`id` varchar(160) NOT NULL,
	`commentId` int NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`reaction` enum('heart','broken') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comment_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageKey` varchar(160) NOT NULL,
	`displayName` varchar(64) NOT NULL,
	`avatarKind` varchar(32) NOT NULL DEFAULT 'wave',
	`avatarUrl` varchar(1024),
	`body` text NOT NULL,
	`status` enum('pending','published','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_visitors` (
	`visitorId` varchar(64) NOT NULL,
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`visitCount` int NOT NULL DEFAULT 1,
	CONSTRAINT `site_visitors_visitorId` PRIMARY KEY(`visitorId`)
);

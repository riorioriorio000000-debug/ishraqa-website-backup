CREATE TABLE `article_feedback` (
	`id` varchar(240) NOT NULL,
	`pageKey` varchar(160) NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`rating` int NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `article_feedback_id` PRIMARY KEY(`id`)
);

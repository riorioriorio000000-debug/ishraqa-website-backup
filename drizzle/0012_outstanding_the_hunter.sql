CREATE TABLE `video_likes` (
	`id` varchar(240) NOT NULL,
	`videoKey` varchar(160) NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `video_likes_visitor_unique` UNIQUE(`videoKey`,`visitorId`)
);
--> statement-breakpoint
CREATE INDEX `video_likes_key_idx` ON `video_likes` (`videoKey`);
CREATE TABLE `video_views` (
	`id` varchar(240) NOT NULL,
	`videoKey` varchar(160) NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_views_id` PRIMARY KEY(`id`),
	CONSTRAINT `video_views_visitor_unique` UNIQUE(`videoKey`,`visitorId`)
);
--> statement-breakpoint
CREATE INDEX `video_views_key_idx` ON `video_views` (`videoKey`);
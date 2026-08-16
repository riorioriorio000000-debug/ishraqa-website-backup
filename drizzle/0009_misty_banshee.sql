CREATE TABLE `visitor_notification_preferences` (
	`visitorId` varchar(64) NOT NULL,
	`reactionNotificationsEnabled` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visitor_notification_preferences_visitorId` PRIMARY KEY(`visitorId`)
);

CREATE TABLE `recommendation_filter_metrics` (
	`id` varchar(196) NOT NULL,
	`service` enum('cleaning','maintenance','moving','general') NOT NULL,
	`city` varchar(96),
	`uses` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommendation_filter_metrics_id` PRIMARY KEY(`id`)
);

CREATE TABLE `assistant_answer_feedback` (
	`id` varchar(64) NOT NULL,
	`rating` int NOT NULL,
	`service` enum('cleaning','maintenance','moving','general') NOT NULL,
	`city` varchar(96),
	`contentCardIds` varchar(512) NOT NULL DEFAULT '',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assistant_answer_feedback_id` PRIMARY KEY(`id`)
);

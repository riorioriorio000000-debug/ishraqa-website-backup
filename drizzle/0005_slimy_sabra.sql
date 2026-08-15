CREATE TABLE `service_page_metrics` (
	`pagePath` varchar(96) NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_page_metrics_pagePath` PRIMARY KEY(`pagePath`)
);

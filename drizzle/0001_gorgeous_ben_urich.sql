CREATE TABLE `gpus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelName` varchar(255) NOT NULL,
	`manufacturer` varchar(100),
	`vramCapacityGB` float NOT NULL,
	`architecture` varchar(100),
	`releaseYear` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gpus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modelHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`modelName` varchar(500),
	`modelSource` varchar(50),
	`totalParameters` varchar(50),
	`numLayers` int,
	`hiddenSize` int,
	`numAttentionHeads` int,
	`numKvHeads` int,
	`headDim` int,
	`attentionType` varchar(20),
	`quantization` varchar(20),
	`batchSize` int,
	`seqLength` int,
	`systemOverheadPercent` float,
	`gpuModelId` int,
	`configJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modelHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `modelHistory` ADD CONSTRAINT `modelHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `modelHistory` ADD CONSTRAINT `modelHistory_gpuModelId_gpus_id_fk` FOREIGN KEY (`gpuModelId`) REFERENCES `gpus`(`id`) ON DELETE no action ON UPDATE no action;
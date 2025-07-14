-- Game Server Communication Database Migration Script
-- For Darknet Duel - July 14, 2025

-- --------------------------------------------------------
--
-- Table structure for table `player_ratings`
-- Stores ELO ratings and statistics for players by game mode
--

CREATE TABLE IF NOT EXISTS `player_ratings` (
  `id` VARCHAR(36) NOT NULL,
  `accountId` VARCHAR(36) NOT NULL,
  `rating` INT NOT NULL DEFAULT 1200,
  `gamesPlayed` INT NOT NULL DEFAULT 0,
  `wins` INT NOT NULL DEFAULT 0,
  `losses` INT NOT NULL DEFAULT 0,
  `gameMode` VARCHAR(50) NOT NULL DEFAULT 'standard',
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_account_gamemode` (`accountId`, `gameMode`),
  CONSTRAINT `FK_player_ratings_accounts` FOREIGN KEY (`accountId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
--
-- Table structure for table `game_results`
-- Stores high-level information about completed games
--

CREATE TABLE IF NOT EXISTS `game_results` (
  `id` VARCHAR(36) NOT NULL,
  `gameId` VARCHAR(36) NOT NULL,
  `winnerId` VARCHAR(36),
  `winnerRole` VARCHAR(50),
  `gameMode` VARCHAR(50) NOT NULL DEFAULT 'standard',
  `turnCount` INT NOT NULL DEFAULT 0,
  `startTime` DATETIME NOT NULL,
  `endTime` DATETIME NOT NULL,
  `abandonReason` VARCHAR(50),
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_game_id` (`gameId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
--
-- Table structure for table `game_players`
-- Links players to games and stores their performance
--

CREATE TABLE IF NOT EXISTS `game_players` (
  `id` VARCHAR(36) NOT NULL,
  `gameId` VARCHAR(36) NOT NULL,
  `accountId` VARCHAR(36) NOT NULL,
  `playerRole` VARCHAR(50) NOT NULL,
  `isWinner` BOOLEAN NOT NULL DEFAULT FALSE,
  `ratingBefore` INT,
  `ratingAfter` INT,
  `ratingChange` INT,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_game_players_game` (`gameId`),
  KEY `IDX_game_players_account` (`accountId`),
  CONSTRAINT `FK_game_players_game_results` FOREIGN KEY (`gameId`) REFERENCES `game_results` (`gameId`) ON DELETE CASCADE,
  CONSTRAINT `FK_game_players_accounts` FOREIGN KEY (`accountId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
--
-- Table structure for table `rating_history`
-- Tracks rating changes over time for analytics
--

CREATE TABLE IF NOT EXISTS `rating_history` (
  `id` VARCHAR(36) NOT NULL,
  `accountId` VARCHAR(36) NOT NULL,
  `gameId` VARCHAR(36) NOT NULL,
  `gameMode` VARCHAR(50) NOT NULL,
  `ratingBefore` INT NOT NULL,
  `ratingAfter` INT NOT NULL,
  `ratingChange` INT NOT NULL,
  `timestamp` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_rating_history_account` (`accountId`),
  KEY `IDX_rating_history_game` (`gameId`),
  CONSTRAINT `FK_rating_history_accounts` FOREIGN KEY (`accountId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_rating_history_game_results` FOREIGN KEY (`gameId`) REFERENCES `game_results` (`gameId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
--
-- Modify existing accounts table to add rating fields
-- This is a safe modification that adds columns without affecting existing data
--

-- Simple ALTER TABLE statements
-- Note: These might show warnings if columns already exist, but won't cause errors
ALTER TABLE `accounts` ADD COLUMN `rating` INT NOT NULL DEFAULT 1200 AFTER `gamesWon`;
ALTER TABLE `accounts` ADD COLUMN `gamesLost` INT NOT NULL DEFAULT 0 AFTER `gamesWon`;

-- --------------------------------------------------------
--
-- Seed initial ratings for existing users
-- Creates default rating entries for all existing accounts
--

INSERT INTO `player_ratings` (`id`, `accountId`, `rating`, `gameMode`)
SELECT 
  UUID(), 
  `id`, 
  1200, 
  'standard'
FROM `accounts`
WHERE NOT EXISTS (
  SELECT 1 FROM `player_ratings` 
  WHERE `player_ratings`.`accountId` = `accounts`.`id` 
  AND `player_ratings`.`gameMode` = 'standard'
);

-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Jul 13, 2025 at 08:36 PM
-- Server version: 9.3.0
-- PHP Version: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `darknet_duel`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `lastLogin` datetime DEFAULT NULL,
  `gamesPlayed` int NOT NULL DEFAULT '0',
  `gamesWon` int NOT NULL DEFAULT '0',
  `gamesLost` int NOT NULL DEFAULT '0',
  `rating` int NOT NULL DEFAULT '1200',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `email`, `username`, `password`, `isActive`, `lastLogin`, `gamesPlayed`, `gamesWon`, `gamesLost`, `rating`, `createdAt`, `updatedAt`) VALUES
('4e93f3b0-2882-4cf6-811c-32ae94fc2992', 'a@a.com', 'briangwapo81', '$2b$10$P/MOge2942srupvv.FcAHemEUyKMNPS9Oc83wdiJmfUWKBe4fb9NC', 1, '2025-07-14 03:26:29', 0, 0, 0, 1200, '2025-06-19 11:40:42.922391', '2025-07-13 19:26:28.000000'),
('5a89351e-5bc6-40fd-a8cb-8a223cf417ed', 'matthewechavez1@gmail.com', 'notshige', '$2b$10$UK1h9fQq0kPC.yseV3vHNO5LYi8xzPcIDv.HgiwBlcL5Ud5oVn3yW', 1, '2025-07-06 23:56:14', 0, 0, 0, 1200, '2025-07-06 15:56:13.975439', '2025-07-06 15:56:14.000000'),
('b22c9158-8276-455e-b12d-21d2885baf7c', 'b@b.com', 'ZenithZephyr', '$2b$10$oZQmQtG8sxHuJLFWvqzTGeYS0N2Lxgbv1qbjMb0zd.ZZrVxozULFW', 1, '2025-07-14 03:07:26', 0, 0, 0, 1200, '2025-07-13 19:07:26.076939', '2025-07-13 19:07:26.000000'),
('f51b207c-34d7-46e2-a3d7-aebc8b8b20c2', 'hahahaungguy@gmail.com', 'aetherrflare', '$2b$10$18kEvEIHruC6MrFAb46cbudKgFVfP1OousQqKgyEiXou75R0LTIQK', 1, '2025-07-13 19:34:10', 0, 0, 0, 1200, '2025-06-19 10:05:17.788221', '2025-07-13 11:34:10.000000'),
('fd031bf3-6957-4f2f-bfbd-6f36059dd252', 'c@c.com', 'coolkid63', '$2b$10$iTyB6N4BaqpWizCwvZlvbO1v7pEF.FggYQGK3Ibk.qNlbM2Wv0r42', 1, '2025-07-14 03:07:48', 0, 0, 0, 1200, '2025-07-13 19:07:47.642762', '2025-07-13 19:07:47.000000');

-- --------------------------------------------------------

--
-- Table structure for table `game_players`
--

CREATE TABLE `game_players` (
  `id` varchar(36) NOT NULL,
  `gameId` varchar(36) NOT NULL,
  `accountId` varchar(36) NOT NULL,
  `playerRole` varchar(50) NOT NULL,
  `isWinner` tinyint(1) NOT NULL DEFAULT '0',
  `ratingBefore` int DEFAULT NULL,
  `ratingAfter` int DEFAULT NULL,
  `ratingChange` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `game_results`
--

CREATE TABLE `game_results` (
  `id` varchar(36) NOT NULL,
  `gameId` varchar(36) NOT NULL,
  `winnerId` varchar(36) DEFAULT NULL,
  `winnerRole` varchar(50) DEFAULT NULL,
  `gameMode` varchar(50) NOT NULL DEFAULT 'standard',
  `turnCount` int NOT NULL DEFAULT '0',
  `startTime` datetime NOT NULL,
  `endTime` datetime NOT NULL,
  `abandonReason` varchar(50) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `player_ratings`
--

CREATE TABLE `player_ratings` (
  `id` varchar(36) NOT NULL,
  `accountId` varchar(36) NOT NULL,
  `rating` int NOT NULL DEFAULT '1200',
  `gamesPlayed` int NOT NULL DEFAULT '0',
  `wins` int NOT NULL DEFAULT '0',
  `losses` int NOT NULL DEFAULT '0',
  `gameMode` varchar(50) NOT NULL DEFAULT 'standard',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `player_ratings`
--

INSERT INTO `player_ratings` (`id`, `accountId`, `rating`, `gamesPlayed`, `wins`, `losses`, `gameMode`, `createdAt`, `updatedAt`) VALUES
('e88feaa5-6028-11f0-a3c3-6a270736dfaa', '4e93f3b0-2882-4cf6-811c-32ae94fc2992', 1200, 0, 0, 0, 'standard', '2025-07-13 20:35:26.498771', '2025-07-13 20:35:26.498771'),
('e88febcb-6028-11f0-a3c3-6a270736dfaa', 'b22c9158-8276-455e-b12d-21d2885baf7c', 1200, 0, 0, 0, 'standard', '2025-07-13 20:35:26.498771', '2025-07-13 20:35:26.498771'),
('e88febe4-6028-11f0-a3c3-6a270736dfaa', 'fd031bf3-6957-4f2f-bfbd-6f36059dd252', 1200, 0, 0, 0, 'standard', '2025-07-13 20:35:26.498771', '2025-07-13 20:35:26.498771'),
('e88fec01-6028-11f0-a3c3-6a270736dfaa', 'f51b207c-34d7-46e2-a3d7-aebc8b8b20c2', 1200, 0, 0, 0, 'standard', '2025-07-13 20:35:26.498771', '2025-07-13 20:35:26.498771'),
('e88fec15-6028-11f0-a3c3-6a270736dfaa', '5a89351e-5bc6-40fd-a8cb-8a223cf417ed', 1200, 0, 0, 0, 'standard', '2025-07-13 20:35:26.498771', '2025-07-13 20:35:26.498771');

-- --------------------------------------------------------

--
-- Table structure for table `rating_history`
--

CREATE TABLE `rating_history` (
  `id` varchar(36) NOT NULL,
  `accountId` varchar(36) NOT NULL,
  `gameId` varchar(36) NOT NULL,
  `gameMode` varchar(50) NOT NULL,
  `ratingBefore` int NOT NULL,
  `ratingAfter` int NOT NULL,
  `ratingChange` int NOT NULL,
  `timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_ee66de6cdc53993296d1ceb8aa` (`email`),
  ADD UNIQUE KEY `IDX_477e3187cedfb5a3ac121e899c` (`username`);

--
-- Indexes for table `game_players`
--
ALTER TABLE `game_players`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_game_players_game` (`gameId`),
  ADD KEY `IDX_game_players_account` (`accountId`);

--
-- Indexes for table `game_results`
--
ALTER TABLE `game_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_game_id` (`gameId`);

--
-- Indexes for table `player_ratings`
--
ALTER TABLE `player_ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_account_gamemode` (`accountId`,`gameMode`);

--
-- Indexes for table `rating_history`
--
ALTER TABLE `rating_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_rating_history_account` (`accountId`),
  ADD KEY `IDX_rating_history_game` (`gameId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `game_players`
--
ALTER TABLE `game_players`
  ADD CONSTRAINT `FK_game_players_accounts` FOREIGN KEY (`accountId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_game_players_game_results` FOREIGN KEY (`gameId`) REFERENCES `game_results` (`gameId`) ON DELETE CASCADE;

--
-- Constraints for table `player_ratings`
--
ALTER TABLE `player_ratings`
  ADD CONSTRAINT `FK_player_ratings_accounts` FOREIGN KEY (`accountId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rating_history`
--
ALTER TABLE `rating_history`
  ADD CONSTRAINT `FK_rating_history_accounts` FOREIGN KEY (`accountId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_rating_history_game_results` FOREIGN KEY (`gameId`) REFERENCES `game_results` (`gameId`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

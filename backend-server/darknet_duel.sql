-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Jul 13, 2025 at 08:08 PM
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
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `email`, `username`, `password`, `isActive`, `lastLogin`, `gamesPlayed`, `gamesWon`, `createdAt`, `updatedAt`) VALUES
('4e93f3b0-2882-4cf6-811c-32ae94fc2992', 'a@a.com', 'briangwapo81', '$2b$10$P/MOge2942srupvv.FcAHemEUyKMNPS9Oc83wdiJmfUWKBe4fb9NC', 1, '2025-07-14 03:26:29', 0, 0, '2025-06-19 11:40:42.922391', '2025-07-13 19:26:28.000000'),
('5a89351e-5bc6-40fd-a8cb-8a223cf417ed', 'matthewechavez1@gmail.com', 'notshige', '$2b$10$UK1h9fQq0kPC.yseV3vHNO5LYi8xzPcIDv.HgiwBlcL5Ud5oVn3yW', 1, '2025-07-06 23:56:14', 0, 0, '2025-07-06 15:56:13.975439', '2025-07-06 15:56:14.000000'),
('b22c9158-8276-455e-b12d-21d2885baf7c', 'b@b.com', 'ZenithZephyr', '$2b$10$oZQmQtG8sxHuJLFWvqzTGeYS0N2Lxgbv1qbjMb0zd.ZZrVxozULFW', 1, '2025-07-14 03:07:26', 0, 0, '2025-07-13 19:07:26.076939', '2025-07-13 19:07:26.000000'),
('f51b207c-34d7-46e2-a3d7-aebc8b8b20c2', 'hahahaungguy@gmail.com', 'aetherrflare', '$2b$10$18kEvEIHruC6MrFAb46cbudKgFVfP1OousQqKgyEiXou75R0LTIQK', 1, '2025-07-13 19:34:10', 0, 0, '2025-06-19 10:05:17.788221', '2025-07-13 11:34:10.000000'),
('fd031bf3-6957-4f2f-bfbd-6f36059dd252', 'c@c.com', 'coolkid63', '$2b$10$iTyB6N4BaqpWizCwvZlvbO1v7pEF.FggYQGK3Ibk.qNlbM2Wv0r42', 1, '2025-07-14 03:07:48', 0, 0, '2025-07-13 19:07:47.642762', '2025-07-13 19:07:47.000000');

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

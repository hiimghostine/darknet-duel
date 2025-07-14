-- Game Server Communication Database Migration Script - Part 2: Modify Accounts Table
-- For Darknet Duel - July 14, 2025

-- --------------------------------------------------------
--
-- Add rating and gamesLost columns to accounts table
-- Run this separately from other migrations
--

ALTER TABLE `accounts` ADD COLUMN `rating` INT NOT NULL DEFAULT 1200 AFTER `gamesWon`;
ALTER TABLE `accounts` ADD COLUMN `gamesLost` INT NOT NULL DEFAULT 0 AFTER `gamesWon`;

-- Game Server Communication Database Migration Script - Part 3: Seed Initial Ratings
-- For Darknet Duel - July 14, 2025

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
  SELECT 1 FROM `player_ratings` pr 
  WHERE pr.`accountId` = `accounts`.`id` 
  AND pr.`gameMode` = 'standard'
);

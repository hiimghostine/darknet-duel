-- First disable foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Let's try handling one table at a time more carefully
-- With more specific error handling

-- GAME PLAYERS
-- First check if the constraints exist in information_schema
SELECT COUNT(*) INTO @constraint_exists FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'darknet_duel' 
AND TABLE_NAME = 'game_players' 
AND CONSTRAINT_NAME = 'FK_66d478167a4c11e2ad1ba74e52f';

-- Only attempt to drop if it exists
SET @drop_stmt = IF(@constraint_exists > 0, 
                    'ALTER TABLE game_players DROP FOREIGN KEY FK_66d478167a4c11e2ad1ba74e52f', 
                    'SELECT 1');
PREPARE stmt FROM @drop_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Repeat for the other constraint
SELECT COUNT(*) INTO @constraint_exists FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'darknet_duel' 
AND TABLE_NAME = 'game_players' 
AND CONSTRAINT_NAME = 'FK_9b399cb2228699b75fde3151d3d';

SET @drop_stmt = IF(@constraint_exists > 0, 
                    'ALTER TABLE game_players DROP FOREIGN KEY FK_9b399cb2228699b75fde3151d3d', 
                    'SELECT 1');
PREPARE stmt FROM @drop_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Now add the cascade constraints
ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_game
FOREIGN KEY (gameId) REFERENCES game_results(gameId)
ON DELETE CASCADE;

-- RATING HISTORY
-- Check constraints
SELECT COUNT(*) INTO @constraint_exists FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'darknet_duel' 
AND TABLE_NAME = 'rating_history' 
AND CONSTRAINT_NAME = 'FK_0bb3bc1cb5d77850fcae97ac151';

SET @drop_stmt = IF(@constraint_exists > 0, 
                    'ALTER TABLE rating_history DROP FOREIGN KEY FK_0bb3bc1cb5d77850fcae97ac151', 
                    'SELECT 1');
PREPARE stmt FROM @drop_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @constraint_exists FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'darknet_duel' 
AND TABLE_NAME = 'rating_history' 
AND CONSTRAINT_NAME = 'FK_f4ceaaf39f40e28f528364684f4';

SET @drop_stmt = IF(@constraint_exists > 0, 
                    'ALTER TABLE rating_history DROP FOREIGN KEY FK_f4ceaaf39f40e28f528364684f4', 
                    'SELECT 1');
PREPARE stmt FROM @drop_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add cascade constraints
ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_game
FOREIGN KEY (gameId) REFERENCES game_results(gameId)
ON DELETE CASCADE;

-- PLAYER RATINGS
-- Check constraint
SELECT COUNT(*) INTO @constraint_exists FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'darknet_duel' 
AND TABLE_NAME = 'player_ratings' 
AND CONSTRAINT_NAME = 'FK_1904b2d47778a44dcfabd28cc81';

SET @drop_stmt = IF(@constraint_exists > 0, 
                    'ALTER TABLE player_ratings DROP FOREIGN KEY FK_1904b2d47778a44dcfabd28cc81', 
                    'SELECT 1');
PREPARE stmt FROM @drop_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add cascade constraint
ALTER TABLE player_ratings
ADD CONSTRAINT FK_player_ratings_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Disable foreign key checks to allow modification
SET FOREIGN_KEY_CHECKS=0;

-- Find and drop foreign keys using information_schema
SELECT CONCAT('ALTER TABLE ', table_name, ' DROP FOREIGN KEY ', constraint_name, ';')
INTO @sql
FROM information_schema.key_column_usage
WHERE table_schema = 'darknet_duel'
AND table_name = 'game_players'
AND referenced_table_name = 'accounts'
LIMIT 1;

-- Execute the generated DROP statement if a constraint exists
SELECT IF(@sql IS NOT NULL, @sql, 'SELECT 1;') INTO @sql;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Find and drop game_id constraint
SELECT CONCAT('ALTER TABLE ', table_name, ' DROP FOREIGN KEY ', constraint_name, ';')
INTO @sql
FROM information_schema.key_column_usage
WHERE table_schema = 'darknet_duel'
AND table_name = 'game_players'
AND referenced_table_name = 'game_results'
LIMIT 1;

-- Execute the generated DROP statement if a constraint exists
SELECT IF(@sql IS NOT NULL, @sql, 'SELECT 1;') INTO @sql;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Same for rating_history table (account reference)
SELECT CONCAT('ALTER TABLE ', table_name, ' DROP FOREIGN KEY ', constraint_name, ';')
INTO @sql
FROM information_schema.key_column_usage
WHERE table_schema = 'darknet_duel'
AND table_name = 'rating_history'
AND referenced_table_name = 'accounts'
LIMIT 1;

SELECT IF(@sql IS NOT NULL, @sql, 'SELECT 1;') INTO @sql;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- And rating_history table (game reference)
SELECT CONCAT('ALTER TABLE ', table_name, ' DROP FOREIGN KEY ', constraint_name, ';')
INTO @sql
FROM information_schema.key_column_usage
WHERE table_schema = 'darknet_duel'
AND table_name = 'rating_history'
AND referenced_table_name = 'game_results'
LIMIT 1;

SELECT IF(@sql IS NOT NULL, @sql, 'SELECT 1;') INTO @sql;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Now add proper constraints
ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_account_new
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_game_new
FOREIGN KEY (gameId) REFERENCES game_results(id)
ON DELETE CASCADE;

ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_account_new
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_game_new
FOREIGN KEY (gameId) REFERENCES game_results(id)
ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

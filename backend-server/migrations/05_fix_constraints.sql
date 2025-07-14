-- First drop the foreign key constraints
SET FOREIGN_KEY_CHECKS=0;

-- Drop foreign keys on game_players table
ALTER TABLE game_players
DROP FOREIGN KEY FK_game_players_account;

ALTER TABLE game_players
DROP FOREIGN KEY FK_game_players_game;

-- Drop foreign keys on rating_history if they exist
ALTER TABLE rating_history
DROP FOREIGN KEY FK_rating_history_account;

ALTER TABLE rating_history
DROP FOREIGN KEY FK_rating_history_game;

-- Now add the constraints back properly
ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_game
FOREIGN KEY (gameId) REFERENCES game_results(id)
ON DELETE CASCADE;

ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_game
FOREIGN KEY (gameId) REFERENCES game_results(id)
ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

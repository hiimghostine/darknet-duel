-- First, delete any player_ratings records that reference non-existent accounts
DELETE FROM player_ratings 
WHERE accountId NOT IN (SELECT id FROM accounts);

-- Now we can safely add the foreign key constraints
ALTER TABLE player_ratings 
ADD CONSTRAINT FK_player_ratings_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

-- Do the same for game_players table
DELETE FROM game_players
WHERE accountId NOT IN (SELECT id FROM accounts);

ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

-- And for rating_history table
DELETE FROM rating_history
WHERE accountId NOT IN (SELECT id FROM accounts);

ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

-- Check and clean up any game_player records with invalid game references
DELETE FROM game_players
WHERE gameId NOT IN (SELECT id FROM game_results);

ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_game
FOREIGN KEY (gameId) REFERENCES game_results(id)
ON DELETE CASCADE;

-- Finally fix the rating_history references to games
DELETE FROM rating_history
WHERE gameId NOT IN (SELECT id FROM game_results);

ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_game
FOREIGN KEY (gameId) REFERENCES game_results(id)
ON DELETE CASCADE;

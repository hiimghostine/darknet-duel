-- phpMyAdmin compatible script to fix constraints
-- First disable foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Fix the entity relationship between game_players and game_results
-- Make sure we're using the right column names and references

-- Drop existing constraints using specific names from the schema dump
ALTER TABLE game_players
DROP FOREIGN KEY IF EXISTS FK_66d478167a4c11e2ad1ba74e52f;

ALTER TABLE game_players
DROP FOREIGN KEY IF EXISTS FK_9b399cb2228699b75fde3151d3d;

-- Same for rating_history
ALTER TABLE rating_history
DROP FOREIGN KEY IF EXISTS FK_0bb3bc1cb5d77850fcae97ac151;

ALTER TABLE rating_history
DROP FOREIGN KEY IF EXISTS FK_f4ceaaf39f40e28f528364684f4;

-- Same for player_ratings
ALTER TABLE player_ratings
DROP FOREIGN KEY IF EXISTS FK_1904b2d47778a44dcfabd28cc81;

-- Now add the constraints back with ON DELETE CASCADE
-- For game_players
ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_game
FOREIGN KEY (gameId) REFERENCES game_results(gameId)
ON DELETE CASCADE;

-- For rating_history
ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_game
FOREIGN KEY (gameId) REFERENCES game_results(gameId)
ON DELETE CASCADE;

-- For player_ratings
ALTER TABLE player_ratings
ADD CONSTRAINT FK_player_ratings_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

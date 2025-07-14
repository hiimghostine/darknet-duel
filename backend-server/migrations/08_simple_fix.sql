-- Simple script to fix database constraints
-- Disable foreign key checks to allow modifications
SET FOREIGN_KEY_CHECKS=0;

-- First, try to drop each constraint individually
-- If one fails, the others will still be attempted

-- Game players constraints
ALTER TABLE game_players DROP FOREIGN KEY FK_66d478167a4c11e2ad1ba74e52f;
-- If the above fails, continue with the next statements

ALTER TABLE game_players DROP FOREIGN KEY FK_9b399cb2228699b75fde3151d3d;
-- If the above fails, continue with the next statements

-- Rating history constraints
ALTER TABLE rating_history DROP FOREIGN KEY FK_0bb3bc1cb5d77850fcae97ac151;
-- If the above fails, continue with the next statements

ALTER TABLE rating_history DROP FOREIGN KEY FK_f4ceaaf39f40e28f528364684f4;
-- If the above fails, continue with the next statements

-- Player ratings constraint
ALTER TABLE player_ratings DROP FOREIGN KEY FK_1904b2d47778a44dcfabd28cc81;
-- If the above fails, continue with the next statements

-- Now add constraints with CASCADE delete
-- Even if some drops failed, these adds will override existing constraints

-- Game players constraints with cascade delete
ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE game_players
ADD CONSTRAINT FK_game_players_game
FOREIGN KEY (gameId) REFERENCES game_results(gameId)
ON DELETE CASCADE;

-- Rating history constraints with cascade delete
ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

ALTER TABLE rating_history
ADD CONSTRAINT FK_rating_history_game
FOREIGN KEY (gameId) REFERENCES game_results(gameId)
ON DELETE CASCADE;

-- Player ratings constraint with cascade delete
ALTER TABLE player_ratings
ADD CONSTRAINT FK_player_ratings_account
FOREIGN KEY (accountId) REFERENCES accounts(id)
ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

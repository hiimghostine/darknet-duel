import { AppDataSource } from '../utils/database';
import { GamePlayer } from '../entities/game-player.entity';
import { RatingHistory } from '../entities/rating-history.entity';

async function backfillGamePlayerRatings() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Find all game_players records with null rating information
    const gamePlayerRepo = AppDataSource.getRepository(GamePlayer);
    const playersWithoutRatings = await gamePlayerRepo
      .createQueryBuilder('gp')
      .where('gp.ratingBefore IS NULL OR gp.ratingAfter IS NULL OR gp.ratingChange IS NULL')
      .getMany();

    console.log(`Found ${playersWithoutRatings.length} game_player records without rating data`);

    if (playersWithoutRatings.length === 0) {
      console.log('No records need updating');
      return;
    }

    // Get rating history repository
    const ratingHistoryRepo = AppDataSource.getRepository(RatingHistory);
    let updatedCount = 0;

    // Process each player record
    for (const player of playersWithoutRatings) {
      try {
        // Find corresponding rating history record
        const ratingHistory = await ratingHistoryRepo.findOne({
          where: {
            accountId: player.accountId,
            gameId: player.gameId
          }
        });

        if (ratingHistory) {
          // Update the game_player record with rating data
          player.ratingBefore = ratingHistory.ratingBefore;
          player.ratingAfter = ratingHistory.ratingAfter;
          player.ratingChange = ratingHistory.ratingChange;
          
          await gamePlayerRepo.save(player);
          updatedCount++;
          
          console.log(`Updated player ${player.accountId} for game ${player.gameId}: ${ratingHistory.ratingBefore} → ${ratingHistory.ratingAfter} (${ratingHistory.ratingChange > 0 ? '+' : ''}${ratingHistory.ratingChange})`);
        } else {
          console.log(`No rating history found for player ${player.accountId} in game ${player.gameId}`);
        }
      } catch (error) {
        console.error(`Error updating player ${player.accountId} for game ${player.gameId}:`, error);
      }
    }

    console.log(`\nBackfill complete: Updated ${updatedCount} out of ${playersWithoutRatings.length} records`);

  } catch (error) {
    console.error('Error during backfill:', error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  backfillGamePlayerRatings()
    .then(() => {
      console.log('Backfill script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Backfill script failed:', error);
      process.exit(1);
    });
}

export default backfillGamePlayerRatings; 
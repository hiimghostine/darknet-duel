import { AppDataSource } from '../utils/database';
import { Account } from '../entities/account.entity';

async function testProfileData() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // Get the account repository
    const accountRepository = AppDataSource.getRepository(Account);

    // Find a test user
    const users = await accountRepository.find();
    console.log('Found users:', users.length);

    if (users.length > 0) {
      const testUser = users[0];
      console.log('Test user data:');
      console.log('ID:', testUser.id);
      console.log('Username:', testUser.username);
      console.log('Email:', testUser.email);
      console.log('isActive:', testUser.isActive, typeof testUser.isActive);
      console.log('bio:', testUser.bio);
      console.log('createdAt:', testUser.createdAt, typeof testUser.createdAt);
      console.log('rating:', testUser.rating);
      console.log('gamesPlayed:', testUser.gamesPlayed);
      console.log('gamesWon:', testUser.gamesWon);
      console.log('gamesLost:', testUser.gamesLost);
      
      // Test what gets returned in the API format
      const apiResponse = {
        id: testUser.id,
        username: testUser.username,
        isActive: testUser.isActive,
        gamesPlayed: testUser.gamesPlayed,
        gamesWon: testUser.gamesWon,
        gamesLost: testUser.gamesLost,
        rating: testUser.rating,
        bio: testUser.bio,
        createdAt: testUser.createdAt
      };
      
      console.log('\nAPI Response format:');
      console.log(JSON.stringify(apiResponse, null, 2));
    }

    await AppDataSource.destroy();
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testProfileData(); 
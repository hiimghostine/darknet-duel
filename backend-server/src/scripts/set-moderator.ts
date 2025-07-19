import { AppDataSource } from '../utils/database';

async function setUserAsModerator() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // Get the query runner
    const queryRunner = AppDataSource.createQueryRunner();

    // Get email from command line arguments
    const email = process.argv[2];
    
    if (!email) {
      console.error('Usage: npx ts-node src/scripts/set-moderator.ts <email>');
      process.exit(1);
    }

    console.log(`Setting user with email '${email}' as moderator...`);
    
    // Update the user to be a moderator
    const result = await queryRunner.query(
      `UPDATE accounts SET type = 'mod' WHERE email = ?`,
      [email.toLowerCase()]
    );

    if (result.affectedRows === 0) {
      console.log(`❌ User with email '${email}' not found`);
    } else {
      console.log(`✅ Successfully set user '${email}' as moderator`);
      
      // Verify the change
      const user = await queryRunner.query(
        `SELECT id, email, username, type FROM accounts WHERE email = ?`,
        [email.toLowerCase()]
      );
      
      if (user.length > 0) {
        console.log('Updated user:', user[0]);
      }
    }

    await queryRunner.release();
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error('Failed to set moderator:', error);
    process.exit(1);
  }
}

// Run the script
setUserAsModerator(); 
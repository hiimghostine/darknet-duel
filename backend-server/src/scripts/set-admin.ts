import { AppDataSource } from '../utils/database';

async function setUserAsAdmin() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // Get the query runner
    const queryRunner = AppDataSource.createQueryRunner();

    // Get email from command line arguments
    const email = process.argv[2];
    
    if (!email) {
      console.error('Usage: npx ts-node src/scripts/set-admin.ts <email>');
      process.exit(1);
    }

    console.log(`Setting user with email '${email}' as admin...`);
    
    // Update the user to be an admin
    const result = await queryRunner.query(
      `UPDATE accounts SET type = 'admin' WHERE email = ?`,
      [email.toLowerCase()]
    );

    if (result.affectedRows === 0) {
      console.log(`❌ User with email '${email}' not found`);
    } else {
      console.log(`✅ Successfully set user '${email}' as admin`);
      
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
    console.error('Failed to set admin:', error);
    process.exit(1);
  }
}

// Run the script
setUserAsAdmin(); 
import { AppDataSource } from '../utils/database';

async function addAccountTypeMigration() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // Get the query runner
    const queryRunner = AppDataSource.createQueryRunner();

    console.log('Checking current accounts table structure...');
    
    // Check if the type column exists
    const tableInfo = await queryRunner.query(`DESCRIBE accounts`);
    console.log('Current accounts table columns:', tableInfo.map((col: any) => col.Field));

    const existingColumns = tableInfo.map((col: any) => col.Field);
    
    if (!existingColumns.includes('type')) {
      console.log('Adding account type column...');
      
      // Add the 'type' column with enum values and default to 'user'
      await queryRunner.query(`
        ALTER TABLE accounts 
        ADD COLUMN type ENUM('user', 'mod', 'admin') NOT NULL DEFAULT 'user' 
        AFTER username
      `);
      console.log('✅ Added type column');

      // Create an index on the type column for faster queries
      await queryRunner.query(`CREATE INDEX idx_accounts_type ON accounts (type)`);
      console.log('✅ Added index on type column');

      // Update all existing accounts to have type 'user' (this is redundant due to DEFAULT but explicit for clarity)
      const updateResult = await queryRunner.query(`UPDATE accounts SET type = 'user' WHERE type IS NULL`);
      console.log(`✅ Updated ${updateResult.affectedRows} existing accounts to have type 'user'`);

      // Add a comment to document the column
      await queryRunner.query(`
        ALTER TABLE accounts MODIFY COLUMN type ENUM('user', 'mod', 'admin') NOT NULL DEFAULT 'user' 
        COMMENT 'Account type: user (default), mod (moderator), admin (administrator)'
      `);
      console.log('✅ Added comment to type column');

      console.log('Migration completed successfully!');
    } else {
      console.log('⚠️ Type column already exists, skipping migration');
    }
    
    // Verify the updated structure
    const updatedTableInfo = await queryRunner.query(`DESCRIBE accounts`);
    console.log('Updated accounts table columns:', updatedTableInfo.map((col: any) => col.Field));

    await queryRunner.release();
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addAccountTypeMigration(); 
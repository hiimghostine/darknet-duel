import { AppDataSource } from '../utils/database';

async function runMigration() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // Get the query runner
    const queryRunner = AppDataSource.createQueryRunner();

    console.log('Checking current accounts table structure...');
    
    // Check if columns exist
    const tableInfo = await queryRunner.query(`DESCRIBE accounts`);
    console.log('Current accounts table columns:', tableInfo.map((col: any) => col.Field));

    const existingColumns = tableInfo.map((col: any) => col.Field);
    const columnsToAdd = [
      { name: 'bio', sql: 'ADD COLUMN bio VARCHAR(30) NULL COMMENT "User bio, limited to 30 characters"' },
      { name: 'avatar', sql: 'ADD COLUMN avatar LONGBLOB NULL COMMENT "User avatar image data"' },
      { name: 'avatarMimeType', sql: 'ADD COLUMN avatarMimeType VARCHAR(100) NULL COMMENT "MIME type of the avatar image"' },
      { name: 'creds', sql: 'ADD COLUMN creds INT NOT NULL DEFAULT 0 COMMENT "User credits/currency"' },
      { name: 'crypts', sql: 'ADD COLUMN crypts INT NOT NULL DEFAULT 0 COMMENT "User crypts/premium currency"' }
    ];

    // Add missing columns
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await queryRunner.query(`ALTER TABLE accounts ${column.sql}`);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`⚠️ Column ${column.name} already exists, skipping`);
      }
    }

    console.log('Migration completed successfully!');
    
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

runMigration(); 
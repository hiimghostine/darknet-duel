import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { AppDataSource } from '../utils/database';

// Load environment variables
dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USERNAME = 'root',
  DB_PASSWORD = 'example',
  DB_NAME = 'darknet_duel'
} = process.env;

async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  try {
    // First create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT),
      user: DB_USERNAME,
      password: DB_PASSWORD,
    });

    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`Database '${DB_NAME}' created or already exists`);
    
    // Close the connection
    await connection.end();
    console.log('Closed initial connection');

    // Now initialize TypeORM connection and create tables
    await AppDataSource.initialize();
    console.log('TypeORM connection initialized');
    
    // Create/update tables based on entities
    await AppDataSource.synchronize();
    console.log('Database synchronized with entity schemas');
    
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization function
initializeDatabase();

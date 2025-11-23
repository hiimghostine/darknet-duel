import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import mysql from 'mysql2/promise';
import { AppDataSource } from './utils/database';
import authRoutes from './routes/auth.routes';
import serverRoutes from './routes/server.routes';
import infoRoutes from './routes/info.routes';
import accountRoutes from './routes/account.routes';
import filesRoutes from './routes/files.routes';
import currencyRoutes from './routes/currency.routes';
import paymentRoutes from './routes/payment.routes';
import gamesRoutes from './routes/games.routes';
import adminRoutes from './routes/admin.routes';
import storeRoutes from './routes/store.routes';
import purchaseRoutes from './routes/purchase.routes';
import reportRoutes from './routes/report.routes';
import logRoutes from './routes/log.routes';
import { specs, swaggerUi, swaggerUiOptions } from './config/swagger';
import { ChatSocketService } from './services/chat-socket.service';

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.SERVER_API_KEY) {
  console.warn('WARNING: SERVER_API_KEY is not set. Using default development key.');
  process.env.SERVER_API_KEY = 'dev-server-key';
}

// Initialize express app
const app = express();
const PORT = parseInt(process.env.PORT || '8000', 10);
const HOST = process.env.HOST || 'localhost';
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
const publicUrl = process.env.PUBLIC_URL || `http://${HOST}:${PORT}`;

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Log CORS configuration
console.log('CORS allowed origins:', allowedOrigins);
console.log(`Server will bind to ${HOST}:${PORT}`);
console.log(`Public URL: ${publicUrl}`);
if (HOST === '0.0.0.0') {
  console.log('Server is accepting connections from all network interfaces');
}

// Middleware
app.use(express.json());

// Enhanced CORS handling
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    }
    // console.log(`CORS allowed origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Server-API-Key', 'X-Source']
}));

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: API health check endpoint
 *     description: Returns server status for monitoring and health checks. Used by CI/CD pipelines.
 *     responses:
 *       200:
 *         description: Server is running normally
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-11-02T06:00:00.000Z"
 */
// Health check endpoint for API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);

// Account management routes
app.use('/api/account', accountRoutes);

// File management routes
app.use('/api/files', filesRoutes);

// Server-to-server routes for game-server communication
app.use('/api/server', serverRoutes);

// Info routes for user profile and activity data
app.use('/api/info', infoRoutes);

// Currency management routes
app.use('/api/currency', currencyRoutes);

// Payment processing routes
app.use('/api/payment', paymentRoutes);

// Game routes for user-facing game history
app.use('/api/games', gamesRoutes);

// Admin routes for user management (admin access only)
app.use('/api/admin', adminRoutes);

// Store routes for avatar decorations and shop
app.use('/api/store', storeRoutes);

// Purchase routes for buying store items
app.use('/api/purchase', purchaseRoutes);

// Report routes for user reports and admin management
app.use('/api/reports', reportRoutes);
app.use('/api/logs', logRoutes);

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// Serve raw Swagger JSON spec
app.get('/api/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
});

// Also serve at /swagger.json for convenience
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
});

// Redirect /docs to /api-docs for convenience
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// Game-related routes that use normal authentication
app.get('/api/games/:id', (req, res) => {
  // TODO: Implement game data retrieval (placeholder)
  res.status(404).json({ error: 'Game not found' });
});

app.get('/api/players/:id/rating', (req, res) => {
  // TODO: Implement player rating retrieval (placeholder)
  res.status(200).json({ playerId: req.params.id, rating: 1000 });
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns server status for monitoring and health checks
 *     responses:
 *       200:
 *         description: Server is running normally
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Server is running"
 */
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Initialize database connection and ensure tables exist
async function initializeDatabase() {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_PORT = process.env.DB_PORT || '3306';
  const DB_USERNAME = process.env.DB_USERNAME || 'root';
  const DB_PASSWORD = process.env.DB_PASSWORD || 'example';
  const DB_NAME = process.env.DB_NAME || 'darknet_duel';

  try {
    // First, create the database if it doesn't exist
    try {
      const connection = await mysql.createConnection({
        host: DB_HOST,
        port: parseInt(DB_PORT),
        user: DB_USERNAME,
        password: DB_PASSWORD,
      });

      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
      await connection.end();
      console.log(`Database '${DB_NAME}' created or already exists`);
    } catch (error) {
      console.warn('Could not create database (may already exist):', error instanceof Error ? error.message : error);
    }

    // Initialize TypeORM connection
    await AppDataSource.initialize();
    console.log('Database connection established successfully');

    // Check if all expected tables exist by querying each entity's table
    const queryRunner = AppDataSource.createQueryRunner();
    let needsSynchronize = false;
    
    try {
      // Get all entity metadata to check their corresponding tables
      const entityMetadatas = AppDataSource.entityMetadatas;
      const missingTables: string[] = [];
      
      for (const metadata of entityMetadatas) {
        const tableName = metadata.tableName;
        try {
          // Try to query the table to see if it exists
          await queryRunner.query(`SELECT 1 FROM \`${tableName}\` LIMIT 1`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          // Check if error is due to table not existing
          if (errorMessage.includes("doesn't exist") || 
              errorMessage.includes("Unknown table") || 
              (errorMessage.includes("Table") && errorMessage.includes("not found"))) {
            missingTables.push(tableName);
            needsSynchronize = true;
          } else {
            // Different error - might be permissions or connection issue
            console.warn(`Could not verify table '${tableName}' existence:`, errorMessage);
          }
        }
      }
      
      if (needsSynchronize) {
        console.log(`Missing tables detected: ${missingTables.join(', ')}`);
        console.log('Synchronizing database schema to create missing tables...');
        await AppDataSource.synchronize();
        console.log('Database tables synchronized successfully');
      } else {
        console.log('All database tables exist');
      }
    } catch (error) {
      console.error('Error checking table existence:', error);
      // If we can't check, try to synchronize anyway (safer than failing)
      console.log('Attempting to synchronize database schema...');
      try {
        await AppDataSource.synchronize();
        console.log('Database tables synchronized successfully');
      } catch (syncError) {
        console.warn('Could not synchronize database:', syncError);
      }
    } finally {
      await queryRunner.release();
    }

    // Initialize Socket.io chat service
    const chatSocketService = new ChatSocketService(httpServer);
    console.log('Chat Socket.io service initialized');

    // Start the HTTP server (which includes both Express and Socket.io)
    httpServer.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
      console.log(`Public URL: ${publicUrl}`);
      console.log(`Chat WebSocket available at: ${publicUrl}/socket.io`);
    });
  } catch (error: Error | unknown) {
    console.error('❌ Error connecting to database:', error);
    console.error('Database connection details:');
    console.error(`  Host: ${DB_HOST}`);
    console.error(`  Port: ${DB_PORT}`);
    console.error(`  Username: ${DB_USERNAME}`);
    console.error(`  Password: ${DB_PASSWORD.substring(0, 3)}***`);
    console.error(`  Database: ${DB_NAME}`);
    process.exit(1);
  }
}

// Start the server
initializeDatabase();

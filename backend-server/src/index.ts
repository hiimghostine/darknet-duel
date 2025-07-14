import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './utils/database';
import authRoutes from './routes/auth.routes';
import serverRoutes from './routes/server.routes';

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
    console.log(`CORS allowed origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Server-API-Key', 'X-Source']
}));

// Routes
app.use('/api/auth', authRoutes);

// Server-to-server routes for game-server communication
app.use('/api/server', serverRoutes);

// Game-related routes that use normal authentication
app.get('/api/games/:id', (req, res) => {
  // TODO: Implement game data retrieval (placeholder)
  res.status(404).json({ error: 'Game not found' });
});

app.get('/api/players/:id/rating', (req, res) => {
  // TODO: Implement player rating retrieval (placeholder)
  res.status(200).json({ playerId: req.params.id, rating: 1200 });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established successfully');
    
    // Start the server
    app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
      console.log(`Public URL: ${publicUrl}`);
    });
  })
  .catch((error: Error) => {
    console.error('Error connecting to database:', error);
  });

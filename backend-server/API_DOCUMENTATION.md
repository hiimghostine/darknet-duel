# Darknet Duel API Documentation

## Overview

The Darknet Duel API provides authentication, user management, and game data persistence for the cybersecurity-themed multiplayer card game. This API serves as the backend for user accounts, game statistics, and activity tracking.

## API Documentation

### Swagger UI

Interactive API documentation is available through Swagger UI when the server is running:

- **Primary URL**: [http://localhost:8000/api-docs](http://localhost:8000/api-docs)
- **Shortcut URL**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Features

The Swagger documentation includes:

- **Complete API reference** for all endpoints
- **Interactive testing** - try API calls directly from the browser
- **Request/response schemas** with examples
- **Authentication documentation** for JWT tokens and server API keys
- **Error response examples** for troubleshooting

## API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/profile` - Get current user profile (requires auth)

### Profile & Info (`/api/info`)
- `GET /api/info/profile` - Get complete profile with activity and stats (requires auth)
- `GET /api/info/activity` - Get recent game activity only (requires auth)
- `GET /api/info/stats` - Get profile statistics only (requires auth)

### Server-to-Server (`/api/server`)
- `GET /api/server/validate` - Validate server connection (requires server API key)
- `POST /api/server/games/results` - Save game results (requires server API key)
- `POST /api/server/games/history` - Save game history (requires server API key)
- `POST /api/server/players/ratings` - Update player ratings (requires server API key)

### Health Monitoring
- `GET /health` - Server health check

## Authentication

### User Authentication
Most user endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Obtain a JWT token by calling the `/api/auth/login` endpoint with valid credentials.

### Server-to-Server Authentication
Server endpoints require an API key in the request headers:
```
x-server-api-key: <your-server-api-key>
X-Source: game-server
```

## Example Usage

### Register a New User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hacker@darknet.com",
    "username": "CyberNinja",
    "password": "securepassword123"
  }'
```

### Login and Get Token
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hacker@darknet.com",
    "password": "securepassword123"
  }'
```

### Get Profile Information
```bash
curl -X GET "http://localhost:8000/api/info/profile" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional details (development mode only)"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Development

### Environment Variables

Key environment variables for the API:

```bash
# Server Configuration
PORT=8000
HOST=localhost
PUBLIC_URL=http://localhost:8000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=example
DB_NAME=darknet_duel

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# Server-to-Server Authentication
SERVER_API_KEY=your-server-api-key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Running the Server

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Database Schema

The API works with the following main entities:

- **accounts** - User account information
- **game_players** - Player participation in games
- **game_results** - Game outcome data
- **player_ratings** - ELO rating system
- **rating_history** - Rating change tracking

See the database migration files in `/migrations` for complete schema details.

## Support

For API issues or questions:

- Check the interactive Swagger documentation at `/api-docs`
- Review this documentation file
- Check server logs for detailed error information
- Ensure environment variables are properly configured

---

**Darknet Duel API v1.0.0**  
*Authentication and persistence API for the cybersecurity-themed multiplayer card game* 
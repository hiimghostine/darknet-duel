# Darknet Duel Backend Server

## Overview

The **Darknet Duel Backend Server** is the authentication, user management, and game data persistence API for the cybersecurity-themed multiplayer card game, Darknet Duel. It provides RESTful endpoints for user accounts, authentication, game statistics, activity tracking, in-game currency, store purchases, and administrative operations. The backend also supports real-time chat via WebSockets and secure server-to-server communication with the game server.

## Purpose

- **User Authentication & Management**: Register, login, and manage user accounts securely.
- **Game Data Persistence**: Store and retrieve game results, player ratings, and history.
- **Profile & Activity**: Track user activity, statistics, and profile information.
- **In-Game Currency**: Manage virtual currencies (Creds and Crypts) for purchases and rewards.
- **Store & Purchases**: Handle in-game store, item purchases, and decoration management.
- **Admin Tools**: Provide endpoints for user moderation, banning, and reporting.
- **Real-Time Chat**: Enable chat functionality using Socket.IO.
- **Server-to-Server API**: Allow secure communication between the game server and backend for game results and rating updates.

## Tech Stack

- **Language**: TypeScript (Node.js)
- **Framework**: Express.js
- **Database**: MySQL (via TypeORM ORM)
- **WebSockets**: Socket.IO
- **API Documentation**: Swagger (OpenAPI 3.0)
- **Authentication**: JWT (JSON Web Tokens) for users, API keys for server-to-server
- **File Uploads**: Multer
- **Environment Management**: dotenv

## Main Libraries Used

- `express` - Web server framework
- `typeorm` - ORM for MySQL database
- `mysql2` - MySQL driver
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `socket.io` - Real-time chat and notifications
- `swagger-jsdoc`, `swagger-ui-express` - API documentation
- `multer` - File uploads (avatars, images)
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing
- `uuid` - Unique ID generation

## Architecture

- **Modular Controllers**: Each domain (auth, account, games, info, admin, store, etc.) has its own controller and route files.
- **Entity-Driven**: Database tables are mapped to TypeORM entities (e.g., Account, GameResult, PlayerRating, Purchase, Report, Log).
- **Middleware**: Custom middleware for authentication (JWT), server-to-server API key validation, and error handling.
- **Swagger UI**: Interactive API docs available at `/api-docs` when the server is running.
- **Socket.IO**: Real-time chat service initialized alongside the HTTP server.
- **Environment Configurable**: All sensitive settings (DB, JWT, API keys) are managed via environment variables.

## Key Features

- **Authentication**: Secure registration, login, and JWT-based session management
- **User Profiles**: View and update profile, avatar, bio, and stats
- **Game History**: Store and retrieve detailed game results and player ratings
- **Currency System**: Manage Creds and Crypts, including admin adjustments and transfers
- **Store**: Purchase and apply in-game items and decorations
- **Admin Tools**: User moderation, banning, reporting, and statistics
- **Reports & Logs**: User reports and system logs for moderation and auditing
- **Health Checks**: `/health` endpoint for server status

## Setup & Development

### Prerequisites
- Node.js (v16+ recommended)
- MySQL server

### Environment Variables
Create a `.env` file in the root directory with the following (see `.env.example` if available):

```
PORT=8000
HOST=localhost
PUBLIC_URL=http://localhost:8000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=example
DB_NAME=darknet_duel
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
SERVER_API_KEY=your-server-api-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Install Dependencies
```
npm install
```

### Database Initialization
```
npm run init-db
```
This will create the database (if not present) and synchronize tables using TypeORM entities.

### Running the Server
- **Development:**
  ```
  npm run dev
  ```
- **Production Build:**
  ```
  npm run build
  npm start
  ```

### API Documentation
- Swagger UI: [http://localhost:8000/api-docs](http://localhost:8000/api-docs)
- See also: `API_DOCUMENTATION.md` for endpoint details and usage examples

## Database Schema
- See `/migrations` for SQL migration scripts and schema details
- Main tables: `accounts`, `game_players`, `game_results`, `player_ratings`, `rating_history`, `purchases`, `reports`, `logs`

## Contributing
- Follow code style using ESLint and Prettier (`npm run lint`, `npm run format`)
- Write tests for new features (`npm test`)
- Document new endpoints in Swagger and Markdown docs

## License
MIT

---
**Darknet Duel Backend Server v1.0.0** 

## Detailed Source Directory Structure

The `src/` directory is organized by feature and responsibility. Below is a comprehensive breakdown of each subdirectory and its contents, including the purpose, typical usage, and notable implementation details. This section is intended to help new developers understand the architecture and navigate the codebase efficiently.

---

### controllers/
**Purpose:**
Houses all controller classes, each responsible for handling HTTP requests for a specific domain or feature. Controllers act as the main entry point for business logic in response to API calls.

**Typical Usage:**
- Each controller class (e.g., `AccountController`, `AdminController`, `GamesController`) defines methods corresponding to API endpoints.
- Controllers receive requests, validate input, call service-layer logic, and return responses.
- They are referenced in the corresponding route files to bind HTTP endpoints to controller methods.

**Notable Files:**
- `account.controller.ts`: Handles user account management (profile, update, search, etc.).
- `admin.controller.ts`: Admin-only endpoints for user management, banning, statistics, etc.
- `auth.controller.ts`: Registration, login, and authentication endpoints.
- `games.controller.ts`: Game history, results, and server-to-server endpoints.
- `info.controller.ts`: User profile, stats, and activity endpoints.
- `store.controller.ts`: In-game store, purchases, and decoration management.
- `report.controller.ts`: User reporting and admin review endpoints.
- `files.controller.ts`: File serving (avatars, images, etc.).
- `currency.controller.ts`: Virtual currency management.
- `payment.controller.ts`: Payment processing endpoints.
- `log.controller.ts`: System and user activity logs.
- Each controller is paired with a `.md` documentation file describing its endpoints in detail.

---

### routes/
**Purpose:**
Defines Express route files that map HTTP endpoints to controller methods, applying any necessary middleware (authentication, authorization, etc.).

**Typical Usage:**
- Each file (e.g., `auth.routes.ts`, `games.routes.ts`) imports the relevant controller and middleware.
- Routes are registered with the Express app in `index.ts`.
- Middleware is applied at the route or router level (e.g., `authMiddleware`, `adminAuthMiddleware`).

**Notable Files:**
- `auth.routes.ts`: Public and protected authentication endpoints.
- `account.routes.ts`: User account endpoints, avatar upload, and decoration application.
- `admin.routes.ts`: Admin-only endpoints, protected by both `authMiddleware` and `adminAuthMiddleware`.
- `games.routes.ts`: Game history and details, protected by `authMiddleware`.
- `server.routes.ts`: Server-to-server endpoints, protected by `serverAuthMiddleware`.
- `store.routes.ts`, `purchase.routes.ts`: Store and purchase endpoints, protected by `authMiddleware`.
- `report.routes.ts`: User and admin report endpoints, with layered middleware for access control.
- `log.routes.ts`: Log viewing endpoints, protected by moderator/admin middleware.
- `files.routes.ts`: File serving endpoints (avatars, images), some public, some protected.

---

### services/
**Purpose:**
Encapsulates business logic, database access, and integrations for each domain. Services are called by controllers to perform operations, interact with the database, and coordinate complex workflows.

**Typical Usage:**
- Each service class (e.g., `AccountService`, `GameService`, `StoreService`) provides methods for CRUD operations, business rules, and data processing.
- Services use TypeORM repositories to interact with the database entities.
- Some services (e.g., `ChatSocketService`) manage real-time features using Socket.IO.

**Notable Files:**
- `account.service.ts`: User account CRUD, password hashing, and profile updates.
- `admin.service.ts`: Admin operations, user search/filter, banning, and statistics.
- `auth.service.ts`: User registration, login, and authentication logging.
- `game.service.ts`: Game result persistence, history, and player-game relationships.
- `rating.service.ts`: ELO rating calculation and history tracking.
- `store.service.ts`: Store data, purchase logic, and file path resolution for assets.
- `report.service.ts`: User report creation, status updates, and admin review.
- `log.service.ts`: System and user activity logging, log retrieval.
- `chat.service.ts`: Lobby chat message persistence and retrieval.
- `chat-socket.service.ts`: Real-time chat server using Socket.IO, manages user connections and events.
- `payment.service.ts`: Payment integration (e.g., Xendit), invoice creation, and currency crediting.
- `currency.service.ts`: Virtual currency (Creds, Crypts) balance management, transfers, and admin adjustments.

---

### entities/
**Purpose:**
Defines TypeORM entity classes that map to database tables. Entities describe the schema, relationships, and constraints for persistent data.

**Typical Usage:**
- Each entity class (e.g., `Account`, `GameResult`, `PlayerRating`) corresponds to a table in the MySQL database.
- Entities use decorators to define columns, types, indexes, and relationships (e.g., `@ManyToOne`, `@OneToMany`).
- Used by services and repositories for database operations.

**Notable Files:**
- `account.entity.ts`: User account schema, including credentials, profile, and currency fields.
- `game-result.entity.ts`, `game-player.entity.ts`: Game results and player participation, with relationships to accounts.
- `player-rating.entity.ts`, `rating-history.entity.ts`: ELO rating and rating change history.
- `purchase.entity.ts`: Store purchases, item types, and currency used.
- `report.entity.ts`: User reports, types, statuses, and relationships to accounts.
- `log.entity.ts`: System/user logs, linked to accounts.
- `lobby-chat.entity.ts`: Chat messages in lobbies, with metadata and soft-delete support.
- `user-profile.entity.ts`, `game-history.entity.ts`: Data transfer objects for profile and game history.

---

### middleware/
**Purpose:**
Provides custom Express middleware for authentication, authorization, file uploads, and server-to-server security.

**Typical Usage:**
- Middleware is applied in route files to protect endpoints and enforce access control.
- Examples include JWT authentication, admin/moderator checks, and file upload validation.

**Notable Files:**
- `auth.middleware.ts`: Verifies JWT tokens, attaches user info to requests.
- `admin-auth.middleware.ts`: Ensures the user is an admin.
- `moderator-auth.middleware.ts`: Ensures the user is a moderator or admin.
- `server-auth.middleware.ts`: Validates server-to-server API key and source for game-server communication.
- `upload.middleware.ts`: Configures Multer for file uploads (e.g., avatar images), with file type and size restrictions.

---

### utils/
**Purpose:**
Contains utility modules for common, reusable functionality.

**Typical Usage:**
- Utility functions are imported by services, controllers, and scripts as needed.

**Notable Files:**
- `database.ts`: Sets up the TypeORM data source, loads environment variables, and exports the main database connection.
- `validation.ts`: Provides input validation functions (e.g., email format, password strength) used throughout the codebase.

---

### config/
**Purpose:**
Holds configuration files for third-party integrations and system-wide settings.

**Typical Usage:**
- Used to configure Swagger/OpenAPI documentation, including endpoint schemas, security schemes, and UI options.

**Notable Files:**
- `swagger.ts`: Sets up Swagger JSDoc options, defines API schemas, tags, and serves the Swagger UI for interactive API documentation.

---

### scripts/
**Purpose:**
Provides standalone scripts for database setup, migrations, data backfills, and test utilities. These are typically run from the command line for maintenance or development tasks.

**Typical Usage:**
- Scripts are executed using `ts-node` or as npm scripts (e.g., `npm run init-db`).
- Used for initializing the database, running migrations, updating user roles, and testing business logic.

**Notable Files:**
- `init-db.ts`: Initializes the database, creates tables, and synchronizes schemas.
- `run-migration.ts`: Alters the database schema to add or update columns as needed.
- `add-account-type-migration.ts`: Adds the `type` column to accounts for user roles.
- `set-admin.ts`, `set-moderator.ts`: Promotes users to admin or moderator roles by email.
- `backfill-game-player-ratings.ts`: Fills in missing rating data for historical game records.
- `test-profile-data.ts`, `test-rating-calculation.ts`: Test scripts for verifying profile and rating logic.

---

### types/
**Purpose:**
Defines TypeScript type declarations and interfaces for strong typing across the codebase.

**Typical Usage:**
- Used to type-check database, request/response objects, and route modules.
- Ensures type safety and better developer tooling (autocomplete, error checking).

**Notable Files:**
- `database.d.ts`: Declares the TypeORM data source type.
- `auth.routes.d.ts`: Declares the type for the authentication routes module.

---

### index.ts
**Purpose:**
The main entry point for the backend server.

**Typical Usage:**
- Sets up the Express app, loads environment variables, configures CORS, and registers all routes and middleware.
- Initializes the database connection and starts the HTTP/Socket.IO server.
- Serves the Swagger UI for API documentation.
- Handles server startup, logging, and error reporting.

**Example Flow:**
1. Loads environment variables and configures the app.
2. Registers all route files, each of which binds endpoints to controller methods.
3. Applies global middleware (CORS, JSON parsing, etc.).
4. Initializes the database using TypeORM and connects to MySQL.
5. Starts the HTTP server and initializes the Socket.IO chat service.
6. Logs server status and available endpoints.

---

This detailed breakdown should help new developers understand the structure, responsibilities, and interactions of each part of the backend-server codebase. For further details, refer to the inline comments, controller documentation files, and Swagger UI. 
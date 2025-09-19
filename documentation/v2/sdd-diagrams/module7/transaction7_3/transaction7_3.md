# Transaction 7.3: System Logs and Audit Trails

## User Interface Design
- Admins and moderators can view, filter, and search system logs and audit trails
- Logs display user, action, timestamp, and details
- UI supports pagination, filtering by user, and searching by text
- Log details can be viewed in a modal or detail view
- Responsive, admin-themed UI

## Frontend Components
1. **SecurityOverviewPage** (React Page Component)
   - Displays logs, filtering/search controls, and pagination
   - File: `src/pages/SecurityOverviewPage.tsx`
2. **logService** (Service Module)
   - Handles API calls for fetching logs and log details
   - File: `src/services/log.service.ts`
3. **useAuthStore** (Zustand Store)
   - Provides authentication and user info, including role/type
   - File: `src/store/auth.store.ts`

## Backend Components
1. **LogController** (Express Controller)
   - Handles REST API requests for log retrieval
   - Endpoints:
     - `GET /api/logs` — Get logs with pagination and filtering
     - `GET /api/logs/{id}` — Get specific log by ID
2. **LogService** (Service Class)
   - Implements log logic: create, fetch, filter, and search logs
   - Methods: `createLog`, `getLogs`, `getLogById`, `logUserLogin`, `logFailedLogin`, etc.
3. **Log Entity**
   - Stores log data (userId, text, createdAt)
   - File: `src/entities/log.entity.ts`
4. **Account Entity**
   - Stores user info for log relations
   - File: `src/entities/account.entity.ts`

## Endpoints
- **REST API**
  - `GET /api/logs` — Get logs with pagination and filtering
  - `GET /api/logs/{id}` — Get specific log by ID

## Sequence Overview
1. Admin/moderator opens SecurityOverviewPage; frontend calls `GET /api/logs` with filters
2. Backend returns paginated logs; frontend displays logs
3. Admin/mod applies filters or searches; frontend calls `GET /api/logs` with updated params
4. Admin/mod clicks a log entry to view details; frontend calls `GET /api/logs/{id}`
5. Backend returns log details; frontend displays in modal/detail view 
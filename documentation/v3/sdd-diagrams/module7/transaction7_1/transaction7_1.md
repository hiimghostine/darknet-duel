# Transaction 7.1: User Search, Ban, and Moderation

## User Interface Design
- Admins and moderators can search for users by username, email, or filters (role, status)
- User list displays key info: username, email, status (active/banned), role, creds, crypts, created date
- Actions available: view profile, edit user, ban/unban user, issue warnings
- Ban/unban actions require confirmation and a reason (for bans)
- UI provides feedback for all moderation actions (success/error)
- Pagination and filtering for large user lists
- Responsive, admin-themed UI

## Frontend Components
1. **UserManagement** (React Component)
   - Displays user list, search/filter controls, and moderation actions
   - File: `src/components/admin/UserManagement.tsx`
2. **BanUserModal** (Modal Component)
   - Handles ban confirmation and reason input
   - File: `src/components/admin/BanUserModal.tsx`
3. **UserEditModal** (Modal Component)
   - Allows editing user details
   - File: `src/components/admin/UserEditModal.tsx`
4. **adminService** (Service Module)
   - Handles API calls for user search, ban, unban, and updates
   - File: `src/services/admin.service.ts`
5. **useAuthStore** (Zustand Store)
   - Provides authentication and user info, including role/type
   - File: `src/store/auth.store.ts`

## Backend Components
1. **AdminController** (Express Controller)
   - Handles REST API requests for user search, ban, unban, and updates
   - Endpoints:
     - `GET /api/admin/users` — Paginated user search/filter
     - `GET /api/admin/users/{id}` — Get user details
     - `PUT /api/admin/users/{id}` — Update user details
     - `POST /api/admin/users/{id}/ban` — Ban user
     - `POST /api/admin/users/{id}/unban` — Unban user
2. **AdminService** (Service Class)
   - Implements moderation logic: search, ban, unban, update, log actions
   - Methods: `getUsers`, `getUserById`, `updateUser`, `banUser`, `unbanUser`
3. **Account Entity**
   - Stores user info, status, role/type, ban reason, etc.
   - File: `src/entities/account.entity.ts`
4. **LogService** (Service Class)
   - Logs moderation actions for audit trail
   - File: `src/services/log.service.ts`

## Endpoints
- **REST API**
  - `GET /api/admin/users` — Search/filter users
  - `GET /api/admin/users/{id}` — Get user details
  - `PUT /api/admin/users/{id}` — Update user details
  - `POST /api/admin/users/{id}/ban` — Ban user
  - `POST /api/admin/users/{id}/unban` — Unban user

## Sequence Overview
1. Admin/moderator searches for users via filters/search bar
2. Frontend calls `GET /api/admin/users` to fetch user list
3. Admin/mod selects a user and action (ban, unban, edit)
4. For ban/unban, frontend calls `POST /api/admin/users/{id}/ban` or `/unban` with reason (for ban)
5. Backend updates user status, logs action, and returns result
6. Frontend updates UI and provides feedback 
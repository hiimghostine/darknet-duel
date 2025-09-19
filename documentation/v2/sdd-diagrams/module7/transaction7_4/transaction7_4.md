# Transaction 7.4: User Modification (Modify Username, Email, Password)

## User Interface Design
- Admins and moderators can search for and select a user account
- User details (username, email, type, status, bio, creds, crypts) are displayed in an editable form
- Admins/mods can modify username, email, password, and other fields
- Form validates input and checks for conflicts (duplicate email/username, invalid format)
- UI provides feedback for all actions (success/error)
- Responsive, admin-themed UI

## Frontend Components
1. **UserManagement** (React Component)
   - Displays user list and provides access to edit actions
   - File: `src/components/admin/UserManagement.tsx`
2. **UserEditModal** (Modal Component)
   - Allows editing user details (username, email, password, etc.)
   - File: `src/components/admin/UserEditModal.tsx`
3. **adminService** (Service Module)
   - Handles API calls for updating user details
   - File: `src/services/admin.service.ts`
4. **useAuthStore** (Zustand Store)
   - Provides authentication and user info, including role/type
   - File: `src/store/auth.store.ts`

## Backend Components
1. **AdminController** (Express Controller)
   - Handles REST API requests for updating user details
   - Endpoints:
     - `PUT /api/admin/users/{id}` — Update user details (username, email, password, etc.)
2. **AdminService** (Service Class)
   - Implements logic for updating user details, validation, and logging
   - Methods: `updateUser`
3. **Account Entity**
   - Stores user info, including username, email, password (hashed), etc.
   - File: `src/entities/account.entity.ts`
4. **LogService** (Service Class)
   - Logs user modifications for audit trail
   - File: `src/services/log.service.ts`

## Endpoints
- **REST API**
  - `PUT /api/admin/users/{id}` — Update user details (username, email, password, etc.)

## Sequence Overview
1. Admin/moderator searches for and selects a user account
2. Admin/mod opens UserEditModal and modifies details
3. Frontend calls `PUT /api/admin/users/{id}` with updated data
4. Backend validates and updates user, logs modification, and returns result
5. Frontend updates UI and provides feedback 
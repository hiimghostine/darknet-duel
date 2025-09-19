# Module 1, Transaction 1.4: Role-Based Access

## Transaction Name
**Role-Based Access (Admin, Moderator, Player)**

## User Interface Design
- Displays user roles visually (e.g., badges/tags for admin and moderator) throughout the UI (profile, dashboard, user lists).
- Restricts access to admin/moderator-only pages and actions (e.g., admin dashboard, user management, moderation tools).
- Hides or disables UI elements for actions not permitted by the user's role.
- Shows error messages or redirects if a user attempts to access a forbidden page or action.
- Allows admins to promote/demote users and assign roles via the admin dashboard.
- Provides clear feedback when role-based actions succeed or fail.

## Frontend Components
- **UserTypeTag.tsx** (React Functional Component)
  - Renders a visual tag for user roles (admin, moderator) in the UI.
  - Used in profile pages, user lists, and admin/moderator dashboards.
- **Admin/Moderator UI Components** (e.g., AdminPage, UserManagement, BanUserModal)
  - Rendered conditionally based on user role.
  - Provide interfaces for user management, banning, role assignment, and moderation actions.
- **auth.store.ts** (Zustand Store)
  - Stores the current user's role/type and exposes it for conditional rendering.
- **Route Guards/ProtectedRoute**
  - Restrict access to certain routes/pages based on user role.

## Backend Components
- **admin-auth.middleware.ts** (Express Middleware)
  - Ensures the authenticated user is an admin before allowing access to admin-only endpoints.
- **moderator-auth.middleware.ts** (Express Middleware)
  - Ensures the authenticated user is a moderator or admin before allowing access to moderator-only endpoints.
- **auth.middleware.ts** (Express Middleware)
  - Ensures the user is authenticated and attaches user info (including role/type) to the request.
- **AdminController** (Controller Class)
  - Handles admin-only endpoints for user management, banning, role assignment, etc.
- **Account Entity** (TypeORM Entity)
  - Includes the `type` field (enum: user, mod, admin) to represent user roles.
- **AccountService/AdminService** (Service Classes)
  - Methods for updating user roles, filtering users by type, and enforcing role-based logic.

### Endpoints
- `GET /api/admin/users` — Get paginated list of users (admin/moderator only)
- `GET /api/admin/users/:id` — Get detailed user info (admin only)
- `PUT /api/admin/users/:id` — Update user details, including role/type (admin only)
- `POST /api/admin/users/:id/ban` — Ban user (admin only)
- `POST /api/admin/users/:id/unban` — Unban user (admin only)
- `GET /api/admin/stats` — Get user statistics for admin dashboard (admin only)
- (Other admin/moderator endpoints as needed)

---

## Sequence Overview
1. User logs in; backend includes user role/type in JWT and frontend state.
2. Frontend conditionally renders UI and restricts routes/actions based on user role.
3. User attempts to access a protected action or page.
4. Frontend checks role and either allows or blocks the action; backend middleware enforces role-based access for protected endpoints.
5. Admins can promote/demote users or assign roles via admin dashboard; backend updates user type in the database.
6. Feedback is provided to the user based on the result of the action. 
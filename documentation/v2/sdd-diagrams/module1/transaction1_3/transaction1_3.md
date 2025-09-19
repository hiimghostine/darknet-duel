# Module 1, Transaction 1.3: Profile Management

## Transaction Name
**Profile Management (View/Edit Profile, Avatar Upload, Stats)**

## User Interface Design
- Displays a profile page with user information, avatar, bio, stats, and recent activity.
- Allows users to edit their profile (email, username, bio, password, avatar) via a modal dialog.
- Provides real-time validation for all editable fields (email, username, password, bio, avatar file type/size).
- Shows error messages for invalid input or backend errors.
- Displays a loading indicator while fetching or updating profile data.
- Allows users to view other users' profiles and stats (read-only, with report option).
- Avatar upload supports image preview, resizing, and validation.
- Visual feedback (animations, toasts, modals) for actions and errors.

## Frontend Components
- **ProfilePage.tsx** (React Functional Component)
  - Displays the user's profile, stats, and recent activity.
  - Handles navigation, loading, and error states.
  - Integrates EditProfileModal and ReportModal for editing/reporting.
- **EditProfileModal.tsx** (React Functional Component)
  - Modal dialog for editing profile fields and uploading avatar.
  - Handles form state, validation, and submission.
  - Provides image preview and resizing for avatar uploads.
- **UserProfilePopup.tsx** (React Functional Component)
  - Displays a popup with summary info and stats for any user.
  - Used for quick profile viewing in other parts of the app.
- **account.service.ts** (Service Class)
  - Handles API requests for getting/updating account data and avatar upload.
- **info.service.ts** (Service Class)
  - Handles API requests for fetching profile stats and recent activity.

## Backend Components
- **account.routes.ts** (Express Router)
  - Defines endpoints for getting/updating own account, getting account by UUID, and searching users.
- **AccountController** (Controller Class)
  - Methods:
    - `getMyAccount(req, res)` — Retrieves the authenticated user's account details.
    - `updateMyAccount(req, res)` — Updates the authenticated user's account (email, username, password, bio, avatar).
    - `getAccountByUuid(req, res)` — Retrieves public account info for any user by UUID.
    - `searchAccountByUsername(req, res)` — Searches for users by username.
- **InfoController** (Controller Class)
  - Methods:
    - `getProfile(req, res)` — Retrieves profile info, stats, and recent activity for the authenticated user.
    - `getProfileByUserId(req, res)` — Retrieves profile info, stats, and recent activity for any user by UUID.
    - `getProfileStats(req, res)` — Retrieves only the statistical info for the authenticated user.
    - `getRecentActivity(req, res)` — Retrieves only the recent activity for the authenticated user.
- **FilesController** (Controller Class)
  - Method: `getAvatar(req, res)` — Retrieves avatar image for a user by UUID.
- **AccountService** (Service Class)
  - Methods:
    - `updateAccount(id, updateData)` — Updates user account data in the database.
    - `getAvatarById(id)` — Retrieves avatar image data for a user.
- **Validation Utils**
  - Used for validating email, password, and bio fields.
- **Avatar Upload Middleware**
  - Handles file upload and validation for avatar images.
- **Account Entity** (TypeORM Entity)
  - Represents the `accounts` table in the database, including fields for id, email, username, password, bio, avatar, etc.

### Endpoints
- `GET /api/account/me` — Get current user's account details (auth required)
- `POST /api/account/me` — Update current user's account (auth required, supports multipart/form-data for avatar)
- `GET /api/account/:uuid` — Get public account info for any user (auth required)
- `GET /api/files/avatar/:uuid` — Get avatar image for a user (public)
- `GET /api/info/profile` — Get profile info, stats, and recent activity for current user (auth required)
- `GET /api/info/profile/:userId` — Get profile info, stats, and recent activity for any user (auth required)
- `GET /api/info/stats` — Get profile stats for current user (auth required)
- `GET /api/info/activity` — Get recent activity for current user (auth required)

---

## Sequence Overview
1. User navigates to their profile page or another user's profile.
2. Frontend fetches profile/account data, stats, and recent activity from backend.
3. User edits their profile via modal, updates fields, and uploads avatar if desired.
4. Frontend validates input and sends update request (with avatar as multipart/form-data if present).
5. Backend validates, updates account, and stores avatar image.
6. Frontend displays updated profile and feedback to user. 
# Module 1, Transaction 1.1: User Registration

## Transaction Name
**User Registration**

## User Interface Design
- Presents a registration form with fields for username, email, password, and confirm password.
- Real-time validation for all fields (username length, email format, password strength, password match).
- Displays error messages for invalid input or backend errors (e.g., email/username already exists).
- Shows a success message and auto-login/redirects on successful registration.
- Provides a link/button to switch to the login form for existing users.
- Visual feedback (animations, loading indicators) during registration process.

## Frontend Components
- **RegisterForm.tsx** (React Functional Component)
  - Renders the registration form UI and handles form state/validation using `react-hook-form` and `zod`.
  - Calls the registration API via the auth store and displays success/error messages.
  - Triggers audio/visual feedback on success or error.
- **auth.store.ts** (Zustand Store)
  - Manages authentication state, loading, and error messages.
  - Implements the `register` action, which calls the backend and handles auto-login on success.
- **auth.service.ts** (Service Class)
  - Handles API requests for registration, login, and profile retrieval.
  - Implements the `register` method to POST registration data to `/api/auth/register`.

## Backend Components
- **auth.routes.ts** (Express Router)
  - Defines the registration endpoint: `POST /api/auth/register`.
- **AuthController** (Controller Class)
  - Method: `register(req, res)`
    - Validates input (email, username, password).
    - Checks for existing user (by email or username).
    - Hashes password and creates new user via AuthService.
    - Returns user data (without password) on success, or error messages on failure.
- **AuthService** (Service Class)
  - Methods:
    - `createUser(userData)` — Persists new user to the database.
    - `findByEmailOrUsername(email, username)` — Checks for existing users.
- **Account Entity** (TypeORM Entity)
  - Represents the `accounts` table in the database, including fields for id, email, username, password, etc.
- **Validation Utils**
  - `validateEmail(email)` — Checks email format.
  - `validatePassword(password)` — Checks password strength.

### Endpoints
- `POST /api/auth/register`
  - Request Body: `{ email, username, password }`
  - Responses:
    - `201 Created`: User registered successfully.
    - `400 Bad Request`: Validation errors.
    - `409 Conflict`: Email or username already exists.
    - `500 Internal Server Error`: Server error.

---

## Sequence Overview
1. User fills out the registration form and submits.
2. Frontend validates input and sends POST request to `/api/auth/register`.
3. Backend validates input, checks for existing user, hashes password, and creates new user.
4. Backend responds with success or error message.
5. Frontend displays result and (on success) auto-logs in the user. 
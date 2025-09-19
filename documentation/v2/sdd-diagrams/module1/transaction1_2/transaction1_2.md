# Module 1, Transaction 1.2: User Login

## Transaction Name
**User Login**

## User Interface Design
- Presents a login form with fields for email and password.
- Real-time validation for email format and required password.
- Displays error messages for invalid input or backend errors (e.g., invalid credentials, inactive account).
- Shows a loading indicator during authentication.
- Provides a link/button to switch to the registration form for new users.
- Visual feedback (animations, error flashes) on authentication failure.

## Frontend Components
- **LoginForm.tsx** (React Functional Component)
  - Renders the login form UI and handles form state/validation using `react-hook-form` and `zod`.
  - Calls the login API via the auth store and displays success/error messages.
  - Triggers audio/visual feedback on success or error.
- **auth.store.ts** (Zustand Store)
  - Manages authentication state, loading, and error messages.
  - Implements the `login` action, which calls the backend and updates authentication state.
- **auth.service.ts** (Service Class)
  - Handles API requests for login, registration, and profile retrieval.
  - Implements the `login` method to POST login data to `/api/auth/login`.

## Backend Components
- **auth.routes.ts** (Express Router)
  - Defines the login endpoint: `POST /api/auth/login`.
- **AuthController** (Controller Class)
  - Method: `login(req, res)`
    - Validates input (email, password).
    - Checks for user existence and account status.
    - Verifies password and issues JWT token on success.
    - Returns user data (without password) and token on success, or error messages on failure.
- **AuthService** (Service Class)
  - Methods:
    - `findByEmail(email)` — Retrieves user by email.
    - `updateLastLogin(id)` — Updates last login timestamp.
    - `logUserLogin(userId, username)` — Logs successful login.
    - `logFailedLogin(email, reason)` — Logs failed login attempts.
- **Account Entity** (TypeORM Entity)
  - Represents the `accounts` table in the database, including fields for id, email, username, password, etc.

### Endpoints
- `POST /api/auth/login`
  - Request Body: `{ email, password }`
  - Responses:
    - `200 OK`: User logged in successfully, returns JWT token and user info.
    - `400 Bad Request`: Missing email or password.
    - `401 Unauthorized`: Invalid credentials or inactive account.
    - `500 Internal Server Error`: Server error.

---

## Sequence Overview
1. User fills out the login form and submits.
2. Frontend validates input and sends POST request to `/api/auth/login`.
3. Backend validates input, checks for user existence and account status, verifies password, and issues JWT token.
4. Backend responds with success or error message.
5. Frontend displays result and (on success) updates authentication state and redirects user. 
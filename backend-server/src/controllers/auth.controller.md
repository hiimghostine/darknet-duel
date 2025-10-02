# AuthController API Documentation

This document provides a comprehensive overview of all endpoints handled by `AuthController` in the backend-server.

## Endpoints

### 1. Register a New User
- **Endpoint:** `POST /api/auth/register`
- **Description:** Creates a new user account in the system.
- **Request Body:**
  - `application/json` with fields: `email`, `username`, `password`
- **Responses:**
  - `201 Created`: User successfully registered.
  - `400 Bad Request`: Validation errors (missing fields, invalid email, weak password).
  - `409 Conflict`: Email or username already exists.
  - `500 Internal Server Error`: Server error.

### 2. Login a User
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates a user and returns a JWT token.
- **Request Body:**
  - `application/json` with fields: `email`, `password`
- **Responses:**
  - `200 OK`: User successfully logged in, returns JWT token and user info.
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid credentials or disabled account.
  - `500 Internal Server Error`: Server error.

### 3. Get Current User Profile
- **Endpoint:** `GET /api/auth/profile`
- **Description:** Retrieves the authenticated user's profile information.
- **Security:** Bearer token required.
- **Responses:**
  - `200 OK`: User profile retrieved successfully.
  - `401 Unauthorized`: Invalid or missing token.
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Server error.

## Error Handling
- All endpoints return a JSON object with a `message` field on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- Passwords are hashed before storage.
- JWT tokens are used for authentication and must be included in the `Authorization` header for protected endpoints. 
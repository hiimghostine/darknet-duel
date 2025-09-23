# AccountController API Documentation

This document provides a comprehensive overview of all endpoints handled by `AccountController` in the backend-server.

## Endpoints

### 1. Get Current User's Account Details
- **Endpoint:** `GET /api/account/me`
- **Description:** Retrieves the authenticated user's complete account information.
- **Security:** Bearer token required.
- **Responses:**
  - `200 OK`: Account details retrieved successfully.
  - `401 Unauthorized`: Invalid or missing token.
  - `404 Not Found`: User account not found.
  - `500 Internal Server Error`: Server error.

### 2. Update Current User's Account Details
- **Endpoint:** `POST /api/account/me`
- **Description:** Updates the authenticated user's account information (email, username, password, bio, avatar).
- **Security:** Bearer token required.
- **Request Body:**
  - `multipart/form-data` or `application/json` with fields: `email`, `username`, `password`, `bio`, `avatar` (file)
- **Responses:**
  - `200 OK`: Account updated successfully.
  - `400 Bad Request`: Validation errors (invalid email, weak password, bio too long, no fields to update).
  - `401 Unauthorized`: Invalid or missing token.
  - `409 Conflict`: Email or username already exists.
  - `500 Internal Server Error`: Server error.

### 3. Get User Account Details by UUID
- **Endpoint:** `GET /api/account/{uuid}`
- **Description:** Retrieves public account information for any user by their UUID.
- **Security:** Bearer token required.
- **Path Parameter:**
  - `uuid` (string, required): The UUID of the user account to retrieve.
- **Responses:**
  - `200 OK`: Account details retrieved successfully.
  - `400 Bad Request`: Invalid UUID format.
  - `401 Unauthorized`: Invalid or missing token.
  - `404 Not Found`: User account not found.
  - `500 Internal Server Error`: Server error.

### 4. Search User Account by Username
- **Endpoint:** `GET /api/account/search?username={username}`
- **Description:** Retrieves public account information for any user by their username.
- **Security:** Bearer token required.
- **Query Parameter:**
  - `username` (string, required): The username of the user account to retrieve.
- **Responses:**
  - `200 OK`: Account details retrieved successfully.
  - `400 Bad Request`: Username parameter missing.
  - `401 Unauthorized`: Invalid or missing token.
  - `404 Not Found`: User account not found.
  - `500 Internal Server Error`: Server error.

## Error Handling
- All endpoints return a JSON object with `success` and `message` fields on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- Sensitive information (such as email) is only returned to the authenticated user.
- Public endpoints only return non-sensitive user data.
- Avatar uploads are supported via `multipart/form-data`. 
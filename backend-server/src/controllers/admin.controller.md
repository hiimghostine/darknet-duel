# AdminController API Documentation

This document provides a comprehensive overview of all endpoints handled by `AdminController` in the backend-server.

## Endpoints

### 1. Get Paginated List of Users
- **Endpoint:** `GET /api/admin/users`
- **Description:** Retrieve all users with pagination, search, and filtering capabilities.
- **Security:** Bearer token (admin required).
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20, max: 100)
  - `search` (string)
  - `type` (string: user, mod, admin)
  - `isActive` (boolean)
- **Responses:**
  - `200 OK`: Users retrieved successfully.
  - `401 Unauthorized`: Not an admin.
  - `500 Internal Server Error`: Server error.

### 2. Get Detailed User Information
- **Endpoint:** `GET /api/admin/users/{id}`
- **Description:** Get comprehensive user details including sensitive information.
- **Security:** Bearer token (admin required).
- **Path Parameter:**
  - `id` (string, required): User ID (UUID)
- **Responses:**
  - `200 OK`: User details retrieved successfully.
  - `404 Not Found`: User not found.
  - `401 Unauthorized`: Not an admin.

### 3. Update User Details
- **Endpoint:** `PUT /api/admin/users/{id}`
- **Description:** Update any user details including account type and sensitive information.
- **Security:** Bearer token (admin required).
- **Path Parameter:**
  - `id` (string, required): User ID (UUID)
- **Request Body:**
  - `application/json` with fields: `email`, `username`, `type`, `isActive`, `bio`, `creds`, `crypts`, `password`
- **Responses:**
  - `200 OK`: User updated successfully.
  - `400 Bad Request`: Invalid input data.
  - `404 Not Found`: User not found.
  - `409 Conflict`: Email or username already exists.
  - `401 Unauthorized`: Not an admin.

### 4. Delete User Account
- **Endpoint:** `DELETE /api/admin/users/{id}`
- **Description:** Permanently delete a user account and all associated data.
- **Security:** Bearer token (admin required).
- **Path Parameter:**
  - `id` (string, required): User ID (UUID)
- **Responses:**
  - `200 OK`: User deleted successfully.
  - `404 Not Found`: User not found.
  - `401 Unauthorized`: Not an admin.
  - `403 Forbidden`: Cannot delete own account or other admins.

### 5. Get User Statistics for Admin Dashboard
- **Endpoint:** `GET /api/admin/stats`
- **Description:** Retrieve various user statistics for the admin dashboard.
- **Security:** Bearer token (admin required).
- **Responses:**
  - `200 OK`: User statistics retrieved successfully.
  - `401 Unauthorized`: Not an admin.

### 6. Ban User Account
- **Endpoint:** `POST /api/admin/users/{id}/ban`
- **Description:** Deactivate a user account with a ban reason.
- **Security:** Bearer token (admin required).
- **Path Parameter:**
  - `id` (string, required): User ID (UUID)
- **Request Body:**
  - `application/json` with field: `reason` (string, required)
- **Responses:**
  - `200 OK`: User banned successfully.
  - `400 Bad Request`: Invalid request or cannot ban admin accounts.
  - `404 Not Found`: User not found.
  - `401 Unauthorized`: Not an admin.

### 7. Unban User Account
- **Endpoint:** `POST /api/admin/users/{id}/unban`
- **Description:** Reactivate a banned user account.
- **Security:** Bearer token (admin required).
- **Path Parameter:**
  - `id` (string, required): User ID (UUID)
- **Responses:**
  - `200 OK`: User unbanned successfully.
  - `404 Not Found`: User not found.
  - `401 Unauthorized`: Not an admin.

## Error Handling
- All endpoints return a JSON object with `success` and `message` fields on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- Only admins can access these endpoints.
- Attempts to delete or ban admin accounts are forbidden. 
# InfoController API Documentation

This document provides a comprehensive overview of all endpoints handled by `InfoController` in the backend-server.

## Endpoints

### 1. Get Complete User Profile Information
- **Endpoint:** `GET /api/info/profile`
- **Description:** Retrieves user profile including recent activity and statistics for the authenticated user.
- **Security:** Bearer token required.
- **Query Parameters:**
  - `limit` (integer, default: 10, max: 50): Maximum number of recent activities to return.
- **Responses:**
  - `200 OK`: Profile information retrieved successfully.
  - `401 Unauthorized`: Invalid or missing token.
  - `500 Internal Server Error`: Server error.

### 2. Get User Recent Activity
- **Endpoint:** `GET /api/info/activity`
- **Description:** Retrieves only the recent activity history for the authenticated user.
- **Security:** Bearer token required.
- **Query Parameters:**
  - `limit` (integer, default: 10, max: 50): Maximum number of recent activities to return.
- **Responses:**
  - `200 OK`: Recent activity retrieved successfully.
  - `401 Unauthorized`: Invalid or missing token.
  - `500 Internal Server Error`: Server error.

### 3. Get User Profile Statistics
- **Endpoint:** `GET /api/info/stats`
- **Description:** Retrieves only the statistical information for the authenticated user.
- **Security:** Bearer token required.
- **Responses:**
  - `200 OK`: Profile statistics retrieved successfully.
  - `401 Unauthorized`: Invalid or missing token.
  - `500 Internal Server Error`: Server error.

### 4. Get Any User's Profile Information by ID
- **Endpoint:** `GET /api/info/profile/{userId}`
- **Description:** Retrieves user profile including recent activity and statistics for any user by their UUID.
- **Security:** Bearer token required.
- **Path Parameter:**
  - `userId` (string, required): The UUID of the user to get profile information for.
- **Query Parameters:**
  - `limit` (integer, default: 10, max: 50): Maximum number of recent activities to return.
- **Responses:**
  - `200 OK`: Profile information retrieved successfully.
  - `400 Bad Request`: Invalid UUID format.
  - `401 Unauthorized`: Invalid or missing token.
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Server error.

## Error Handling
- All endpoints return a JSON object with `success` and `message` fields on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- Only authenticated users can access these endpoints.
- Recent activity and statistics are paginated and limited for performance. 
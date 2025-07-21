# LogController API Documentation

This document provides a comprehensive overview of all endpoints handled by `LogController` in the backend-server.

## Endpoints

### 1. Get Logs (Admin Only)
- **Endpoint:** `GET /api/logs`
- **Description:** Retrieves logs with pagination. Admin only.
- **Query Parameters:**
  - `page` (integer, default: 1): Page number for pagination.
  - `limit` (integer, default: 50): Number of logs per page.
  - `userId` (string, optional): Filter logs by user ID.
- **Responses:**
  - `200 OK`: Logs retrieved successfully.
  - `500 Internal Server Error`: Failed to get logs.

### 2. Get Specific Log by ID (Admin Only)
- **Endpoint:** `GET /api/logs/{id}`
- **Description:** Retrieves a specific log entry by its ID. Admin only.
- **Path Parameter:**
  - `id` (string, required): Log ID.
- **Responses:**
  - `200 OK`: Log retrieved successfully.
  - `404 Not Found`: Log not found.
  - `500 Internal Server Error`: Failed to get log.

## Error Handling
- All endpoints return a JSON object with an `error` field on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- Only admins can access these endpoints. 
# FilesController API Documentation

This document provides a comprehensive overview of all endpoints handled by `FilesController` in the backend-server.

## Endpoints

### 1. Get User Avatar Image
- **Endpoint:** `GET /api/files/avatar/{uuid}`
- **Description:** Retrieves the avatar image file for a user by their UUID. If the user has no custom avatar, returns the default logo.png.
- **Path Parameter:**
  - `uuid` (string, required): The UUID of the user whose avatar to retrieve.
- **Responses:**
  - `200 OK`: Avatar image retrieved successfully (image/jpeg, image/png, image/gif, or image/webp).
  - `400 Bad Request`: Invalid UUID format.
  - `404 Not Found`: User not found or system error (fallback to default logo in most cases).
  - `500 Internal Server Error`: Server error.

## Error Handling
- All endpoints return a JSON object with `success` and `message` fields on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- If the user does not have a custom avatar, the default logo is served.
- Caching headers and ETags are set for avatar images. 
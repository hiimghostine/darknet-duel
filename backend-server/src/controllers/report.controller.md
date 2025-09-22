# ReportController API Documentation

This document provides a comprehensive overview of all endpoints handled by `ReportController` in the backend-server.

## Endpoints

### 1. Create a New Report
- **Endpoint:** `POST /api/reports`
- **Description:** Create a report for a user or chat message.
- **Security:** Bearer token required.
- **Request Body:**
  - `application/json` with fields: `reporteeId` (UUID), `reason` (string), `content` (string, optional), `reportType` (profile|chat)
- **Responses:**
  - `201 Created`: Report created successfully.
  - `400 Bad Request`: Invalid input data.
  - `401 Unauthorized`: Authentication required.
  - `500 Internal Server Error`: Server error.

### 2. Get Reports for Admin Review
- **Endpoint:** `GET /api/admin/reports`
- **Description:** Retrieve paginated list of reports with filtering options. Admin only.
- **Security:** Bearer token (admin required).
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20, max: 100)
  - `status` (pending|reviewed|resolved|dismissed)
  - `reportType` (profile|chat)
  - `search` (string)
- **Responses:**
  - `200 OK`: Reports retrieved successfully.
  - `401 Unauthorized`: Not an admin.
  - `500 Internal Server Error`: Server error.

### 3. Get Detailed Report Information
- **Endpoint:** `GET /api/admin/reports/{id}`
- **Description:** Get comprehensive report details including user information. Admin only.
- **Security:** Bearer token (admin required).
- **Path Parameter:**
  - `id` (string, required): Report ID (UUID)
- **Responses:**
  - `200 OK`: Report details retrieved successfully.
  - `404 Not Found`: Report not found.
  - `401 Unauthorized`: Not an admin.

### 4. Update Report Status
- **Endpoint:** `PUT /api/admin/reports/{id}/status`
- **Description:** Update the status of a report (reviewed, resolved, dismissed). Admin only.
- **Security:** Bearer token (admin required).
- **Path Parameter:**
  - `id` (string, required): Report ID (UUID)
- **Request Body:**
  - `application/json` with field: `status` (pending|reviewed|resolved|dismissed)
- **Responses:**
  - `200 OK`: Report status updated successfully.
  - `400 Bad Request`: Invalid status value.
  - `404 Not Found`: Report not found.
  - `401 Unauthorized`: Not an admin.

### 5. Delete a Report
- **Endpoint:** `DELETE /api/admin/reports/{id}`
- **Description:** Permanently delete a report. Admin only.
- **Security:** Bearer token (admin required).
- **Path Parameter:**
  - `id` (string, required): Report ID (UUID)
- **Responses:**
  - `200 OK`: Report deleted successfully.
  - `404 Not Found`: Report not found.
  - `401 Unauthorized`: Not an admin.

### 6. Get Report Statistics
- **Endpoint:** `GET /api/admin/reports/stats`
- **Description:** Get report statistics for admin dashboard. Admin only.
- **Security:** Bearer token (admin required).
- **Responses:**
  - `200 OK`: Report statistics retrieved successfully.
  - `401 Unauthorized`: Not an admin.

## Error Handling
- All endpoints return a JSON object with `success` and `message` fields on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- Only admins can access admin report endpoints.
- Users cannot report themselves. 
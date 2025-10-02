# CurrencyController API Documentation

This document provides a comprehensive overview of all endpoints handled by `CurrencyController` in the backend-server.

## Endpoints

### 1. Get User's Currency Balance
- **Endpoint:** `GET /api/currency/balance`
- **Description:** Retrieves the authenticated user's currency balance.
- **Security:** Bearer token required.
- **Responses:**
  - `200 OK`: Currency balance retrieved successfully.
  - `401 Unauthorized`: Authentication required.
  - `404 Not Found`: User not found.

### 2. Add Currency to User's Account (Admin Only)
- **Endpoint:** `POST /api/currency/add`
- **Description:** Adds currency to a user's account. Admin only.
- **Security:** Bearer token required.
- **Request Body:**
  - `application/json` with fields: `userId` (string), `type` (creds|crypts), `amount` (integer), `reason` (string, optional)
- **Responses:**
  - `200 OK`: Currency added successfully.
  - `400 Bad Request`: Invalid request data.
  - `401 Unauthorized`: Authentication required.
  - `404 Not Found`: User not found.

### 3. Subtract Currency from User's Account (Admin Only)
- **Endpoint:** `POST /api/currency/subtract`
- **Description:** Subtracts currency from a user's account. Admin only.
- **Security:** Bearer token required.
- **Request Body:**
  - `application/json` with fields: `userId` (string), `type` (creds|crypts), `amount` (integer), `reason` (string, optional)
- **Responses:**
  - `200 OK`: Currency subtracted successfully.
  - `400 Bad Request`: Invalid request data or insufficient funds.
  - `401 Unauthorized`: Authentication required.
  - `404 Not Found`: User not found.

### 4. Transfer Currency Between Users
- **Endpoint:** `POST /api/currency/transfer`
- **Description:** Transfers currency from the authenticated user to another user.
- **Security:** Bearer token required.
- **Request Body:**
  - `application/json` with fields: `toUserId` (string), `type` (creds|crypts), `amount` (integer)
- **Responses:**
  - `200 OK`: Currency transferred successfully.
  - `400 Bad Request`: Invalid request data or insufficient funds.
  - `401 Unauthorized`: Authentication required.
  - `404 Not Found`: One or both users not found.

## Error Handling
- All endpoints return a JSON object with `success` and `message` fields on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- Only admins can add or subtract currency from other users.
- Users cannot transfer currency to themselves. 
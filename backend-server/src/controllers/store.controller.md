# StoreController API Documentation

This document provides a comprehensive overview of all endpoints handled by `StoreController` in the backend-server.

## Endpoints

### 1. Get Store Data
- **Endpoint:** `GET /api/store`
- **Description:** Retrieves all available store categories and items.
- **Security:** Bearer token required.
- **Responses:**
  - `200 OK`: Store data retrieved successfully.
  - `401 Unauthorized`: Authentication required.
  - `500 Internal Server Error`: Server error.

### 2. Get User's Purchases
- **Endpoint:** `GET /api/store/purchases`
- **Description:** Retrieves all items purchased by the authenticated user.
- **Security:** Bearer token required.
- **Responses:**
  - `200 OK`: User purchases retrieved successfully.
  - `401 Unauthorized`: Authentication required.
  - `500 Internal Server Error`: Server error.

### 3. Purchase an Item
- **Endpoint:** `POST /api/purchase/{itemId}`
- **Description:** Purchase a decoration or other store item.
- **Security:** Bearer token required.
- **Path Parameter:**
  - `itemId` (string, required): The ID of the item to purchase.
- **Request Body:**
  - `application/json` with field: `itemType` (string, default: decoration)
- **Responses:**
  - `200 OK`: Item purchased successfully.
  - `400 Bad Request`: Already owned, insufficient funds, or other error.
  - `401 Unauthorized`: Authentication required.
  - `404 Not Found`: Item not found.
  - `500 Internal Server Error`: Server error.

### 4. Apply Decoration to User Account
- **Endpoint:** `POST /api/account/apply/decoration/{decorationId}`
- **Description:** Apply a purchased decoration to the user's account.
- **Security:** Bearer token required.
- **Path Parameter:**
  - `decorationId` (string, required): The ID of the decoration to apply.
- **Responses:**
  - `200 OK`: Decoration applied successfully.
  - `400 Bad Request`: Decoration not owned, not found, or other error.
  - `401 Unauthorized`: Authentication required.
  - `500 Internal Server Error`: Server error.

### 5. Remove Current Decoration
- **Endpoint:** `POST /api/account/remove/decoration`
- **Description:** Remove the currently applied decoration from user's account.
- **Security:** Bearer token required.
- **Responses:**
  - `200 OK`: Decoration removed successfully.
  - `401 Unauthorized`: Authentication required.
  - `500 Internal Server Error`: Server error.

### 6. Get Decoration Image File
- **Endpoint:** `GET /api/files/decorations/{decorationId}.png`
- **Description:** Retrieve decoration image by ID.
- **Path Parameter:**
  - `decorationId` (string, required): The decoration ID.
- **Responses:**
  - `200 OK`: Decoration image retrieved successfully (image/png).
  - `404 Not Found`: Decoration not found.

### 7. Get Banner Image File
- **Endpoint:** `GET /api/files/banners/{bannerId}.png`
- **Description:** Retrieve banner image by ID.
- **Path Parameter:**
  - `bannerId` (string, required): The banner ID.
- **Responses:**
  - `200 OK`: Banner image retrieved successfully (image/png).
  - `404 Not Found`: Banner not found.

### 8. Get Banner Text Image File
- **Endpoint:** `GET /api/files/bannertext/{bannerTextId}.png`
- **Description:** Retrieve banner text image by ID.
- **Path Parameter:**
  - `bannerTextId` (string, required): The banner text ID.
- **Responses:**
  - `200 OK`: Banner text image retrieved successfully (image/png).
  - `404 Not Found`: Banner text not found.

## Error Handling
- All endpoints return a JSON object with `success` and `message` fields on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- Only authenticated users can purchase and apply decorations.
- Image endpoints return raw image data with appropriate headers. 
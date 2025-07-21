# StorePage

## Overview
The `StorePage` allows authenticated users to browse and purchase avatar decorations and other items using in-game currencies (creds and crypts). It displays available categories, user balance, and handles purchases and item application.

## Route
- **Path:** `/store`
- **Access:** Protected (requires authentication)

## Purpose
- Lets users browse and buy avatar decorations and other store items.
- Shows user balance (creds and crypts).
- Allows users to apply owned decorations to their profile.

## UI Structure
- **Header:**
  - AppBar with navigation (store, dashboard, lobbies, profile, logout, theme toggle).
- **Main Content:**
  - Store header with user balance.
  - Error state for failed data loads.
  - List of store categories (each with banner, description, and items):
    - Each item shows preview, name, description, price, and purchase/apply button.
    - Owned items are marked and can be applied.
- **Decorative Elements:**
  - Cyberpunk grid, gradients, and themed backgrounds.

## Logic
- Uses `useAuthStore` for authentication and user info.
- Uses `useThemeStore` for theme management.
- Fetches store data, user purchases, and balance from services.
- Handles item purchase and application.
- Handles loading, error, and logout states.
- Redirects to `/auth` if not authenticated.

## Navigation
- **To Store:** `/store`
- **To Dashboard:** `/dashboard`
- **To Lobbies:** `/lobbies`
- **To Profile:** `/profile/:id`
- **To Logout:** `/auth` (after logout)

## Notable Features
- Purchasable and applicable avatar decorations.
- Real-time balance updates after purchase.
- Animated, cyberpunk-themed UI.
- Responsive design for all devices.

---

**Component file:** `src/pages/StorePage.tsx` 
# GameHistoryPage

## Overview
The `GameHistoryPage` displays a user's past games, including results, details, and player information. It allows users to review their combat history, see detailed match breakdowns, and load more records with pagination.

## Route
- **Path:** `/history`
- **Access:** Protected (requires authentication)

## Purpose
- Shows a list of the user's previous games (combat missions).
- Allows users to expand each game for detailed information (players, stats, outcome).
- Supports pagination to load more records.

## UI Structure
- **Header:**
  - Navigation (dashboard, lobbies, profile, top-up, theme toggle).
- **Main Content:**
  - Banner with user info and access status.
  - List of games (each expandable for details):
    - Result (victory/defeat), opponent, role, mode, time, duration, turns, rating change.
    - Expanded details: mission details, outcome, timestamps, player info (avatars, bios, ratings, win/loss).
  - Load more button for pagination.
  - Empty state if no records.
- **Decorative Elements:**
  - Cyberpunk backgrounds, gradients, and scanlines.

## Logic
- Uses `useAuthStore` for authentication and user info.
- Fetches game history and details from `gameService`.
- Fetches player profiles as needed for expanded details.
- Handles loading, error, and pagination states.
- Redirects to `/auth` if not authenticated.

## Navigation
- **To Game History:** `/history`
- **To Dashboard:** `/dashboard`
- **To Lobbies:** `/lobbies`
- **To Profile:** `/profile/:id`
- **To Top Up:** `/topup`
- **To Logout:** `/auth` (after logout)

## Notable Features
- Expandable game records for detailed review.
- Pagination for large histories.
- Animated, cyberpunk-themed UI.
- Responsive design for all devices.

---

**Component file:** `src/pages/GameHistoryPage.tsx` 
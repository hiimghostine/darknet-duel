# LobbyPage

## Overview
The `LobbyPage` is the main hub for multiplayer game lobbies in Darknet Duel. It allows users to browse, create, and join lobbies, as well as chat with other players. The page is protected and only accessible to authenticated users.

## Route
- **Path:** `/lobbies/*`
- **Access:** Protected (requires authentication)
- **Sub-routes:**
  - `/lobbies/` — Lobby browser and global chat
  - `/lobbies/create` — Create a new lobby
  - `/lobbies/:matchID` — View details for a specific lobby

## Purpose
- Lets users browse available lobbies and join games.
- Allows users to create new lobbies.
- Provides a global chat for lobby participants.
- Displays lobby details for a selected match.

## UI Structure
- **Header:**
  - AppBar with navigation (lobbies, dashboard, profile, store, logout, theme toggle).
- **Main Content:**
  - Banner with connection status and user info.
  - Sub-route content:
    - **Lobby Browser:** List of available lobbies and global chat.
    - **Create Lobby:** Form to create a new game lobby.
    - **Lobby Detail:** Details and join options for a specific lobby.
- **Chat:**
  - IRC-style chat at the bottom of the main lobby browser.
- **Decorative Elements:**
  - Cyberpunk grid, scanlines, and themed typography.

## Logic
- Uses `useAuthStore` for authentication and user info.
- Uses `useThemeStore` for theme management.
- Handles loading and logout animations.
- Uses React Router's nested `Routes` to render sub-pages:
  - `/lobbies/` renders `LobbyBrowser` and `LobbyChat`.
  - `/lobbies/create` renders `CreateLobby`.
  - `/lobbies/:matchID` renders `LobbyDetail`.
- Redirects to `/auth` if not authenticated.

## Navigation
- **To Lobby Browser:** `/lobbies/`
- **To Create Lobby:** `/lobbies/create`
- **To Lobby Detail:** `/lobbies/:matchID`
- **To Dashboard:** `/dashboard`
- **To Profile:** `/profile/:id`
- **To Store:** `/store`
- **To Logout:** `/auth` (after logout)

## Notable Features
- Real-time lobby list and chat.
- Sub-routing for different lobby-related views.
- Animated, cyberpunk-themed UI.
- Responsive design for all devices.

---

**Component file:** `src/pages/LobbyPage.tsx` 
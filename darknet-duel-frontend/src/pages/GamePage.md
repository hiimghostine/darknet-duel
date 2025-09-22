# GamePage

## Overview
The `GamePage` is the entry point for the actual game client in Darknet Duel. It is responsible for rendering the game interface and connecting the user to a specific match.

## Route
- **Path:** `/game/:matchID`
- **Access:** Protected (requires authentication)

## Purpose
- Hosts the main game client for a specific match.
- Ensures only authenticated users can access the game.
- Passes the match ID from the URL to the game client.

## UI Structure
- **Main Content:**
  - Renders the `GameClient` component, which handles all game logic, UI, and server communication.

## Logic
- Uses `useAuthStore` to check authentication status.
- Redirects to `/login` if the user is not authenticated.
- Extracts the `matchID` from the URL and passes it to the game client.

## Navigation
- **To Game:** `/game/:matchID` (from lobby or direct link)
- **To Login:** `/login` (if not authenticated)
- **To Lobbies:** (handled by `GameClient` on leave)

## Notable Features
- Minimal wrapper; all game logic is handled in `GameClient`.
- Ensures secure access to game sessions.

---

**Component file:** `src/pages/GamePage.tsx` 
# HomePage

## Overview
The `HomePage` is the landing page of the Darknet Duel frontend. It serves as the entry point for both authenticated and unauthenticated users, providing a visually engaging introduction to the application and guiding users to authentication or dashboard features.

## Route
- **Path:** `/`
- **Access:** Public (no authentication required)

## Purpose
- Introduces the Darknet Duel platform with a cyberpunk-themed UI.
- Offers navigation to login/register (for new users) or dashboard/lobby (for authenticated users).
- Displays branding, version info, and a call-to-action to access the network or create an identity.

## UI Structure
- **Header:**
  - Logo and app name (clickable for authenticated users, navigates to dashboard).
  - Theme toggle button (switches between themes, e.g., GHOST_CORP and PHOENIX_NET).
- **Main Content:**
  - Title and subtitle introducing the game.
  - Description of the platform and its features.
  - Action buttons:
    - If not authenticated: `ACCESS_NETWORK` (login) and `CREATE_IDENTITY` (register).
    - If authenticated: `DASHBOARD` and `FIND_MATCH` (lobby).
  - Decorative cyberpunk elements and a cover image.
  - System status indicator (e.g., network online).
- **Footer:**
  - Version info and system access date.

## Logic
- Uses `useAuthStore` to determine authentication state.
- Uses `useThemeStore` for theme management and toggling.
- Handles logo click: navigates to dashboard if authenticated.
- Renders different action buttons based on authentication state.

## Navigation
- **To Auth Page:** `/auth` (login)
- **To Register:** `/auth?register=true`
- **To Dashboard:** `/dashboard` (if authenticated)
- **To Lobby:** `/lobby` (if authenticated)

## Notable Features
- Responsive design for mobile and desktop.
- Animated and styled with cyberpunk/cybernetic visual elements.
- Theme toggle with visual feedback.
- Version and system status display.

---

**Component file:** `src/pages/HomePage.tsx` 
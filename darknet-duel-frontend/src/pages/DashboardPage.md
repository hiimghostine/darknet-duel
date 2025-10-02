# DashboardPage

## Overview
The `DashboardPage` is the main user dashboard for authenticated users in Darknet Duel. It provides a summary of the user's profile, stats, recent activity, and quick access to core features like lobbies, profile, and store.

## Route
- **Path:** `/dashboard`
- **Access:** Protected (requires authentication)

## Purpose
- Welcomes the user and displays their profile information.
- Shows system status, user stats, and recent activity.
- Provides quick navigation to lobbies, create game, profile, history, and store.
- Displays currency balances (creds, crypts) and user bio.

## UI Structure
- **Header:**
  - AppBar with navigation (dashboard, lobbies, profile, store, logout, theme toggle).
- **Main Content:**
  - Welcome banner with username, user type, and system status.
  - System updates panel (admin messages, news).
  - Stats panel (wins, losses, win rate, ELO, level).
  - Action panel (browse lobbies, create new game).
  - Profile panel (avatar, username, rating, bio, currency balances).
  - Recent activity panel (last 3 games, win/loss, points change, opponent, time).
- **Footer:**
  - Version info, date, and network status.

## Logic
- Uses `useAuthStore` for user data, authentication, and logout.
- Uses `useThemeStore` for theme management.
- Fetches profile stats and recent activity from `infoService`.
- Fetches user bio from `accountService`.
- Handles loading and logout animations.
- Redirects to `/auth` if not authenticated.

## Navigation
- **To Lobbies:** `/lobbies`
- **To Create Game:** `/lobbies/create`
- **To Profile:** `/profile`
- **To Game History:** `/history`
- **To Store:** `/store`
- **To Logout:** `/auth` (after logout)

## Notable Features
- Responsive, cyberpunk-themed design.
- Animated loading and logout screens.
- Data-driven panels for stats and activity.
- Quick access to all major user features.
- Error handling for data fetch failures.

---

**Component file:** `src/pages/DashboardPage.tsx` 
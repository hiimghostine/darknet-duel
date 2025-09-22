# ProfilePage

## Overview
The `ProfilePage` displays detailed information about a user's profile in Darknet Duel. It supports both viewing your own profile and viewing other users' profiles, with different actions available depending on context.

## Route
- **Path:** `/profile` (redirects to `/profile/:id` for current user)
- **Path:** `/profile/:id`
- **Access:** Protected (requires authentication)

## Purpose
- Shows user profile information, including avatar, username, bio, stats, and recent activity.
- Allows the current user to edit their profile.
- Allows users to report other users' profiles.
- Displays player stats and combat history.

## UI Structure
- **Header:**
  - Back button to dashboard.
  - Profile title ("YOUR_PROFILE.dat" or "[username]_PROFILE.dat").
  - Edit button (if own profile), Report button (if viewing another user), theme toggle, and logout.
- **Main Content:**
  - Profile header with avatar, decoration, username, user type, status, and bio.
  - Quick stats (rating, wins, losses, win rate).
  - Recent activity log (combat history).
  - Player stats (games played, level, performance metrics, account info).
- **Modals:**
  - EditProfileModal (for editing own profile).
  - ReportModal (for reporting another user).
- **Decorative Elements:**
  - Cyberpunk grid, scanlines, and themed typography.

## Logic
- Uses `useAuthStore` for authentication and user info.
- Uses `useParams` to determine which profile to display.
- Redirects to `/profile/:id` for current user if `/profile` is accessed.
- Fetches profile data, stats, and recent activity from services.
- Handles loading, error, and logout states.
- Allows editing own profile and reporting other users.

## Navigation
- **To Profile:** `/profile/:id`
- **To Dashboard:** `/dashboard`
- **To Edit Profile:** (modal, only for own profile)
- **To Report User:** (modal, only for other users)
- **To Logout:** `/auth` (after logout)

## Notable Features
- Context-aware actions (edit or report depending on profile ownership).
- Detailed stats and activity logs.
- Animated, cyberpunk-themed UI.
- Responsive design for all devices.

---

**Component file:** `src/pages/ProfilePage.tsx` 
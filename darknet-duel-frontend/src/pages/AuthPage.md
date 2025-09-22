# AuthPage

## Overview
The `AuthPage` handles user authentication for the Darknet Duel frontend. It provides both login and registration forms, manages authentication state, and redirects users based on their role and authentication status.

## Route
- **Path:** `/auth`
- **Access:** Public (redirects authenticated users)

## Purpose
- Allows users to log in or register for a new account.
- Handles authentication transitions and redirects.
- Provides a cyberpunk-themed, animated authentication experience.

## UI Structure
- **Decorative Background:**
  - Cyberpunk grid, borders, and animated typography.
- **Form Container:**
  - Logo and header (switches between `NETWORK_ACCESS` and `CREATE_NEW_IDENTITY` based on mode).
  - Status message (terminal-style, e.g., "Establishing secure connection...").
  - Login or Register form (toggles based on state or URL parameter).
  - Toggle button to switch between login and register.
- **Footer:**
  - Version info and current date.

## Logic
- Uses `useAuthStore` for authentication state and user info.
- Uses `useSearchParams` to show register form if `register=true` in URL.
- Shows a loading/transition screen when authentication is successful, then redirects:
  - Admins: `/admin`
  - Regular users: `/dashboard`
- If already authenticated, redirects immediately (handles refreshes/direct navigation).
- Handles toggling between login and register forms.

## Navigation
- **To Dashboard:** `/dashboard` (after login, for regular users)
- **To Admin Panel:** `/admin` (after login, for admins)
- **To Register:** `/auth?register=true`
- **To Login:** `/auth`

## Notable Features
- Animated transitions and loading screens for authentication events.
- Responsive, cyberpunk-themed design.
- Form validation and error handling (handled in child components).
- Role-based redirection after authentication.

---

**Component file:** `src/pages/AuthPage.tsx` 
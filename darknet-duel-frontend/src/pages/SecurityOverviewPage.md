# SecurityOverviewPage

## Overview
The `SecurityOverviewPage` is an admin/moderator page for monitoring system security and viewing authentication logs in Darknet Duel. It provides tools for filtering, searching, and paginating through logs of system activities.

## Route
- **Path:** `/admin/security-overview`
- **Access:** Protected (admin or moderator only)

## Purpose
- Allows admins and moderators to monitor system security and review logs.
- Provides filters and search for log entries.
- Displays paginated logs of user and system actions.

## UI Structure
- **Header:**
  - Security overview system title, access badge, navigation (back to admin, dashboard, theme toggle, logout).
- **Main Content:**
  - Filters for user, logs per page, and clear filters.
  - Table of logs (timestamp, user, action).
  - Pagination controls.
- **Decorative Elements:**
  - Cyberpunk grid background.

## Logic
- Uses `useAuthStore` for authentication and user info.
- Uses `useThemeStore` for theme management.
- Fetches logs from `logService` with filters and pagination.
- Handles loading, error, and logout states.
- Redirects to `/dashboard` if not admin/moderator or not authenticated.

## Navigation
- **To Security Overview:** `/admin/security-overview`
- **To Admin Panel:** `/admin`
- **To Dashboard:** `/dashboard`
- **To Logout:** `/auth` (after logout)

## Notable Features
- Role-based access control (admin/moderator only).
- Full log filtering and pagination.
- Animated, cyberpunk-themed UI.
- Responsive design for all devices.

---

**Component file:** `src/pages/SecurityOverviewPage.tsx` 
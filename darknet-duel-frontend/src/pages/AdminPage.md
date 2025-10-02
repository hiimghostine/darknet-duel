# AdminPage

## Overview
The `AdminPage` is the main control panel for admin and moderator users in Darknet Duel. It provides access to privileged management features, system status, and navigation to admin modules.

## Route
- **Path:** `/admin`
- **Access:** Protected (admin or moderator only)

## Purpose
- Allows admins and moderators to manage users, reports, and monitor system security.
- Provides quick access to admin modules: User Management, Report Management, Security Overview.
- Displays system status (server, database, chat system).

## UI Structure
- **Header:**
  - Admin/Moderator panel title, user info, navigation (dashboard, theme toggle, logout).
- **Main Content:**
  - Admin banner with access status and warnings.
  - Grid of admin modules:
    - User Management (admin only)
    - Report Management
    - Security Overview
  - System status panel (server, database, chat system).
- **Decorative Elements:**
  - Cyberpunk grid, scanlines, admin-themed typography, and bossing image.

## Logic
- Uses `useAuthStore` for authentication and user info.
- Uses `useThemeStore` for theme management.
- Handles loading, logout, and notification states.
- Redirects to `/auth` if not authenticated.
- Redirects non-admin/moderator users to `/dashboard`.

## Navigation
- **To Admin Panel:** `/admin`
- **To User Management:** `/admin/user-management`
- **To Report Management:** `/admin/report-management`
- **To Security Overview:** `/admin/security-overview`
- **To Dashboard:** `/dashboard`
- **To Logout:** `/auth` (after logout)

## Notable Features
- Role-based access control (admin/moderator only).
- Quick navigation to all admin modules.
- Animated, cyberpunk-themed UI.
- Responsive design for all devices.

---

**Component file:** `src/pages/AdminPage.tsx` 
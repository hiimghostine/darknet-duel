# UserManagementPage

## Overview
The `UserManagementPage` is an admin-only page for managing user accounts in Darknet Duel. It provides tools for viewing, editing, and managing user permissions and access levels.

## Route
- **Path:** `/admin/user-management`
- **Access:** Protected (admin only)

## Purpose
- Allows admins to view and manage all user accounts.
- Provides tools for editing user details, banning users, and changing permissions.

## UI Structure
- **Header:**
  - User management system title, admin access badge, navigation (back to admin, dashboard, theme toggle, logout).
- **Main Content:**
  - Notification area for success/error messages.
  - `UserManagement` component (handles user list, edit, ban, etc.).
- **Decorative Elements:**
  - Cyberpunk grid background.

## Logic
- Uses `useAuthStore` for authentication and user info.
- Uses `useThemeStore` for theme management.
- Handles notification, loading, and logout states.
- Redirects to `/dashboard` if not admin or not authenticated.

## Navigation
- **To User Management:** `/admin/user-management`
- **To Admin Panel:** `/admin`
- **To Dashboard:** `/dashboard`
- **To Logout:** `/auth` (after logout)

## Notable Features
- Admin-only access control.
- Full user management capabilities.
- Animated, cyberpunk-themed UI.
- Responsive design for all devices.

---

**Component file:** `src/pages/UserManagementPage.tsx` 
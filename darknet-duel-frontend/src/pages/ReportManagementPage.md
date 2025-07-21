# ReportManagementPage

## Overview
The `ReportManagementPage` is an admin/moderator page for managing user reports in Darknet Duel. It provides tools for reviewing, updating, and deleting reports, as well as banning users if necessary.

## Route
- **Path:** `/admin/report-management`
- **Access:** Protected (admin or moderator only)

## Purpose
- Allows admins and moderators to review and manage user reports (profile and chat).
- Provides tools for updating report status, deleting reports, and banning users.
- Displays report statistics and supports filtering/searching.

## UI Structure
- **Header:**
  - Report management system title, access badge, navigation (back to admin, dashboard, theme toggle, logout).
- **Main Content:**
  - Stats cards (total, pending, resolved, dismissed, profile, chat reports).
  - Filters and search bar.
  - Table of reports (ID, reporter, reportee, type, reason, status, date, actions).
  - Pagination controls.
  - Modals for report details and banning users.
- **Decorative Elements:**
  - Cyberpunk grid background.

## Logic
- Uses `useAuthStore` for authentication and user info.
- Uses `useThemeStore` for theme management.
- Fetches reports and stats from `reportService`.
- Handles report status updates, deletion, and banning users.
- Handles loading, error, and logout states.
- Redirects to `/dashboard` if not admin/moderator or not authenticated.

## Navigation
- **To Report Management:** `/admin/report-management`
- **To Admin Panel:** `/admin`
- **To Dashboard:** `/dashboard`
- **To Logout:** `/auth` (after logout)

## Notable Features
- Role-based access control (admin/moderator only).
- Full report management and moderation tools.
- Animated, cyberpunk-themed UI.
- Responsive design for all devices.

---

**Component file:** `src/pages/ReportManagementPage.tsx` 
# TopUpPage

## Overview
The `TopUpPage` allows authenticated users to purchase in-game currency (crypts) for their account. It displays available top-up packages, handles payment flow, and updates the user's balance upon successful purchase.

## Route
- **Path:** `/topup`
- **Access:** Protected (requires authentication)

## Purpose
- Lets users buy crypts (premium currency) via secure payment.
- Shows available top-up packages with pricing and bonuses.
- Handles payment modal and updates user balance after purchase.

## UI Structure
- **Header:**
  - Navigation buttons (dashboard, lobbies, store, profile, theme toggle, logout).
- **Main Content:**
  - Banner with current balance (creds and crypts).
  - Grid of top-up packages (crypts amount, price, badges for best value/popular).
  - Purchase button for each package (opens payment modal).
- **Footer:**
  - Secure payment info and instant delivery notice.
- **Modals:**
  - PaymentModal for handling payment process.
- **Decorative Elements:**
  - Cyberpunk grid, themed lines, and animated icons.

## Logic
- Uses `useAuthStore` for authentication, user info, and balance refresh.
- Uses `useThemeStore` for theme management.
- Handles payment modal open/close and purchase flow.
- Updates user balance after successful payment.
- Handles loading and logout animations.
- Redirects to `/auth` if not authenticated.

## Navigation
- **To Top Up:** `/topup`
- **To Dashboard:** `/dashboard`
- **To Lobbies:** `/lobbies`
- **To Store:** `/store`
- **To Profile:** `/profile/:id`
- **To Logout:** `/auth` (after logout)

## Notable Features
- Secure, instant payment and delivery.
- Animated, cyberpunk-themed UI.
- Responsive design for all devices.
- Badges for best value and popular packages.

---

**Component file:** `src/pages/TopUpPage.tsx` 
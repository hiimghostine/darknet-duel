# Darknet Duel Frontend: Complete Project Documentation

---

## Overview

The **Darknet Duel Frontend** is a cyberpunk-themed, real-time web application for the Darknet Duel platform—a competitive online card game of digital warfare. It is built with React and TypeScript, and provides all user-facing features, including authentication, gameplay, lobbies, user profiles, store, and admin/moderation tools. The codebase is modular, extensible, and designed for both rapid development and maintainability.

---

## Table of Contents

1. [Purpose & Architecture](#purpose--architecture)
2. [Directory Structure](#directory-structure)
3. [Entry Points & Routing](#entry-points--routing)
4. [Pages & Routes](#pages--routes)
5. [Components](#components)
6. [Services (API & Business Logic)](#services-api--business-logic)
7. [State Management (Stores)](#state-management-stores)
8. [Custom Hooks](#custom-hooks)
9. [Utilities](#utilities)
10. [Type Definitions](#type-definitions)
11. [Styles](#styles)
12. [Assets](#assets)
13. [Tech Stack & Tooling](#tech-stack--tooling)
14. [Design Choices](#design-choices)
15. [Getting Started](#getting-started)

---

## Purpose & Architecture

- **Players:**
  - Connect, join/host card battles, chat, and manage their digital identity.
  - Customize avatars, view stats/history, and purchase in-game currency/items.
- **Admins/Moderators:**
  - Access dashboards for user management, report handling, and security monitoring.
  - Review and moderate user reports, ban users, and audit system activity.

The app is structured around modular React components, a clear routing system, and a separation of concerns between UI, business logic, and state management.

---

## Directory Structure

```
src/
  ├── assets/         # Images, icons, sound effects, music
  ├── components/     # All reusable UI and feature components
  ├── hooks/          # Custom React hooks
  ├── pages/          # Main route/page components (with .md docs)
  ├── services/       # API and business logic
  ├── store/          # State management (Zustand stores)
  ├── styles/         # CSS and theme files
  ├── types/          # TypeScript type definitions
  ├── utils/          # Utility functions
  ├── App.tsx         # Main app component, routing
  ├── main.tsx        # App entry point
  ├── index.css, App.css # Global styles
  └── vite-env.d.ts   # Vite environment types
```

---

## Entry Points & Routing

- **main.tsx**: Bootstraps the React app, applies global styles, and renders `<App />`.
- **App.tsx**: Defines all routes using `react-router-dom`. Handles authentication, protected routes, and global toast notifications.
  - Public: `/`, `/auth`
  - Protected: `/dashboard`, `/lobbies/*`, `/game/:matchID`, `/profile/:id`, `/topup`, `/history`, `/store`
  - Admin/Moderator: `/admin`, `/admin/user-management`, `/admin/report-management`, `/admin/security-overview`
  - All other routes redirect to `/`

---

## Pages & Routes

Each page in `src/pages/` has a corresponding `.md` file with detailed documentation. Key pages:

- **HomePage** (`/`): Landing page, branding, theme toggle, login/register/dashboard navigation.
- **AuthPage** (`/auth`): Login/register, animated transitions, role-based redirection.
- **DashboardPage** (`/dashboard`): User dashboard, stats, recent activity, quick links.
- **LobbyPage** (`/lobbies/*`): Multiplayer hub, real-time lobby list, chat, sub-routing for details/creation.
- **GamePage** (`/game/:matchID`): Game client, real-time gameplay, secure access.
- **ProfilePage** (`/profile/:id`): User profile, stats, bio, activity, edit/report actions.
- **TopUpPage** (`/topup`): Purchase in-game currency, payment modal, instant delivery.
- **GameHistoryPage** (`/history`): Expandable combat log, pagination, match breakdowns.
- **StorePage** (`/store`): In-game store, buy/apply decorations, real-time balance.
- **AdminPage** (`/admin`): Admin/mod dashboard, user management, reports, security.
- **UserManagementPage** (`/admin/user-management`): Admin-only, view/edit/ban users.
- **ReportManagementPage** (`/admin/report-management`): Admin/mod, review/manage reports, ban users.
- **SecurityOverviewPage** (`/admin/security-overview`): Admin/mod, monitor logs, filter/search.

---

## Components

### Top-Level Components
- **AppBar.tsx**: Main navigation bar, links to all major pages, theme toggle, logout, admin panel access.
- **ToastContainer.tsx, Toast.tsx**: Global toast notification system.
- **LoadingScreen.tsx, LogoutScreen.tsx**: Animated loading and logout overlays.
- **EditProfileModal.tsx, ReportModal.tsx**: Modals for editing profile and reporting users.
- **UserTypeTag.tsx**: Displays user type (admin/mod/user) visually.
- **ContextMenu.tsx**: Custom right-click/context menu.
- **UserProfilePopup.tsx**: Popup for quick user info.

### Auth Components
- **LoginForm.tsx, RegisterForm.tsx, FormInput.tsx**: Authentication forms and inputs.
- **ProtectedRoute.tsx**: Wrapper for protected routes, redirects unauthenticated users.

### Lobby Components
- **LobbyBrowser.tsx**: Lists all available lobbies.
- **LobbyDetail.tsx**: Shows details and join options for a specific lobby.
- **LobbyChat.tsx**: Real-time chat for lobbies.
- **CreateLobby.tsx**: Form to create a new lobby.

### Admin Components
- **UserManagement.tsx**: Admin user management dashboard.
- **UserEditModal.tsx**: Modal for editing user details.
- **BanUserModal.tsx**: Modal for banning users.

### Game Components
- **GameClient.tsx**: Main game client, handles connection, state, and rendering.
- **BalatroGameBoard.tsx**: Main game board UI (very large, modularized).
- **GameInitializationScreen.tsx**: Pre-game setup and loading.
- **board-components/**: Modular subcomponents for the game board, e.g.:
  - **CardDisplay.tsx, PlayerHand.tsx, GameBoardLayout.tsx, PowerBar.tsx, RoundTracker.tsx, ChainEffectUI.tsx, WildcardChoiceUI.tsx, etc.**
  - **DevCheatPanel.tsx**: Developer/debugging tools.
  - **GameStatus.tsx, PlayerInfo.tsx, PendingChoicesOverlay.tsx, etc.**

### UI Utility Components
- **PaymentModal.tsx**: Handles payment flow for top-up.
- **GameControls.tsx, GameError.tsx, GameLoading.tsx**: Utility UI for game state.

---

## Services (API & Business Logic)

- **api.ts**: Axios instance, base URL, request/response interceptors, auth token handling.
- **account.service.ts**: User profile/account API, avatar upload, image resizing.
- **auth.service.ts**: Authentication API (login, register, logout, token refresh).
- **admin.service.ts**: Admin API (user management, banning, etc.).
- **game.service.ts**: Game API (matchmaking, game state, history).
- **lobby.service.ts**: Lobby API (create, join, list, leave lobbies).
- **store.service.ts**: Store API (list items, purchase, apply decorations).
- **report.service.ts**: Report API (submit, review, update, delete reports).
- **log.service.ts**: Security log API (fetch, filter, paginate logs).
- **info.service.ts**: Info API (profile stats, recent activity, system info).
- **payment.service.ts**: Payment API (initiate, verify, handle payment results).
- **currency.service.ts**: Currency API (get/update user balances).

---

## State Management (Stores)

- **auth.store.ts**: Auth state, user info, login/logout, token management.
- **theme.store.ts**: Theme state (cyberpunk/cyberpunk-dark), toggle logic.
- **toast.store.ts**: Toast notification state and queue.

---

## Custom Hooks

- **useCardActions.ts**: Card action logic for the game board.
- **useGameState.ts**: Game state management and synchronization.
- **useGameBoardData.ts, useGameBoardCallbacks.ts**: Data and callbacks for the game board UI.
- **useTurnActions.ts**: Turn-based action logic.
- **useGameConnection.ts**: WebSocket/game server connection logic.
- **useGameCredentials.ts**: Credential management for joining games.
- **useMemoizedValue.ts**: Memoization utility for performance.

---

## Utilities

- **gameDebugUtils.ts**: Debugging helpers for game state.
- **wildcardTypeUtils.ts**: Utility functions for wildcard card types and effects.

---

## Type Definitions

- **game.types.ts**: Core game state, player, and event types (very comprehensive).
- **card.types.ts**: Card definitions, types, and interfaces.

---

## Styles

- **index.css, App.css**: Global styles, theme variables.
- **styles/**: Modular CSS for game board, cards, lobbies, effects, etc.
  - **lobby.css, winner-lobby.css, gameboard-dashboard.css, card.css, chain-effect.css, etc.**
- **components/game/board-components/*.css**: Component-specific styles.

---

## Assets

- **assets/**: Images, icons, and media.
  - **logo.png, Cover Photo.png, bossing.png, react.svg**: Branding and UI images.
  - **sfx/**: Sound effects (click, error, notification, etc.).
  - **bgm/**: Background music loops (end-credits, the-drop, etc.).

---

## Tech Stack & Tooling

- **Framework:** React 19, ReactDOM
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** react-router-dom v7
- **State Management:** zustand
- **Forms & Validation:** react-hook-form, zod, @hookform/resolvers
- **UI & Styling:** Tailwind CSS, DaisyUI, framer-motion
- **Icons:** react-icons
- **Networking:** axios, socket.io-client
- **Game Engine:** boardgame.io
- **Utilities:** lodash
- **Testing/Dev:** ESLint, PostCSS, autoprefixer
- **Other:** Vite plugin for React, strict TypeScript config

---

## Design Choices

- **Cyberpunk Theme:** Consistent, immersive visual style with theme toggling.
- **Real-Time Features:** Multiplayer lobbies, chat, and gameplay via websockets.
- **Role-Based Access:** Separate flows and dashboards for users and admins/moderators.
- **Extensible:** Modular codebase for easy feature expansion and maintenance.
- **Responsive:** Mobile and desktop friendly.

---

## Getting Started

- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`

---

## For More

- See the `.md` files in `src/pages/` for in-depth documentation of each route/page, including UI, logic, navigation, and features.
- Explore each directory and file for detailed code-level documentation and comments.

---

If you need a specific section expanded (e.g., a table of all routes, a feature matrix, or a diagram), or want a per-file summary, let me know!
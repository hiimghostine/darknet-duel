# Transaction 6.1: In-Game Currency Management (Creds, Crypts)

## User Interface Design
- Players can view their current balances of Creds and Crypts on the dashboard and top-up pages
- Creds are earned by playing matches (10 for a win, 5 for a loss)
- Crypts are obtained via payment/top-up
- Players can spend currency on store purchases and in-game actions
- Players can transfer currency to other users
- UI displays currency with distinct icons/colors (💰 for Creds, 💎 for Crypts)
- Handles loading, error, and insufficient funds states

## Frontend Components
1. **DashboardPage** (React Page Component)
   - Displays current balances of Creds and Crypts
   - File: `src/pages/DashboardPage.tsx`
2. **TopUpPage** (React Page Component)
   - Shows current balance and allows top-up of Crypts
   - File: `src/pages/TopUpPage.tsx`
3. **currencyService** (Service Module)
   - Fetches balances, handles transfers, and formats currency display
   - File: `src/services/currency.service.ts`
4. **useAuthStore** (Zustand Store)
   - Provides authentication and user info, including currency balances
   - File: `src/store/auth.store.ts`

## Backend Components
1. **CurrencyController** (Express Controller)
   - Handles REST API requests for currency management
   - Endpoints:
     - `GET /api/currency/balance` — Get authenticated user's currency balance
     - `POST /api/currency/add` — Add currency (admin only)
     - `POST /api/currency/subtract` — Subtract currency (admin only)
     - `POST /api/currency/transfer` — Transfer currency between users
2. **CurrencyService** (Service Class)
   - Manages currency logic: get, add, subtract, transfer, set
   - Methods: `getBalance`, `addCurrency`, `subtractCurrency`, `transferCurrency`, `setCurrency`
3. **Account Entity**
   - Stores `creds` and `crypts` fields for each user
   - File: `src/entities/account.entity.ts`
4. **StoreService** (Service Class)
   - Handles purchases, checks/updates balances
   - File: `src/services/store.service.ts`
5. **PaymentService** (Service Class)
   - Handles payment processing and crypts top-up
   - File: `src/services/payment.service.ts`

## Endpoints
- **REST API**
  - `GET /api/currency/balance` — Get current user's currency balance
  - `POST /api/currency/add` — Add currency (admin only)
  - `POST /api/currency/subtract` — Subtract currency (admin only)
  - `POST /api/currency/transfer` — Transfer currency to another user
  - (Internal) `POST /currency/add` — Game server to backend for awarding Creds after matches

## Sequence Overview
1. Player views currency balances on dashboard/top-up page
2. Frontend calls `GET /api/currency/balance` via `currencyService`
3. Backend authenticates user, fetches and returns balances
4. Player earns Creds after a match (Game Server calls backend to add Creds)
5. Player spends currency on purchases (StoreService checks and updates balances)
6. Player can transfer currency to other users (via transfer endpoint) 
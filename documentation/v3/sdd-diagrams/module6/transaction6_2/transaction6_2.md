# Transaction 6.2: Store Browsing, Item Purchase, and Application of Decoration

## User Interface Design
- Players can browse store categories and items (decorations, etc.)
- Each item displays preview, name, description, price, and purchase/apply button
- User balance (creds, crypts) is shown and updated in real time
- Owned items are marked and can be applied to the profile
- Purchase and application actions provide success/error feedback
- Handles loading, error, and insufficient funds states
- Responsive, cyberpunk-themed UI

## Frontend Components
1. **StorePage** (React Page Component)
   - Displays store categories, items, user balance, and handles purchase/application
   - File: `src/pages/StorePage.tsx`
2. **storeService** (Service Module)
   - Fetches store data, user purchases, handles purchase and apply actions
   - File: `src/services/store.service.ts`
3. **currencyService** (Service Module)
   - Fetches user balance for display
   - File: `src/services/currency.service.ts`
4. **useAuthStore** (Zustand Store)
   - Provides authentication, user info, and current decoration
   - File: `src/store/auth.store.ts`

## Backend Components
1. **StoreController** (Express Controller)
   - Handles REST API requests for store browsing, purchase, and decoration application
   - Endpoints:
     - `GET /api/store` — Get all store categories and items
     - `GET /api/store/purchases` — Get user's purchased items
     - `POST /api/purchase/{itemId}` — Purchase an item
     - `POST /api/account/apply/decoration/{decorationId}` — Apply a decoration
2. **StoreService** (Service Class)
   - Handles store logic: get store data, check ownership, purchase item, apply decoration
   - Methods: `getStoreData`, `userOwnsItem`, `purchaseItem`, `applyDecoration`
3. **Purchase Entity**
   - Stores purchases made by users (itemId, accountId, price, currency, etc.)
   - File: `src/entities/purchase.entity.ts`
4. **Account Entity**
   - Stores current decoration and user info
   - File: `src/entities/account.entity.ts`

## Endpoints
- **REST API**
  - `GET /api/store` — Get all store categories and items
  - `GET /api/store/purchases` — Get user's purchased items
  - `POST /api/purchase/{itemId}` — Purchase an item
  - `POST /api/account/apply/decoration/{decorationId}` — Apply a decoration

## Sequence Overview
1. Player browses store and views available items
2. Frontend calls `GET /api/store` and `GET /api/store/purchases` to load data
3. Player selects an item to purchase; frontend calls `POST /api/purchase/{itemId}`
4. Backend checks balance, processes purchase, updates inventory and balance
5. Player applies a purchased decoration; frontend calls `POST /api/account/apply/decoration/{decorationId}`
6. Backend updates user's current decoration 
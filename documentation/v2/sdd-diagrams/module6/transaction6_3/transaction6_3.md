# Transaction 6.3: Payment Integration (for Top-Up)

## User Interface Design
- Players can initiate a top-up and select a crypts package
- Payment modal or new window opens for payment provider (e.g., Xendit)
- UI shows payment status (pending, paid, failed, expired)
- On successful payment, crypts are credited to the user's account and balance is updated
- Handles errors, timeouts, and payment failures with clear feedback
- Responsive, cyberpunk-themed UI

## Frontend Components
1. **TopUpPage** (React Page Component)
   - Allows users to select a package and initiate payment
   - File: `src/pages/TopUpPage.tsx`
2. **PaymentModal** (React Modal Component)
   - Handles the complete payment flow and status updates
   - File: `src/components/PaymentModal.tsx`
3. **paymentService** (Service Module)
   - Manages payment API calls, opens payment window, polls status, and processes payment
   - File: `src/services/payment.service.ts`
4. **useAuthStore** (Zustand Store)
   - Provides authentication and user info, including crypts balance
   - File: `src/store/auth.store.ts`

## Backend Components
1. **PaymentController** (Express Controller)
   - Handles REST API requests for payment creation, status, and processing
   - Endpoints:
     - `POST /api/payment/create` — Create payment invoice for crypts top-up
     - `GET /api/payment/status/{invoiceId}` — Check payment status
     - `POST /api/payment/process` — Process successful payment and credit crypts
2. **PaymentService** (Service Class)
   - Integrates with payment provider (Xendit), creates invoices, checks status, processes payment
   - Methods: `createPayment`, `checkPaymentStatus`, `processSuccessfulPayment`
3. **CurrencyService** (Service Class)
   - Adds crypts to user account after successful payment
   - File: `src/services/currency.service.ts`
4. **Account Entity**
   - Stores crypts balance for each user
   - File: `src/entities/account.entity.ts`

## Endpoints
- **REST API**
  - `POST /api/payment/create` — Create payment invoice
  - `GET /api/payment/status/{invoiceId}` — Check payment status
  - `POST /api/payment/process` — Process successful payment and credit crypts

## Sequence Overview
1. Player selects a crypts package and initiates top-up
2. Frontend calls `POST /api/payment/create` to create payment invoice
3. Payment provider window/modal opens; player completes payment
4. Frontend polls `GET /api/payment/status/{invoiceId}` for payment status
5. On success, frontend calls `POST /api/payment/process` to credit crypts
6. Backend verifies payment, credits crypts, and returns new balance
7. Frontend updates user balance and shows success message 
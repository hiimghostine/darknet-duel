# Xendit Payment Integration Setup

## Overview
The Darknet Duel payment system has been implemented using Xendit for secure payment processing. Players can purchase Crypts packages through a streamlined payment flow.

## Required Environment Variables

Create a `.env` file in the `backend-server` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=darknet_duel

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=8000

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173

# Xendit Payment Configuration
XENDIT_API_KEY=your-xendit-api-key-here
XENDIT_WEBHOOK_TOKEN=your-xendit-webhook-token-here
```

## Xendit Setup

1. **Create Xendit Account**: Sign up at https://xendit.co
2. **Get API Keys**: 
   - Go to Settings > API Keys
   - Copy your Secret Key (starts with `xnd_`)
   - Use this as `XENDIT_API_KEY`
3. **Webhook Token**: Set up webhook token for security (optional but recommended)

## Payment Flow

1. **User clicks "Purchase Now"** on TopUpPage
2. **Payment Modal opens** showing processing status
3. **Backend creates Xendit invoice** via `/api/payment/create`
4. **New window opens** with Xendit payment page
5. **Frontend polls payment status** via `/api/payment/status/{invoiceId}`
6. **When payment succeeds**, backend processes it via `/api/payment/process`
7. **Crypts are added** to user account automatically
8. **Success message** shows completion

## API Endpoints

### POST /api/payment/create
Creates a payment invoice for a package.

**Request:**
```json
{
  "packageId": "starter"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceId": "64f7c9f9e4b0123456789",
    "invoiceUrl": "https://checkout.xendit.co/web/64f7c9f9e4b0123456789",
    "status": "PENDING"
  }
}
```

### GET /api/payment/status/{invoiceId}
Checks the current status of a payment.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "PAID",
    "invoiceId": "64f7c9f9e4b0123456789"
  }
}
```

### POST /api/payment/process
Processes a successful payment and adds crypts to user account.

**Request:**
```json
{
  "invoiceId": "64f7c9f9e4b0123456789",
  "packageId": "starter"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "crypts": 15,
    "newBalance": 65
  },
  "message": "Successfully added 15 crypts to your account!"
}
```

## Available Packages

| Package ID | Crypts | Price (PHP) | Special |
|------------|--------|-------------|---------|
| starter    | 15     | ₱20.50      |         |
| small      | 50     | ₱53         | Popular |
| medium     | 150    | ₱159        |         |
| large      | 250    | ₱264        |         |
| xl         | 500    | ₱530        |         |
| xxl        | 1000   | ₱1070       |         |
| mega       | 1500   | ₱1600       | Best Value |
| ultra      | 2500   | ₱2650       |         |
| supreme    | 5000   | ₱5300       |         |

## Security Features

- **JWT Authentication**: All payment endpoints require valid authentication
- **Input Validation**: Package IDs and amounts are validated
- **Status Verification**: Payment status is verified before processing
- **Error Handling**: Comprehensive error handling and logging
- **SSL Encryption**: All API communication is encrypted

## Frontend Components

- **PaymentModal**: Handles the complete payment flow with status updates
- **PaymentService**: Manages API calls and payment window handling
- **TopUpPage**: Integration point for payment initiation

## Testing

1. Start the backend server: `npm run dev`
2. Start the frontend: `npm run dev`
3. Log in to the application
4. Navigate to the TopUp page
5. Click "Purchase Now" on any package
6. The payment modal should open and show "Creating payment..."

**Note**: Without a valid Xendit API key, the payment creation will fail with an error message.

## Troubleshooting

### Common Issues

1. **"Xendit API key not configured"**
   - Ensure `XENDIT_API_KEY` is set in the `.env` file
   - Verify the API key is correct and starts with `xnd_`

2. **Payment window doesn't open**
   - Check browser popup blocker settings
   - Ensure the payment URL is valid in network requests

3. **Payment status polling fails**
   - Check network connectivity
   - Verify the invoice ID is valid
   - Check backend logs for API errors

4. **Crypts not added after payment**
   - Check if payment status is actually "PAID"
   - Verify the process payment endpoint is working
   - Check database connectivity

### Logs

Backend logs will show detailed information about:
- Payment creation requests
- Xendit API responses
- Payment status checks
- Currency balance updates

Look for console outputs starting with:
- "Creating Xendit payment for user:"
- "Xendit payment status:"
- "Processing successful payment for user:" 
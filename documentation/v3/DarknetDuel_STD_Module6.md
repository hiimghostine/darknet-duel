# Module 6 Test Cases - Store and Currency

## DD-06-001 - In-Game Currency Management

### Purpose
To verify that in-game currency (Creds and Crypts) is properly managed, displayed, and updated throughout the application.

### Inputs
**Valid Inputs:**
- Currency transactions
- Currency transfers
- Currency displays

**Invalid Inputs (BVA):**
- Negative currency amounts
- Invalid transfer amounts
- Corrupted currency data

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Currency balances display correctly
- Currency transactions work properly
- Currency transfers function correctly
- Currency updates in real-time
- Currency validation works properly

**Fail Criteria:**
- Currency balances not displayed
- Currency transactions not working
- Currency transfers failing
- Currency not updating
- Currency validation not working

### Test Procedure
1. **Test Currency Display**
   - Login to application
   - Verify Creds and Crypts balances are displayed
   - Verify balances are shown in appropriate locations
   - Verify currency icons and styling
   - Test with different balance amounts

2. **Test Currency Updates**
   - Perform actions that change currency
   - Verify balances update in real-time
   - Verify updates are accurate
   - Verify updates appear in all relevant locations
   - Test with different update scenarios

3. **Test Currency Validation**
   - Attempt to spend more currency than available
   - Verify transaction is blocked
   - Verify appropriate error message
   - Verify balance is not changed
   - Test with different validation scenarios

4. **Test Currency Transfers**
   - Transfer currency to another user
   - Verify transfer is processed correctly
   - Verify both users' balances are updated
   - Verify transfer history is recorded
   - Test with different transfer amounts

5. **Test Currency Earning**
   - Play matches to earn Creds
   - Verify Creds are awarded correctly
   - Verify earning amounts are accurate
   - Verify earnings are displayed
   - Test with different earning scenarios

6. **Test Currency Spending**
   - Purchase items from store
   - Verify currency is deducted correctly
   - Verify transaction is processed
   - Verify balance is updated
   - Test with different purchase scenarios

7. **Test Currency Persistence**
   - Change currency balances
   - Refresh page or restart application
   - Verify balances are preserved
   - Verify no currency loss
   - Test with different persistence scenarios

8. **Test Currency Error Handling**
   - Test with invalid currency data
   - Test with network issues
   - Verify appropriate error messages
   - Verify graceful error handling
   - Test with different error scenarios

## DD-06-002 - Store Browsing, Item Purchase, and Application of Decoration

### Purpose
To verify that the store system works correctly for browsing items, making purchases, and applying decorations.

### Inputs
**Valid Inputs:**
- Store item selection
- Purchase actions
- Decoration application

**Invalid Inputs (BVA):**
- Insufficient currency
- Invalid item selection
- Corrupted store data

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Store items display correctly
- Purchase process works smoothly
- Decorations apply correctly
- Currency validation works
- User experience is intuitive

**Fail Criteria:**
- Store items not displaying
- Purchase process not working
- Decorations not applying
- Currency validation failing
- Poor user experience

### Test Procedure
1. **Test Store Display**
   - Access store page
   - Verify store items are displayed
   - Verify item information is complete
   - Verify pricing is shown correctly
   - Verify cyberpunk styling is maintained

2. **Test Item Browsing**
   - Browse different item categories
   - Verify items are organized logically
   - Verify item details are accessible
   - Verify search functionality works
   - Test with different browsing scenarios

3. **Test Item Information**
   - Click on specific items
   - Verify detailed information is shown
   - Verify item previews work
   - Verify pricing is accurate
   - Test with different item types

4. **Test Purchase Process**
   - Select item for purchase
   - Verify purchase confirmation dialog
   - Verify currency validation
   - Complete purchase
   - Verify purchase is processed correctly

5. **Test Purchase Validation**
   - Attempt to purchase item with insufficient currency
   - Verify purchase is blocked
   - Verify appropriate error message
   - Verify currency is not deducted
   - Test with different validation scenarios

6. **Test Decoration Application**
   - Purchase decoration item
   - Apply decoration to profile
   - Verify decoration is applied correctly
   - Verify decoration is visible in profile
   - Test with different decoration types

7. **Test Purchase History**
   - Make multiple purchases
   - Verify purchase history is recorded
   - Verify history is accessible
   - Verify history is accurate
   - Test with different purchase scenarios

8. **Test Store Performance**
   - Test with large number of items
   - Verify store loads quickly
   - Verify browsing is smooth
   - Verify no performance issues
   - Test with different store configurations

9. **Test Store Error Handling**
   - Test with network issues
   - Test with invalid store data
   - Verify appropriate error messages
   - Verify graceful error handling
   - Test with different error scenarios

## DD-06-003 - Payment Integration

### Purpose
To verify that payment integration works correctly for purchasing Crypts with real money.

### Inputs
**Valid Inputs:**
- Payment package selection
- Payment method selection
- Payment completion

**Invalid Inputs (BVA):**
- Invalid payment methods
- Corrupted payment data
- Failed payment transactions

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Payment process works smoothly
- Payment packages display correctly
- Payment completion is handled properly
- Crypts are credited correctly
- Payment security is maintained

**Fail Criteria:**
- Payment process not working
- Payment packages not displaying
- Payment completion failing
- Crypts not credited
- Payment security issues

### Test Procedure
1. **Test Payment Package Display**
   - Access top-up page
   - Verify payment packages are displayed
   - Verify package information is complete
   - Verify pricing is accurate
   - Test with different package types

2. **Test Payment Package Selection**
   - Select different payment packages
   - Verify selection is recorded
   - Verify package details are shown
   - Verify pricing is calculated correctly
   - Test with different selection scenarios

3. **Test Payment Method Selection**
   - Select payment method
   - Verify payment method is recorded
   - Verify payment options are available
   - Verify payment security is maintained
   - Test with different payment methods

4. **Test Payment Process**
   - Initiate payment process
   - Verify payment window opens
   - Verify payment form is displayed
   - Verify payment security is maintained
   - Test with different payment scenarios

5. **Test Payment Completion**
   - Complete payment successfully
   - Verify payment is processed
   - Verify Crypts are credited
   - Verify balance is updated
   - Test with different completion scenarios

6. **Test Payment Failure**
   - Simulate payment failure
   - Verify appropriate error message
   - Verify payment is not processed
   - Verify Crypts are not credited
   - Test with different failure scenarios

7. **Test Payment Security**
   - Verify payment data is encrypted
   - Verify payment information is secure
   - Verify no sensitive data is exposed
   - Verify payment compliance
   - Test with different security scenarios

8. **Test Payment History**
   - Complete multiple payments
   - Verify payment history is recorded
   - Verify history is accessible
   - Verify history is accurate
   - Test with different payment scenarios

9. **Test Payment Error Handling**
   - Test with network issues
   - Test with invalid payment data
   - Verify appropriate error messages
   - Verify graceful error handling
   - Test with different error scenarios

10. **Test Payment Performance**
    - Test payment process performance
    - Verify payment loads quickly
    - Verify payment processes efficiently
    - Verify no performance issues
    - Test with different payment scenarios


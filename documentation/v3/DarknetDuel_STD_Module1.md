# Module 1 Test Cases - User Management and Authentication

## DD-01-001 - User Registration

### Purpose
To verify that new users can successfully create accounts with valid information and that the system properly validates input data and handles errors.

### Inputs
**Valid Inputs (Equivalence Partitioning):**
- Email: Valid email format (e.g., "test@example.com")
- Username: 3-50 characters (e.g., "testuser123")
- Password: 8+ characters with mixed case and numbers (e.g., "Password123")
- Confirm Password: Matches password exactly

**Invalid Inputs (Boundary Value Analysis):**
- Email: Invalid formats ("invalid-email", "@domain.com", "user@", "user@domain")
- Username: Too short (1-2 chars), too long (51+ chars), special characters
- Password: Too short (1-7 chars), no numbers, no uppercase, no lowercase
- Confirm Password: Mismatched passwords

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Registration form displays with proper styling and cyberpunk theme
- Form validation works in real-time as user types
- Valid registration creates account and auto-logs in user
- Success message displays and redirects to dashboard
- User data is properly stored and accessible

**Fail Criteria:**
- Form accepts invalid data
- Validation errors not displayed properly
- Registration fails with valid data
- User not logged in after successful registration
- UI/UX issues or styling problems

### Test Procedure
1. **Navigate to Registration**
   - Open browser and go to Darknet Duel application
   - Click "CREATE_NEW_IDENTITY" link on login form
   - Verify registration form loads with cyberpunk styling
   - Verify form fields: Email, Username, Password, Confirm Password

2. **Test Valid Registration**
   - Enter valid email: "testuser@example.com"
   - Enter valid username: "testuser123"
   - Enter valid password: "Password123"
   - Enter matching confirm password: "Password123"
   - Click "AUTHENTICATE" button
   - Verify loading animation appears
   - Verify success message and redirect to dashboard
   - Verify user is logged in and profile data is accessible

3. **Test Email Validation (BVA)**
   - Test invalid email formats:
     - "invalid-email" (no @)
     - "@domain.com" (no username)
     - "user@" (no domain)
     - "user@domain" (no TLD)
   - Verify real-time validation shows error messages
   - Verify form submission is blocked

4. **Test Username Validation (BVA)**
   - Test boundary values:
     - 1 character: "a" (too short)
     - 2 characters: "ab" (too short)
     - 3 characters: "abc" (valid minimum)
     - 50 characters: "a".repeat(50) (valid maximum)
     - 51 characters: "a".repeat(51) (too long)
   - Test special characters: "user@123" (invalid)
   - Verify appropriate error messages

5. **Test Password Validation (BVA)**
   - Test boundary values:
     - 7 characters: "Pass123" (too short)
     - 8 characters: "Password123" (valid minimum)
   - Test missing requirements:
     - No uppercase: "password123"
     - No lowercase: "PASSWORD123"
     - No numbers: "Password"
   - Verify real-time validation feedback

6. **Test Password Confirmation**
   - Enter password: "Password123"
   - Enter different confirm password: "Password456"
   - Verify mismatch error message
   - Verify form submission blocked

7. **Test Duplicate Registration**
   - Attempt to register with existing email/username
   - Verify appropriate error message
   - Verify form remains on registration page

8. **Test Form Reset and Navigation**
   - Fill form partially, then switch to login form
   - Switch back to registration form
   - Verify form is cleared/reset
   - Test "NEW USER REGISTRATION" link functionality

## DD-01-002 - User Login

### Purpose
To verify that existing users can successfully authenticate with valid credentials and that the system properly handles invalid login attempts.

### Inputs
**Valid Inputs:**
- Email: Existing user email (e.g., "testuser@example.com")
- Password: Correct password for the account

**Invalid Inputs (BVA):**
- Email: Non-existent email, invalid format
- Password: Wrong password, empty password
- Both fields empty

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Login form displays with proper cyberpunk styling
- Valid login authenticates user and redirects to dashboard
- Loading animation appears during authentication
- Success message and smooth transition to dashboard
- User session is properly established

**Fail Criteria:**
- Invalid credentials are accepted
- Error messages not displayed for invalid attempts
- Valid login fails
- UI/UX issues or poor error handling

### Test Procedure
1. **Navigate to Login**
   - Open browser and go to Darknet Duel application
   - Verify login form is displayed by default
   - Verify cyberpunk styling and terminal-style status message
   - Verify form fields: Email, Password

2. **Test Valid Login**
   - Enter valid email: "testuser@example.com"
   - Enter correct password: "Password123"
   - Click "AUTHENTICATE" button
   - Verify loading animation with "AUTHENTICATING" text
   - Verify success transition and redirect to dashboard
   - Verify user is properly authenticated

3. **Test Invalid Email**
   - Enter non-existent email: "nonexistent@example.com"
   - Enter any password
   - Click "AUTHENTICATE" button
   - Verify error message displays
   - Verify error animation (red flash, pulse effect)
   - Verify form remains on login page

4. **Test Wrong Password**
   - Enter valid email: "testuser@example.com"
   - Enter wrong password: "WrongPassword"
   - Click "AUTHENTICATE" button
   - Verify error message displays
   - Verify error animation and sound effects
   - Verify form remains on login page

5. **Test Empty Fields (BVA)**
   - Leave both fields empty
   - Click "AUTHENTICATE" button
   - Verify validation errors for both fields
   - Test with only email filled
   - Test with only password filled

6. **Test Email Format Validation**
   - Enter invalid email format: "invalid-email"
   - Enter any password
   - Verify real-time validation error
   - Verify form submission is blocked

7. **Test Form Toggle**
   - Click "CREATE_NEW_IDENTITY" link
   - Verify switch to registration form
   - Click back to login form
   - Verify form is properly reset

8. **Test Error Clearing**
   - Trigger login error
   - Start typing in email field
   - Verify error message clears
   - Verify error animation stops

## DD-01-003 - Profile Management

### Purpose
To verify that users can view and edit their profile information, including avatar upload and bio updates.

### Inputs
**Valid Inputs:**
- Username: 3-50 characters, alphanumeric
- Email: Valid email format
- Bio: Text up to 500 characters
- Avatar: Valid image file (JPG, PNG, GIF) under 2MB

**Invalid Inputs (BVA):**
- Username: Too short/long, special characters
- Email: Invalid format, duplicate email
- Bio: Over 500 characters
- Avatar: Invalid file type, oversized file

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Profile page displays user information correctly
- Edit modal opens with current user data
- Valid updates save successfully
- Avatar upload works with preview
- Success messages display
- Changes reflect immediately in UI

**Fail Criteria:**
- Profile data not displayed correctly
- Edit functionality not working
- Invalid data accepted
- Avatar upload fails
- UI/UX issues

### Test Procedure
1. **Access Profile Page**
   - Login with valid credentials
   - Navigate to profile page (via AppBar or direct URL)
   - Verify profile information displays correctly
   - Verify cyberpunk styling and layout

2. **Test Profile Display**
   - Verify username, email, bio display correctly
   - Verify avatar displays (if uploaded)
   - Verify user stats and information
   - Verify role/type display (user/moderator/admin)

3. **Test Edit Profile Modal**
   - Click edit profile button/modal trigger
   - Verify modal opens with current user data pre-filled
   - Verify all editable fields are present
   - Verify modal styling matches cyberpunk theme

4. **Test Username Update**
   - Change username to valid new name: "newusername123"
   - Click save/update button
   - Verify success message
   - Verify username updates in profile and throughout app
   - Test with invalid usernames (too short, special chars)

5. **Test Email Update**
   - Change email to valid new email: "newemail@example.com"
   - Click save/update button
   - Verify success message
   - Verify email updates in profile
   - Test with invalid email format

6. **Test Bio Update**
   - Change bio to valid text: "This is my new bio"
   - Click save/update button
   - Verify success message
   - Verify bio updates in profile
   - Test with very long bio (over 500 chars)

7. **Test Avatar Upload**
   - Click avatar upload button
   - Select valid image file (JPG, PNG, GIF under 2MB)
   - Verify image preview appears
   - Click save/update button
   - Verify avatar updates in profile and throughout app
   - Test with invalid file types and oversized files

8. **Test Password Change**
   - Access password change section
   - Enter current password
   - Enter new password: "NewPassword123"
   - Enter confirm password: "NewPassword123"
   - Click save/update button
   - Verify success message
   - Test with mismatched passwords

9. **Test Validation and Error Handling**
   - Test all invalid inputs
   - Verify appropriate error messages
   - Verify form submission blocked for invalid data
   - Test duplicate email/username scenarios

## DD-01-004 - Role-based Access

### Purpose
To verify that the system properly enforces role-based access control and displays appropriate UI elements based on user roles.

### Inputs
**Test Accounts:**
- Regular User: Standard player account
- Moderator: Account with moderator privileges
- Admin: Account with admin privileges

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- UI elements display based on user role
- Admin/moderator features only visible to appropriate roles
- Role-based navigation works correctly
- Access restrictions properly enforced
- Role indicators display correctly

**Fail Criteria:**
- Regular users can access admin features
- Role indicators not displayed
- Navigation issues based on role
- Access control bypassed

### Test Procedure
1. **Test Regular User Access**
   - Login with regular user account
   - Verify standard user interface elements
   - Verify admin/moderator features are hidden
   - Verify role indicator shows "USER" or similar
   - Test navigation to restricted pages (should redirect)

2. **Test Moderator Access**
   - Login with moderator account
   - Verify moderator-specific UI elements
   - Verify access to moderation tools
   - Verify role indicator shows "MODERATOR"
   - Verify cannot access admin-only features

3. **Test Admin Access**
   - Login with admin account
   - Verify admin-specific UI elements
   - Verify access to all admin tools
   - Verify role indicator shows "ADMIN"
   - Verify full system access

4. **Test Role-based Navigation**
   - Test navigation to admin pages with different roles
   - Verify appropriate redirects or access
   - Test direct URL access to restricted pages
   - Verify proper error messages for unauthorized access

5. **Test Role Indicators**
   - Verify role tags/badges display correctly
   - Test in profile pages, user lists, and other locations
   - Verify styling and visibility

6. **Test Feature Visibility**
   - Compare UI elements across different role accounts
   - Verify admin tools only visible to admins
   - Verify moderation tools only visible to moderators/admins
   - Verify standard features visible to all roles

7. **Test Access Control Enforcement**
   - Attempt to access restricted features with regular user
   - Verify proper error handling and redirects
   - Test API calls that should be restricted
   - Verify frontend properly handles access denied responses


# Module 2 Test Cases - Lobby and Matchmaking

## DD-02-001 - Lobby Browser

### Purpose
To verify that users can view available game lobbies, refresh the lobby list, and navigate to lobby details.

### Inputs
**Valid Inputs:**
- Refresh action (button click)
- Lobby selection (clicking on lobby)
- Private lobby code entry (valid format)

**Invalid Inputs (BVA):**
- Empty private lobby code
- Invalid lobby code format
- Non-existent lobby code

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Lobby list displays with proper cyberpunk styling
- Real-time updates show current lobby status
- Refresh functionality works correctly
- Lobby details accessible via click
- Private lobby entry works with valid codes
- Loading states and error handling work properly

**Fail Criteria:**
- Lobby list not displayed or styled incorrectly
- Real-time updates not working
- Refresh functionality broken
- Navigation to lobby details fails
- Private lobby entry not working
- Poor error handling

### Test Procedure
1. **Access Lobby Browser**
   - Login with valid credentials
   - Navigate to lobby page
   - Verify lobby browser loads with cyberpunk styling
   - Verify "DARKNET_LOBBIES" header and status indicators
   - Verify connection status shows "SECURE CONNECTION ESTABLISHED"

2. **Test Lobby List Display**
   - Verify lobby list displays available games
   - Verify each lobby shows:
     - Lobby name/ID
     - Player count and capacity
     - Lobby status (waiting, ready, in progress)
     - Host information
     - Join button (if available)
   - Verify cyberpunk styling and visual effects

3. **Test Lobby Status Indicators**
   - Verify different lobby statuses display correctly:
     - Waiting lobbies (can join)
     - Ready lobbies (can join)
     - In-progress lobbies (cannot join)
     - Full lobbies (cannot join)
   - Verify appropriate visual indicators and button states

4. **Test Refresh Functionality**
   - Click refresh button
   - Verify loading indicator appears
   - Verify lobby list updates with current data
   - Test multiple refresh operations
   - Verify refresh works when no lobbies exist

5. **Test Lobby Selection**
   - Click on an available lobby
   - Verify navigation to lobby detail page
   - Test with different lobby types (public/private)
   - Test with different lobby statuses

6. **Test Private Lobby Entry**
   - Enter valid private lobby code
   - Click join button
   - Verify navigation to private lobby
   - Test with invalid lobby codes
   - Test with empty lobby code
   - Verify appropriate error messages

7. **Test Empty State**
   - Test when no lobbies are available
   - Verify appropriate empty state message
   - Verify "Create Lobby" button is available
   - Verify refresh functionality still works

8. **Test Real-time Updates**
   - Open lobby browser in one browser tab
   - Create/join/leave lobbies in another tab
   - Verify lobby list updates automatically
   - Test lobby status changes
   - Test player count updates

9. **Test Error Handling**
   - Test with network disconnected
   - Verify appropriate error messages
   - Test reconnection functionality
   - Verify graceful degradation

## DD-02-002 - Create/Join/Leave Lobbies

### Purpose
To verify that users can create new lobbies, join existing lobbies, and leave lobbies with proper validation and error handling.

### Inputs
**Valid Inputs:**
- Lobby name: 3-50 characters
- Privacy setting: Public or Private
- Game mode: Standard or Custom
- Join action: Clicking join button on available lobby
- Leave action: Clicking leave button

**Invalid Inputs (BVA):**
- Lobby name: Too short (1-2 chars), too long (51+ chars)
- Empty lobby name
- Special characters in lobby name

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Create lobby form displays with proper validation
- Lobby creation succeeds with valid data
- Join functionality works for available lobbies
- Leave functionality works properly
- Real-time updates reflect changes
- Proper error handling for invalid inputs

**Fail Criteria:**
- Lobby creation fails with valid data
- Join functionality not working
- Leave functionality broken
- Validation not working properly
- Real-time updates not reflecting changes

### Test Procedure
1. **Test Create Lobby Form**
   - Click "Create Lobby" button
   - Verify create lobby form opens
   - Verify form fields: Lobby Name, Privacy, Game Mode
   - Verify cyberpunk styling and validation

2. **Test Valid Lobby Creation**
   - Enter valid lobby name: "Test Lobby"
   - Select privacy setting: Public
   - Select game mode: Standard
   - Click "Create Lobby" button
   - Verify lobby creation success
   - Verify redirect to lobby detail page
   - Verify user is set as host

3. **Test Lobby Name Validation (BVA)**
   - Test boundary values:
     - 1 character: "a" (too short)
     - 2 characters: "ab" (too short)
     - 3 characters: "abc" (valid minimum)
     - 50 characters: "a".repeat(50) (valid maximum)
     - 51 characters: "a".repeat(51) (too long)
   - Test empty lobby name
   - Test special characters: "Test@Lobby#123"
   - Verify appropriate error messages

4. **Test Private Lobby Creation**
   - Create lobby with privacy set to Private
   - Verify lobby code is generated
   - Verify lobby is not visible in public lobby list
   - Verify lobby code can be shared for joining

5. **Test Join Public Lobby**
   - Find available public lobby
   - Click "Join" button
   - Verify successful join
   - Verify redirect to lobby detail page
   - Verify user appears in lobby player list

6. **Test Join Private Lobby**
   - Get private lobby code
   - Enter code in private lobby entry field
   - Click "Join" button
   - Verify successful join
   - Verify redirect to lobby detail page

7. **Test Join Restrictions**
   - Attempt to join full lobby
   - Attempt to join in-progress lobby
   - Attempt to join lobby user is already in
   - Verify appropriate error messages
   - Verify join buttons are disabled appropriately

8. **Test Leave Lobby**
   - Join a lobby
   - Click "Leave Lobby" button
   - Verify confirmation dialog (if applicable)
   - Verify successful leave
   - Verify redirect to lobby browser
   - Verify user removed from lobby player list

9. **Test Host Leave Lobby**
   - Create a lobby as host
   - Have other players join
   - Leave the lobby as host
   - Verify lobby is closed or host transferred
   - Verify other players are notified

10. **Test Real-time Updates**
    - Open lobby in multiple browser tabs
    - Create/join/leave lobbies
    - Verify all tabs update in real-time
    - Test lobby status changes
    - Test player list updates

## DD-02-003 - Real-Time Lobby Updates

### Purpose
To verify that lobby information updates in real-time across all connected clients without requiring manual refresh.

### Inputs
**Real-time Events:**
- New lobby creation
- Player joins lobby
- Player leaves lobby
- Lobby status changes
- Lobby deletion/closure

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Lobby list updates automatically without refresh
- Player counts update in real-time
- Lobby status changes reflect immediately
- New lobbies appear automatically
- Closed lobbies disappear automatically
- All connected clients see updates simultaneously

**Fail Criteria:**
- Updates require manual refresh
- Delayed or missing updates
- Inconsistent updates across clients
- Real-time functionality not working

### Test Procedure
1. **Test Lobby Creation Updates**
   - Open lobby browser in two browser tabs
   - Create lobby in one tab
   - Verify lobby appears in other tab automatically
   - Verify no refresh required
   - Test with different lobby types

2. **Test Player Join Updates**
   - Create lobby in one tab
   - Join lobby from another tab
   - Verify player count updates in both tabs
   - Verify player list updates in both tabs
   - Test with multiple players joining

3. **Test Player Leave Updates**
   - Have multiple players in lobby
   - Have one player leave
   - Verify player count updates in all tabs
   - Verify player list updates in all tabs
   - Test host leaving scenario

4. **Test Lobby Status Changes**
   - Create lobby and have players join
   - Start the game (change status to in-progress)
   - Verify status updates in lobby browser
   - Verify join buttons become disabled
   - Test status changes back to waiting

5. **Test Lobby Closure Updates**
   - Create lobby with players
   - Close/delete lobby
   - Verify lobby disappears from browser list
   - Verify all connected clients see update
   - Test with different closure scenarios

6. **Test Multiple Simultaneous Updates**
   - Open multiple browser tabs
   - Perform multiple actions simultaneously:
     - Create multiple lobbies
     - Join/leave multiple lobbies
     - Change lobby statuses
   - Verify all updates appear correctly
   - Verify no updates are missed

7. **Test Update Timing**
   - Measure time between action and update
   - Verify updates appear within reasonable time (< 2 seconds)
   - Test with different network conditions
   - Verify updates are consistent across clients

8. **Test Error Recovery**
   - Disconnect network during updates
   - Reconnect network
   - Verify updates resume working
   - Verify missed updates are caught up
   - Test with intermittent connectivity

## DD-02-004 - Lobby Chat

### Purpose
To verify that users can send and receive chat messages in lobbies with proper real-time functionality and message handling.

### Inputs
**Valid Inputs:**
- Chat message: Text up to 500 characters
- Send action: Click send button or press Enter
- Message types: Player messages, system messages

**Invalid Inputs (BVA):**
- Empty messages
- Messages over 500 characters
- Special characters and formatting

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Chat interface displays with proper styling
- Messages send and receive in real-time
- Message history displays correctly
- System messages appear appropriately
- Message validation works properly
- Chat scrolls automatically to latest messages

**Fail Criteria:**
- Chat interface not displaying
- Messages not sending or receiving
- Real-time updates not working
- Message validation not working
- UI/UX issues with chat

### Test Procedure
1. **Access Lobby Chat**
   - Join a lobby
   - Verify chat interface appears
   - Verify cyberpunk styling and layout
   - Verify input field and send button

2. **Test Message Sending**
   - Type message: "Hello everyone!"
   - Click send button
   - Verify message appears in chat
   - Verify message shows sender name and timestamp
   - Test sending with Enter key

3. **Test Message Receiving**
   - Have another user send message
   - Verify message appears in chat
   - Verify real-time delivery
   - Verify message formatting and styling

4. **Test Message Validation (BVA)**
   - Test empty message (should not send)
   - Test very long message (500+ characters)
   - Test message with special characters
   - Verify appropriate validation messages
   - Verify send button disabled for invalid messages

5. **Test Message History**
   - Send multiple messages
   - Refresh page or reconnect
   - Verify message history is preserved
   - Verify messages display in correct order
   - Test with long message history

6. **Test System Messages**
   - Have player join lobby
   - Verify system message appears: "Player joined"
   - Have player leave lobby
   - Verify system message appears: "Player left"
   - Test other system events

7. **Test Chat Scrolling**
   - Send many messages to fill chat area
   - Verify chat scrolls to latest message
   - Test manual scrolling
   - Verify auto-scroll behavior

8. **Test Multiple Users Chat**
   - Have multiple users in lobby
   - Test messages from different users
   - Verify all messages appear for all users
   - Verify user identification in messages
   - Test concurrent messaging

9. **Test Chat Error Handling**
   - Test with network disconnected
   - Verify appropriate error messages
   - Test reconnection and message recovery
   - Test with invalid message formats

10. **Test Chat Performance**
    - Send many messages rapidly
    - Verify chat performance remains good
    - Test with long message history
    - Verify memory usage is reasonable


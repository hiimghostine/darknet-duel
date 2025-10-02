# Module 3 Test Cases - Real-Time Multiplayer Game

## DD-03-001 - Game Creation and Initialization

### Purpose
To verify that games can be created and initialized properly, with correct game state setup and player assignment.

### Inputs
**Valid Inputs:**
- Game creation from lobby
- Player joining existing game
- Game configuration settings

**Invalid Inputs (BVA):**
- Invalid game ID
- Missing players
- Corrupted game state

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Game initializes with proper state
- Players are assigned correct roles (attacker/defender)
- Game board displays correctly
- Initial resources and cards are distributed
- Game rules are properly enforced
- Loading screens and transitions work smoothly

**Fail Criteria:**
- Game fails to initialize
- Players not assigned correct roles
- Game board not displaying
- Initial state incorrect
- Loading issues or crashes

### Test Procedure
1. **Test Game Creation from Lobby**
   - Create lobby with 2 players
   - Click "Start Game" button
   - Verify loading screen appears
   - Verify game initializes successfully
   - Verify redirect to game board

2. **Test Game State Initialization**
   - Verify game board loads with proper layout
   - Verify both players are present
   - Verify player roles are assigned (attacker/defender)
   - Verify initial action points (AP) are set
   - Verify initial hand size is correct

3. **Test Initial Card Distribution**
   - Verify each player receives starting cards
   - Verify hand size limits are enforced
   - Verify cards are properly shuffled
   - Verify no duplicate cards in hands

4. **Test Infrastructure Setup**
   - Verify infrastructure cards are placed on board
   - Verify initial infrastructure states (secure/vulnerable)
   - Verify proper positioning and layout
   - Verify infrastructure cards are visible to both players

5. **Test Game Rules Initialization**
   - Verify turn order is established
   - Verify game phases are set correctly
   - Verify win conditions are clear
   - Verify game timer starts (if applicable)

6. **Test Player Assignment**
   - Verify attacker is assigned correctly
   - Verify defender is assigned correctly
   - Verify role indicators display properly
   - Verify role-based UI elements

7. **Test Game Board Layout**
   - Verify cyberpunk styling and theme
   - Verify all UI elements are present
   - Verify responsive layout works
   - Verify game controls are accessible

8. **Test Loading and Transitions**
   - Verify smooth transition from lobby to game
   - Verify loading animations work properly
   - Verify no UI glitches during transition
   - Verify game loads within reasonable time

9. **Test Error Handling**
   - Test with invalid game ID
   - Test with missing players
   - Test with network issues during initialization
   - Verify appropriate error messages
   - Verify graceful error recovery

## DD-03-002 - Turn-Based Gameplay, AP Allocation, Card Play, and Targeting

### Purpose
To verify that turn-based gameplay works correctly with proper AP allocation, card playing mechanics, and targeting systems.

### Inputs
**Valid Inputs:**
- Card selection from hand
- Target selection for targeted cards
- End turn action
- Card play actions

**Invalid Inputs (BVA):**
- Insufficient AP for card play
- Invalid target selection
- Playing cards out of turn
- Invalid card combinations

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Turn indicators display correctly
- AP allocation works properly
- Card play mechanics function correctly
- Targeting system works for targeted cards
- Turn progression works smoothly
- Game rules are enforced properly

**Fail Criteria:**
- Turn system not working
- AP allocation incorrect
- Card play not working
- Targeting system broken
- Game rules not enforced
- UI/UX issues

### Test Procedure
1. **Test Turn Indicator**
   - Verify current player turn is displayed
   - Verify turn indicator updates when turn changes
   - Verify visual indicators for active player
   - Verify turn counter displays correctly

2. **Test AP Allocation**
   - Verify initial AP is set correctly
   - Verify AP updates at start of each turn
   - Verify AP decreases when playing cards
   - Verify AP cannot go below zero
   - Verify AP display updates in real-time

3. **Test Card Selection**
   - Verify cards in hand are clickable
   - Verify playable cards are highlighted
   - Verify unplayable cards are disabled
   - Verify card selection feedback

4. **Test Card Play Mechanics**
   - Select playable card from hand
   - Click play button
   - Verify card is played successfully
   - Verify AP is deducted correctly
   - Verify card is removed from hand
   - Verify card effects are applied

5. **Test Targeting System**
   - Play card that requires targeting
   - Verify targeting mode is activated
   - Verify valid targets are highlighted
   - Verify invalid targets are disabled
   - Select valid target
   - Verify target is selected correctly
   - Verify card effect is applied to target

6. **Test Invalid Card Play**
   - Attempt to play card with insufficient AP
   - Verify error message appears
   - Verify card is not played
   - Verify AP is not deducted
   - Test with invalid targets

7. **Test Turn Progression**
   - Complete turn with valid actions
   - Click "End Turn" button
   - Verify turn passes to opponent
   - Verify turn indicator updates
   - Verify AP is allocated to new player
   - Verify hand is drawn (if applicable)

8. **Test Card Effects**
   - Play different types of cards
   - Verify effects are applied correctly
   - Verify visual feedback for effects
   - Verify effect duration and persistence
   - Test with multiple card effects

9. **Test Game Rules Enforcement**
   - Verify hand size limits are enforced
   - Verify turn time limits (if applicable)
   - Verify card play restrictions
   - Verify targeting restrictions
   - Test edge cases and boundary conditions

10. **Test Real-time Updates**
    - Verify all actions update in real-time
    - Verify both players see changes immediately
    - Verify game state synchronization
    - Test with network interruptions

## DD-03-003 - Real-Time State Synchronization

### Purpose
To verify that game state updates are synchronized in real-time across all connected clients.

### Inputs
**Real-time Events:**
- Card plays
- Turn changes
- AP updates
- Infrastructure state changes
- Game state modifications

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- All game state changes sync in real-time
- Both players see updates simultaneously
- No state inconsistencies between clients
- Smooth synchronization without delays
- Proper handling of concurrent actions

**Fail Criteria:**
- Delayed or missing updates
- State inconsistencies
- Synchronization failures
- Poor real-time performance

### Test Procedure
1. **Test Card Play Synchronization**
   - Play card in one client
   - Verify card play appears in other client
   - Verify AP updates in both clients
   - Verify hand updates in both clients
   - Test with multiple card plays

2. **Test Turn Change Synchronization**
   - End turn in one client
   - Verify turn indicator updates in both clients
   - Verify AP allocation in both clients
   - Verify UI updates in both clients
   - Test turn progression

3. **Test Infrastructure State Sync**
   - Apply effect to infrastructure card
   - Verify state change appears in both clients
   - Verify visual indicators update
   - Verify state persistence
   - Test multiple infrastructure changes

4. **Test Concurrent Actions**
   - Have both players perform actions simultaneously
   - Verify proper handling of concurrent actions
   - Verify no state conflicts
   - Verify proper turn order enforcement
   - Test with rapid actions

5. **Test State Consistency**
   - Compare game state between clients
   - Verify all values match
   - Verify no discrepancies
   - Test after various actions
   - Verify state remains consistent

6. **Test Update Timing**
   - Measure time between action and update
   - Verify updates appear within 1 second
   - Test with different network conditions
   - Verify consistent timing across clients

7. **Test State Recovery**
   - Disconnect one client temporarily
   - Perform actions in other client
   - Reconnect first client
   - Verify state is synchronized
   - Verify no missed updates

8. **Test Large State Updates**
   - Perform multiple actions rapidly
   - Verify all updates are received
   - Verify no updates are lost
   - Test with complex game states
   - Verify performance remains good

## DD-03-004 - Disconnection/Reconnection Handling

### Purpose
To verify that the game handles player disconnections and reconnections gracefully without losing game state.

### Inputs
**Disconnection Scenarios:**
- Network interruption
- Browser crash/close
- Server disconnection
- Temporary connectivity loss

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Game state is preserved during disconnection
- Reconnection restores game state correctly
- Other players are notified of disconnection
- Game continues smoothly after reconnection
- No data loss or corruption

**Fail Criteria:**
- Game state lost during disconnection
- Reconnection fails or corrupts state
- Other players not notified
- Game becomes unplayable
- Data loss or corruption

### Test Procedure
1. **Test Temporary Disconnection**
   - Disconnect network for 10-30 seconds
   - Verify game state is preserved
   - Reconnect network
   - Verify game state is restored
   - Verify no data loss

2. **Test Browser Refresh**
   - Refresh browser during game
   - Verify game state is restored
   - Verify player reconnects automatically
   - Verify game continues normally
   - Test multiple refreshes

3. **Test Browser Close/Reopen**
   - Close browser during game
   - Reopen browser and navigate to game
   - Verify game state is restored
   - Verify player reconnects
   - Verify game continues

4. **Test Server Disconnection**
   - Simulate server disconnection
   - Verify appropriate error messages
   - Verify reconnection attempts
   - Verify game state recovery
   - Test with different disconnection durations

5. **Test Multiple Disconnections**
   - Have multiple players disconnect
   - Verify game state is preserved
   - Have players reconnect
   - Verify all players rejoin successfully
   - Verify game continues normally

6. **Test Disconnection Notifications**
   - Have one player disconnect
   - Verify other players are notified
   - Verify appropriate UI indicators
   - Verify reconnection notifications
   - Test with different notification types

7. **Test Game Pause/Resume**
   - Verify game pauses during disconnection
   - Verify game resumes after reconnection
   - Verify turn order is maintained
   - Verify no actions are lost
   - Test with different pause durations

8. **Test State Recovery**
   - Perform various actions before disconnection
   - Disconnect and reconnect
   - Verify all actions are preserved
   - Verify game state is identical
   - Test with complex game states

## DD-03-005 - Game State Persistence and Recovery

### Purpose
To verify that game state is properly persisted and can be recovered after interruptions or page refreshes.

### Inputs
**Recovery Scenarios:**
- Page refresh
- Browser close/reopen
- Network interruption
- Server restart

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Game state is persisted on server
- State recovery works after interruptions
- No data loss during recovery
- Game continues from correct state
- All players can rejoin successfully

**Fail Criteria:**
- Game state not persisted
- Recovery fails or corrupts state
- Data loss during recovery
- Game cannot be resumed
- Players cannot rejoin

### Test Procedure
1. **Test Page Refresh Recovery**
   - Play game for several turns
   - Refresh browser page
   - Verify game state is restored
   - Verify all actions are preserved
   - Verify game continues normally

2. **Test Browser Close/Reopen Recovery**
   - Play game for several turns
   - Close browser completely
   - Reopen browser and navigate to game
   - Verify game state is restored
   - Verify all progress is preserved

3. **Test Network Interruption Recovery**
   - Play game for several turns
   - Disconnect network for extended period
   - Reconnect network
   - Verify game state is restored
   - Verify no data loss

4. **Test Server Restart Recovery**
   - Play game for several turns
   - Restart game server
   - Verify game state is restored
   - Verify all players can rejoin
   - Verify game continues normally

5. **Test Complex State Recovery**
   - Play game with complex state (many cards played, effects active)
   - Perform various recovery scenarios
   - Verify all state is preserved
   - Verify game continues correctly
   - Test with multiple players

6. **Test State Consistency**
   - Compare game state before and after recovery
   - Verify all values match exactly
   - Verify no data corruption
   - Verify all players see same state
   - Test with different game phases

7. **Test Recovery Performance**
   - Measure time to recover game state
   - Verify recovery completes within reasonable time
   - Test with large game states
   - Verify performance is acceptable

8. **Test Edge Case Recovery**
   - Test recovery during critical game moments
   - Test recovery with pending actions
   - Test recovery with active effects
   - Verify all edge cases are handled properly


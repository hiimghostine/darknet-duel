# Module 4 Test Cases - Card System and Game Logic

## DD-04-001 - Card Play, Targeting, and Effect Resolution

### Purpose
To verify that card playing mechanics work correctly with proper targeting systems and effect resolution.

### Inputs
**Valid Inputs:**
- Playable cards from hand
- Valid target selections
- Card effect parameters

**Invalid Inputs (BVA):**
- Unplayable cards (insufficient AP, wrong phase)
- Invalid targets (wrong type, already targeted)
- Invalid effect parameters

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Cards play correctly with proper validation
- Targeting system works for targeted cards
- Card effects are applied correctly
- Visual feedback is provided for all actions
- Game state updates properly after card play

**Fail Criteria:**
- Cards play without proper validation
- Targeting system not working
- Card effects not applied correctly
- Poor visual feedback
- Game state not updated properly

### Test Procedure
1. **Test Basic Card Play**
   - Select playable card from hand
   - Click play button
   - Verify card is played successfully
   - Verify AP is deducted correctly
   - Verify card is removed from hand
   - Verify visual feedback is provided

2. **Test Card Validation**
   - Attempt to play card with insufficient AP
   - Verify error message appears
   - Verify card is not played
   - Verify AP is not deducted
   - Test with different validation rules

3. **Test Targeting System**
   - Play card that requires targeting
   - Verify targeting mode is activated
   - Verify valid targets are highlighted
   - Verify invalid targets are disabled
   - Select valid target
   - Verify target is selected correctly
   - Verify card effect is applied to target

4. **Test Invalid Targeting**
   - Play card that requires targeting
   - Attempt to select invalid target
   - Verify error message appears
   - Verify targeting mode remains active
   - Verify card is not played
   - Test with different invalid targets

5. **Test Card Effects**
   - Play different types of cards
   - Verify effects are applied correctly
   - Verify visual feedback for effects
   - Verify effect duration and persistence
   - Test with multiple card effects

6. **Test Effect Resolution**
   - Play card with immediate effect
   - Verify effect is resolved immediately
   - Verify game state is updated
   - Verify visual indicators are updated
   - Test with delayed effects

7. **Test Card Combinations**
   - Play multiple cards in sequence
   - Verify effects stack correctly
   - Verify no conflicts between effects
   - Verify proper effect resolution order
   - Test with complex combinations

8. **Test Card Play Feedback**
   - Verify visual feedback for card play
   - Verify sound effects (if applicable)
   - Verify animation effects
   - Verify UI updates
   - Test with different card types

9. **Test Error Handling**
   - Test with invalid card data
   - Test with corrupted game state
   - Test with network issues
   - Verify appropriate error messages
   - Verify graceful error recovery

## DD-04-002 - Infrastructure State Tracking

### Purpose
To verify that infrastructure cards maintain correct states and update properly based on card effects and game events.

### Inputs
**Valid Inputs:**
- Card effects that modify infrastructure
- Game events that change infrastructure state
- State transition triggers

**Invalid Inputs (BVA):**
- Invalid state transitions
- Corrupted infrastructure data
- Missing infrastructure cards

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Infrastructure states are tracked correctly
- State changes are applied properly
- Visual indicators update correctly
- State persistence works across turns
- All infrastructure cards maintain correct states

**Fail Criteria:**
- Infrastructure states not tracked
- State changes not applied
- Visual indicators not updating
- State persistence issues
- Infrastructure cards in wrong states

### Test Procedure
1. **Test Initial Infrastructure State**
   - Verify all infrastructure cards start in correct state
   - Verify visual indicators are displayed
   - Verify state information is accessible
   - Verify no corrupted states

2. **Test State Transitions**
   - Apply card effect that changes infrastructure state
   - Verify state transition occurs correctly
   - Verify visual indicators update
   - Verify state is persisted
   - Test with different state transitions

3. **Test State Persistence**
   - Change infrastructure state
   - End turn and have opponent play
   - Verify state is maintained
   - Verify no state reversion
   - Test across multiple turns

4. **Test Visual State Indicators**
   - Verify different states have different visual indicators
   - Verify state changes are visually clear
   - Verify indicators are consistent
   - Verify accessibility of state information
   - Test with different visual themes

5. **Test State Validation**
   - Attempt invalid state transitions
   - Verify appropriate error handling
   - Verify state remains valid
   - Verify no state corruption
   - Test with edge cases

6. **Test Multiple Infrastructure Cards**
   - Test state tracking for multiple cards
   - Verify each card maintains independent state
   - Verify no state interference
   - Verify proper state updates
   - Test with complex state combinations

7. **Test State Recovery**
   - Change infrastructure states
   - Disconnect and reconnect
   - Verify states are restored correctly
   - Verify no state loss
   - Test with different recovery scenarios

8. **Test State Synchronization**
   - Change infrastructure state
   - Verify both players see state change
   - Verify real-time updates
   - Verify state consistency
   - Test with concurrent changes

## DD-04-003 - Game Rules Enforcement

### Purpose
To verify that game rules are properly enforced throughout gameplay, including AP limits, hand size limits, and turn restrictions.

### Inputs
**Valid Inputs:**
- Actions within game rules
- Valid card plays
- Proper turn progression

**Invalid Inputs (BVA):**
- Actions that violate game rules
- Invalid card plays
- Out-of-turn actions

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Game rules are enforced consistently
- Invalid actions are prevented
- Appropriate error messages are shown
- Game state remains valid
- Turn progression works correctly

**Fail Criteria:**
- Game rules not enforced
- Invalid actions allowed
- Poor error handling
- Game state becomes invalid
- Turn progression issues

### Test Procedure
1. **Test AP Limit Enforcement**
   - Attempt to play card with insufficient AP
   - Verify action is blocked
   - Verify appropriate error message
   - Verify AP is not deducted
   - Test with different AP amounts

2. **Test Hand Size Enforcement**
   - Attempt to draw card when hand is full
   - Verify action is blocked
   - Verify appropriate error message
   - Verify hand size limit is enforced
   - Test with different hand sizes

3. **Test Turn Order Enforcement**
   - Attempt to play card out of turn
   - Verify action is blocked
   - Verify appropriate error message
   - Verify turn order is maintained
   - Test with different turn scenarios

4. **Test Card Play Restrictions**
   - Attempt to play restricted cards
   - Verify restrictions are enforced
   - Verify appropriate error messages
   - Verify game state remains valid
   - Test with different restrictions

5. **Test Phase Restrictions**
   - Attempt actions in wrong phase
   - Verify phase restrictions are enforced
   - Verify appropriate error messages
   - Verify phase transitions work correctly
   - Test with different phases

6. **Test Win Condition Enforcement**
   - Achieve win condition
   - Verify win is detected correctly
   - Verify game ends appropriately
   - Verify winner is determined correctly
   - Test with different win conditions

7. **Test Rule Validation**
   - Test with invalid game state
   - Verify rules are enforced
   - Verify state is corrected
   - Verify no rule violations
   - Test with edge cases

8. **Test Error Recovery**
   - Trigger rule violation
   - Verify appropriate error handling
   - Verify game state is corrected
   - Verify game continues normally
   - Test with different violations

## DD-04-004 - Game State Visualization

### Purpose
To verify that the game state is properly visualized with clear, accurate, and responsive UI elements.

### Inputs
**Visualization Requirements:**
- Game board layout
- Card displays
- State indicators
- Player information
- Game progress

### Expected Outputs & Pass/Fail Criteria
**Pass Criteria:**
- Game state is clearly visualized
- All UI elements are accurate
- Visual updates are responsive
- Information is easily accessible
- UI is consistent and intuitive

**Fail Criteria:**
- Game state not clearly visualized
- UI elements inaccurate
- Poor visual responsiveness
- Information not accessible
- UI inconsistencies

### Test Procedure
1. **Test Game Board Layout**
   - Verify game board displays correctly
   - Verify all areas are visible
   - Verify layout is responsive
   - Verify cyberpunk styling
   - Test with different screen sizes

2. **Test Card Displays**
   - Verify cards display correctly
   - Verify card information is readable
   - Verify card states are clear
   - Verify card interactions work
   - Test with different card types

3. **Test State Indicators**
   - Verify current turn indicator
   - Verify AP display
   - Verify hand size display
   - Verify game phase indicator
   - Verify all indicators are accurate

4. **Test Player Information**
   - Verify player names display
   - Verify player roles display
   - Verify player stats display
   - Verify player status indicators
   - Test with different player types

5. **Test Visual Updates**
   - Perform game actions
   - Verify visual updates are immediate
   - Verify animations work smoothly
   - Verify no visual glitches
   - Test with rapid actions

6. **Test Information Accessibility**
   - Verify all information is visible
   - Verify tooltips work correctly
   - Verify help information is available
   - Verify information is organized logically
   - Test with different user preferences

7. **Test UI Consistency**
   - Verify consistent styling throughout
   - Verify consistent behavior
   - Verify consistent layout
   - Verify consistent interactions
   - Test with different UI elements

8. **Test Performance**
   - Test with complex game states
   - Verify UI remains responsive
   - Verify no performance issues
   - Verify smooth animations
   - Test with different devices

9. **Test Error Visualization**
   - Trigger various errors
   - Verify error messages are clear
   - Verify error indicators are visible
   - Verify error recovery is clear
   - Test with different error types

10. **Test Accessibility**
    - Test with different accessibility settings
    - Verify keyboard navigation works
    - Verify screen reader compatibility
    - Verify color contrast is adequate
    - Test with different user needs


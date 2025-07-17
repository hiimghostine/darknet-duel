# Memory Corruption Attack (A307) Implementation

## Overview
The Memory Corruption Attack is a powerful wildcard card that forces the opponent to discard their entire hand and draw the same number of cards from their deck. This represents a devastating cyber attack that corrupts system memory, causing complete data loss.

## Card Definition
```json
{
  "id": "A307",
  "name": "Memory Corruption Attack",
  "type": "wildcard",
  "category": "any",
  "cost": 2,
  "description": "Corrupts system memory causing complete data loss",
  "flavor": "When you can't steal the data, make sure no one else can use it either",
  "effect": "The defender must discard their entire hand and draw the same number of cards from their deck.",
  "img": "memory_corruption",
  "isReactive": false,
  "target": "opponent_hand",
  "wildcardType": "special",
  "specialEffect": "discard_redraw"
}
```

## Implementation Details

### Backend Implementation

#### 1. Wildcard Resolver (`game-server/src/game/actions/wildcardResolver.ts`)
- Added specific handling for card ID "A307"
- Added generic handling for `specialEffect: "discard_redraw"`
- Imports and calls `handleHandDisruption` with effect type `'discard_redraw'`
- Determines target player (opponent) based on current player role

#### 2. Card Validation (`game-server/src/game/actions/throwCardMove/utils/throwCardValidation.ts`)
- Added special handling for hand-targeting cards (`target: "opponent_hand"`)
- Bypasses infrastructure validation for Memory Corruption Attack
- Returns valid result without requiring infrastructure target

#### 3. Card Routing (`game-server/src/game/actions/throwCardMove/throwCardMove.ts`)
- Added special early detection and routing for Memory Corruption Attack
- Bypasses normal wildcard choice system since it doesn't target infrastructure
- Directly applies wildcard effects and returns result

#### 4. Hand Disruption System (`game-server/src/game/actions/handDisruption.ts`)
- Already implemented `handleHandDisruption` function with `'discard_redraw'` effect
- Handles deck reshuffling when deck has insufficient cards
- Creates proper game actions for tracking
- Updates game state with hand replacement

#### 5. Game Phases (`game-server/src/game/core/gamePhases.ts`)
- Added `chooseHandDiscard` move to both action and reaction stages
- Ensures the move is available when needed during gameplay

### Frontend Implementation

#### 1. Card Actions (`darknet-duel-frontend/src/hooks/useCardActions.ts`)
- Added special detection for Memory Corruption Attack
- Cards with `target: "opponent_hand"` don't require infrastructure targeting
- Direct play uses `throwCard` with dummy target since validation skips infrastructure checks

#### 2. Game Board (`darknet-duel-frontend/src/components/game/BalatroGameBoard.tsx`)
- Fixed HandDisruptionUI condition to show for non-target player
- Connects `handleChooseHandDiscard` callback to the UI component

#### 3. Hand Disruption UI (`darknet-duel-frontend/src/components/game/board-components/HandDisruptionUI.tsx`)
- Already implemented UI for selecting cards to discard
- Shows opponent's revealed hand with selection interface
- Validates selection count and submits choice

## Flow Diagram

```
1. Attacker plays Memory Corruption Attack (A307)
2. throwCardMove detects hand-targeting card
3. Validation bypasses infrastructure checks
4. wildcardResolver applies discard_redraw effect
5. handDisruption system processes opponent's hand
6. Game state updated with hand replacement
7. No UI interaction needed - effect is immediate
```

## Technical Notes

### Key Features
- **Immediate Effect**: No player choice required, effect applies instantly
- **Complete Hand Replacement**: All cards discarded and redrawn
- **Deck Safety**: Handles insufficient deck size by reshuffling discard pile
- **Action Tracking**: Creates proper game actions for replay/history
- **Cost**: 2 Action Points (expensive but powerful)

### Edge Cases Handled
- **Empty Deck**: Reshuffles discard pile into deck before drawing
- **Insufficient Cards**: Combines deck and discard pile for reshuffling
- **Zero Hand Size**: Handles case where opponent has no cards gracefully

### Security Considerations
- Validates player permissions before applying effect
- Ensures only the opponent's hand is affected
- Prevents self-targeting or invalid targets

## Testing

### Manual Test Cases
1. **Basic Function**: Play A307 with opponent having 5+ cards
2. **Empty Deck**: Play A307 when opponent's deck is smaller than hand size
3. **Edge Cases**: Play A307 when opponent has 0 cards, 1 card, or full hand
4. **Cost Validation**: Ensure 2 AP is required and properly deducted
5. **Turn Integration**: Verify card works in both action and reaction phases

### Expected Results
- Opponent's hand completely replaced with new cards
- Hand size remains the same before and after
- Player loses 2 Action Points
- Game state properly updated
- No additional UI interactions required

## Future Enhancements

### Potential Improvements
1. **Animation**: Add visual effect showing hand corruption
2. **Sound Effects**: Add audio feedback for the devastating effect
3. **Statistics**: Track usage and effectiveness in game analytics
4. **Balancing**: Monitor win rates and adjust cost if needed

### Related Cards
- **Threat Intelligence (D304)**: Allows viewing and selective discard
- **Other Hand Disruption**: Could extend system for more hand-targeting effects

## Conclusion

The Memory Corruption Attack implementation successfully integrates with the existing wildcard and hand disruption systems. It provides a powerful, thematic effect that can dramatically shift the game state while maintaining balance through its high cost and single-use nature.
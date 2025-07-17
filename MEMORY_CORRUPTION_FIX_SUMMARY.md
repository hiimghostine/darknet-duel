# Memory Corruption Attack - Bug Fix Summary

## Issue Identified
The Memory Corruption Attack card was not working properly because the card ID detection was looking for exactly "A307", but the actual card IDs in the game include timestamps and random suffixes (e.g., "A307_cheat_1752720084181_bpnhcbp7c").

## Root Cause
The hardcoded card ID check `card.id === 'A307'` was failing because:
- Dev/cheat cards have dynamic IDs with suffixes
- The detection logic was too strict and didn't account for ID variations

## Files Fixed

### Backend Changes:
1. **`game-server/src/game/actions/throwCardMove/throwCardMove.ts:158`**
   - Changed: `card!.id === 'A307'` 
   - To: `card!.id.startsWith('A307')`

2. **`game-server/src/game/actions/throwCardMove/utils/throwCardValidation.ts:91`**
   - Changed: `card.id === 'A307'`
   - To: `card.id.startsWith('A307')`

3. **`game-server/src/game/actions/throwCardMove/utils/throwCardValidation.ts:114`**
   - Changed: `card.id === 'A307'`
   - To: `card.id.startsWith('A307')`

### Frontend Changes:
4. **`darknet-duel-frontend/src/hooks/useCardActions.ts:33`**
   - Changed: `card.id === 'A307'`
   - To: `card.id.startsWith('A307')`

5. **`darknet-duel-frontend/src/hooks/useCardActions.ts:246`**
   - Changed: `card.id === 'A307'`
   - To: `card.id.startsWith('A307')`

## Expected Behavior After Fix

### Before Fix:
```
🔥 Memory Corruption Attack (A307_cheat_1752720084181_bpnhcbp7c) detected! Applying discard_redraw effect
💥 Memory Corruption Attack targeting player: 1
✅ Memory Corruption Attack applied successfully
```
But then it continued to normal infrastructure processing instead of hand disruption.

### After Fix:
1. **Detection**: Card properly identified as Memory Corruption Attack
2. **Routing**: Goes directly to hand disruption logic (bypasses infrastructure targeting)
3. **Effect**: Opponent's entire hand discarded and redrawn
4. **No Infrastructure Change**: No infrastructure should be modified
5. **Cost**: 2 Action Points properly deducted

## Testing Scenarios

### Test 1: Basic Function
- Play Memory Corruption Attack with opponent having 5+ cards
- **Expected**: Opponent hand completely replaced, no infrastructure change

### Test 2: Edge Cases
- Play with opponent having 0, 1, or max cards
- **Expected**: Works correctly regardless of hand size

### Test 3: Deck Management
- Play when opponent's deck is smaller than hand size
- **Expected**: Discard pile reshuffled into deck before drawing

### Test 4: Cost Validation
- Try to play without enough Action Points
- **Expected**: Card play blocked, error message shown

## Debug Logs to Watch For

### Success Indicators:
```
🔥 Memory Corruption Attack detected! Applying immediate hand disruption
🔥 Memory Corruption Attack (A307_*) detected! Applying discard_redraw effect
💥 Memory Corruption Attack targeting player: [target_id]
✅ Memory Corruption Attack applied successfully
[Player] discarded their hand and drew [N] new cards!
```

### Failure Indicators:
```
Special wildcard [card] - auto-selecting single type: special
Auto-selected wildcard type: special for [state] infrastructure
Unknown special card: Memory Corruption Attack, applying default exploit effect
```

## Verification Steps

1. **Card Detection**: Logs should show "🔥 Memory Corruption Attack detected! Applying immediate hand disruption"
2. **Hand Disruption**: Opponent's hand should be completely replaced
3. **No Infrastructure**: Target infrastructure should remain unchanged
4. **Action Points**: Player should lose 2 AP
5. **Game State**: Game should continue normally after effect

The fix ensures that Memory Corruption Attack cards with any ID suffix (including cheat/dev cards) are properly detected and routed to the hand disruption system instead of the normal infrastructure targeting system.
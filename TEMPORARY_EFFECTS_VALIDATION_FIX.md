# Temporary Effects Validation Fix

## Problem
The frontend allowed players to throw cards at infrastructure that had temporary protection effects, but the backend would reject these moves. This caused a "rubberbanding" effect where:
1. Frontend shows card leaving hand
2. Backend rejects the move
3. Card snaps back to hand

## Root Cause
The frontend's `getValidTargets()` function only checked:
- Infrastructure state (secure, vulnerable, compromised, etc.)
- Attack vector compatibility

But it **did NOT check** for temporary effects that prevent certain card types:
- `prevent_exploits` (from D305 - Defensive Hardening Protocol)
- `prevent_reactions` (from A301 - Advanced Persistent Threat)
- `prevent_restore` (from A304 - Privilege Escalation)
- `prevent_reactive_attacks` (from D301 - Advanced Threat Defense)

The backend's `validateCardTargeting()` function in `validators.ts` **DOES check** these effects.

## Solution
Added a new helper function `hasTemporaryEffect()` to both frontend hooks that:
1. Checks `G.temporaryEffects` array for matching effect type
2. Validates the effect targets the specific infrastructure
3. Ensures the effect is still active (`duration > 0`)

## Files Modified

### 1. `/darknet-duel-frontend/src/hooks/useCardActions.ts`
- Added `hasTemporaryEffect()` helper function (lines 127-137)
- Updated `getValidTargets()` to filter out protected infrastructure:
  - Exploit cards: Check `prevent_exploits` (lines 209, 303, 401)
  - Response cards: Check `prevent_restore` (lines 246, 433)
  - Reaction cards: Check `prevent_reactions` (lines 256, 444)
- Updated dependencies array to include `G.temporaryEffects` and `hasTemporaryEffect`

### 2. `/darknet-duel-frontend/src/hooks/bridge/useCardActionsBridge.ts`
- Added `hasTemporaryEffect()` helper function (lines 132-142)
- Applied same filtering logic as above
- Updated dependencies array

## How It Works

### Before (Rubberbanding)
```typescript
// Frontend - Only checked state
const exploitTargets = G.infrastructure.filter(infra => 
  infra.state === 'secure' || infra.state === 'fortified'
); // ❌ Returns infrastructure even if protected
```

### After (No Rubberbanding)
```typescript
// Frontend - Checks state AND temporary effects
const exploitTargets = G.infrastructure.filter(infra => {
  const stateMatch = infra.state === 'secure' || infra.state === 'fortified';
  const notProtected = !hasTemporaryEffect('prevent_exploits', infra.id);
  return stateMatch && notProtected; // ✅ Filters out protected infrastructure
});
```

## Effect Duration Management
The fix automatically handles effect expiration:
- Effects with `duration > 0` are considered active
- Effects with `duration === 0` are ignored (expired)
- Backend's `TemporaryEffectsManager.processTurnStart()` decrements duration each turn
- When duration reaches 0, infrastructure becomes targetable again

## Cards That Apply These Effects

### Defender Cards
- **D305 - Defensive Hardening Protocol**: Prevents exploit cards for 1 turn
- **D301 - Advanced Threat Defense**: Prevents reactive attack cards for 1 turn
- **D306 - Honeypot Network**: Taxes exploit cards (doesn't prevent, but penalizes)

### Attacker Cards
- **A301 - Advanced Persistent Threat**: Prevents reaction cards for 1 turn
- **A304 - Privilege Escalation**: Prevents response cards for 1 turn

## Testing Checklist
- [ ] Play D305, verify exploit cards cannot target that infrastructure
- [ ] Wait 1 turn, verify exploit cards CAN target it again (effect expired)
- [ ] Play A301, verify reaction cards cannot target that infrastructure
- [ ] Play A304, verify response cards cannot target that infrastructure
- [ ] Verify no rubberbanding occurs when trying to throw blocked cards
- [ ] Verify valid targets still work normally

## Technical Notes
- The `hasTemporaryEffect()` function is memoized with `useCallback` for performance
- It's added to the dependency array of `getValidTargets()` to ensure re-computation when effects change
- The check `effect.duration > 0` ensures expired effects don't block targeting
- The implementation matches the backend's `TemporaryEffectsManager.hasEffect()` logic exactly

# Position Swap Implementation

## Overview
This document describes the implementation of the **Position Swap** feature that allows players to exchange their roles (Attacker ↔ Defender) in the lobby before a game starts.

## Problem Statement
The game has deep dependencies on player positions:
- **Player 0 (slot 0)** = Always Attacker (Red Team)
- **Player 1 (slot 1)** = Always Defender (Blue Team)

These assignments are hardcoded throughout the codebase in:
- Game initialization logic
- Player role assignments
- Deck creation
- Turn management
- UI rendering

Simply changing role preferences wouldn't work - we needed to **physically swap player positions**.

---

## Solution: Atomic Position Swap

Instead of having players leave and rejoin (which creates race conditions), we implemented an **atomic server-side swap** that exchanges ALL player data between slots 0 and 1.

---

## Implementation Details

### 1. Game Server Endpoint
**File:** `game-server/src/server/index.ts`

**New Endpoint:** `POST /games/:name/:id/swap-positions`

**What it does:**
1. Validates both players are present and requesting player has valid credentials
2. Checks that the OTHER player has accepted the swap (`swapAccepted: true`)
3. Atomically swaps ALL player data between slot 0 and slot 1:
   - Player names
   - Player data (realUserId, realUsername, etc.)
   - Connection status
   - Credentials (kept with original connection)
4. Updates `playerUuidMap` in game state if it exists
5. Returns new player ID assignments to both clients

**Key Features:**
- Atomic operation (no partial swaps possible)
- Preserves user data and credentials
- Updates both lobby metadata and game state
- Returns mapping of credentials to new player IDs

---

### 2. Lobby Service Methods
**File:** `darknet-duel-frontend/src/services/lobby.service.ts`

**New Methods:**

#### `requestPositionSwap(matchID: string): Promise<boolean>`
- Sets `swapRequested: true` on current player's data
- Notifies opponent of swap request

#### `acceptPositionSwap(matchID: string): Promise<{success: boolean, newPlayerID?: string}>`
- Sets `swapAccepted: true` on current player's data
- Calls the atomic swap endpoint
- Updates localStorage with new player ID
- Returns success status and new player ID

#### `cancelPositionSwap(matchID: string): Promise<boolean>`
- Clears `swapRequested` and `swapAccepted` flags
- Cancels pending swap request

**Updated Interface:**
```typescript
export interface GameMatch {
  players: {
    data?: {
      swapRequested?: boolean;   // Player wants to swap positions
      swapAccepted?: boolean;    // Player accepted opponent's swap request
      // ... other fields
    };
  }[];
}
```

---

### 3. UI Implementation
**File:** `darknet-duel-frontend/src/components/lobby/LobbyDetail.tsx`

**New State Variables:**
- `swapRequested` - Current player has requested a swap
- `opponentRequestedSwap` - Opponent has requested a swap
- `swapInProgress` - Swap is currently being executed

**New Handlers:**
- `handleRequestPositionSwap()` - Request a swap
- `handleAcceptPositionSwap()` - Accept and execute swap
- `handleCancelPositionSwap()` - Cancel swap request

**UI Components:**
- **Position Swap Section** - Shows current role and swap controls
- **Swap Request Button** - Disabled when ready
- **Accept/Decline Buttons** - Appears when opponent requests swap
- **Status Messages** - Shows swap progress and waiting states

**Visual States:**
1. **Normal State**: "SWAP ROLES" button visible (if both players present and not ready)
2. **Requested State**: "CANCEL REQUEST" button with pulsing animation
3. **Incoming Request**: "ACCEPT SWAP" and "DECLINE" buttons with alert message
4. **In Progress**: Loading spinner with "Swapping positions..." message
5. **Ready State**: Info message to unready before swapping

---

## Safety Measures

### 1. Ready State Protection
- Players CANNOT request swap while ready
- If player readies up while swap is pending, swap is auto-cancelled

### 2. Game Start Protection
- Host CANNOT start game while swap is pending
- Error message shown if attempted

### 3. Atomic Swap Validation
- Both players must be present
- Requesting player must have valid credentials
- Accepting player must have set `swapAccepted: true`
- Swap is all-or-nothing (no partial swaps)

### 4. State Synchronization
- After swap, both clients update their localStorage
- Polling picks up new player positions immediately
- Game state reflects new player assignments

---

## User Flow

### Scenario: Player 1 wants to be Attacker

```
1. Player 1 clicks "SWAP ROLES"
   → Sets swapRequested: true
   → Player 0 sees "Accept Swap" button

2. Player 0 clicks "ACCEPT SWAP"
   → Sets swapAccepted: true
   → Calls swap endpoint
   → Server validates both flags

3. Server executes atomic swap:
   → Player 0 data → Slot 1
   → Player 1 data → Slot 0
   → Returns new player IDs

4. Both clients update:
   → localStorage updated with new player IDs
   → UI refreshes
   → Player 1 is now in slot 0 (Attacker)
   → Player 0 is now in slot 1 (Defender)

5. Game starts with correct roles
   → Player in slot 0 gets Attacker deck
   → Player in slot 1 gets Defender deck
```

---

## Technical Notes

### Why Keep Credentials?
Credentials are tied to the WebSocket connection. When we swap, we keep each player's credentials with their connection but move their data to the new slot. This ensures:
- Players stay connected
- No re-authentication needed
- Seamless transition

### Why Atomic Swap?
Alternative approaches (leave/rejoin, role preference system) had issues:
- **Leave/Rejoin**: Race conditions, connection drops, lobby cleanup triggers
- **Role Preferences**: Game logic too deeply coupled to player IDs

Atomic swap was the cleanest solution that:
- Works with existing game logic
- No code changes to game initialization
- No race conditions
- Instant, single-operation swap

### Data Preserved
During swap, these are preserved:
- Real user UUID and username
- User avatar and decoration
- Connection status
- Credentials (but swapped between slots)

These are reset:
- Ready status (both set to false)
- Swap request flags (both cleared)

---

## Testing Checklist

- [ ] Two players join lobby
- [ ] Player 1 requests swap → Player 0 sees request
- [ ] Player 0 accepts → Swap completes successfully
- [ ] Player IDs update correctly in localStorage
- [ ] UI reflects new positions immediately
- [ ] Both players see correct roles
- [ ] Game starts with correct role assignments
- [ ] Player 0 gets Attacker deck, Player 1 gets Defender deck
- [ ] Cannot swap while ready
- [ ] Cannot start game during swap
- [ ] Swap request can be cancelled
- [ ] Declining a swap clears the request
- [ ] Readying up cancels pending swaps

---

## Files Modified

### Backend (Game Server)
- `game-server/src/server/index.ts` - Added atomic swap endpoint

### Frontend
- `darknet-duel-frontend/src/services/lobby.service.ts` - Added swap methods and interface updates
- `darknet-duel-frontend/src/components/lobby/LobbyDetail.tsx` - Added UI and handlers

### Total Changes
- **1 new endpoint** (150+ lines)
- **3 new service methods** (80+ lines)
- **3 new UI handlers** (80+ lines)
- **1 new UI section** (110+ lines)
- **Safety measures** integrated throughout

---

## Future Enhancements

Potential improvements:
1. **Swap History**: Track who initiated swap for analytics
2. **Swap Timeout**: Auto-cancel swap requests after X seconds
3. **Swap Animation**: Visual feedback during the swap
4. **Role Preview**: Show what deck you'll get before accepting
5. **Quick Swap**: One-click mutual swap if both want to swap

---

## Conclusion

The Position Swap feature provides a seamless way for players to exchange roles without breaking the game's fundamental architecture. The atomic swap approach ensures data integrity while maintaining a smooth user experience.

**Status**: ✅ Fully Implemented and Ready for Testing


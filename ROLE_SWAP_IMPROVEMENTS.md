# Role Swap Improvements

## Changes Made

### 1. ✅ Added "YOUR ROLE" Section
- Matches public lobby style exactly
- Shows current role: ATTACKER or DEFENDER
- Shows team color and description:
  - 🔴 Red Team - Player 0 - Exploit & Attack
  - 🔵 Blue Team - Player 1 - Defend & Fortify

### 2. ✅ Removed "Role Assignment" Section
- Redundant information removed
- Cleaner UI

### 3. ✅ Swap Requires Confirmation from Both Players
- **Before**: Host clicked swap → instant swap
- **After**: Request → Accept/Decline → Swap

## New Swap Flow

### Step 1: Request Swap
Either player can click "SWAP ROLES" button

### Step 2: Other Player Receives Request
- Sees animated notification: "⚠️ [Player] wants to swap roles!"
- Shows what role they'll become
- Two buttons appear:
  - **ACCEPT** (green, animated)
  - **DECLINE** (red)

### Step 3: Response
- **If Accepted**: Positions swap instantly, both players see update
- **If Declined**: Requester sees "Position swap request was declined"

### Step 4: Cancel
Requester can cancel their own request before it's accepted/declined

---

## Backend Implementation

### New Events

**`lobby:swap:request`**
- Sent by: Player requesting swap
- Triggers: `lobby:swap:requested` to other player
- Triggers: `lobby:swap:sent` to requester

**`lobby:swap:accept`**
- Sent by: Player accepting swap
- Triggers: Actual position swap
- Triggers: `lobby:updated` to all players

**`lobby:swap:decline`**
- Sent by: Player declining swap
- Triggers: `lobby:swap:declined` to requester

---

## Frontend Implementation

### New State
```tsx
const [swapRequested, setSwapRequested] = useState(false);
const [swapRequestFrom, setSwapRequestFrom] = useState<{ userId: string; username: string } | null>(null);
```

### New Event Handlers
```tsx
handleSwapRequested() // Receive swap request
handleSwapSent()      // Confirm request sent
handleSwapDeclined()  // Handle declined request
```

### New Action Handlers
```tsx
handleRequestSwap()   // Send swap request
handleAcceptSwap()    // Accept incoming request
handleDeclineSwap()   // Decline incoming request
```

---

## UI States

### State 1: No Swap Active
```
┌──────────────────────────────────────┐
│ YOUR ROLE: ATTACKER                  │
│ 🔴 Red Team - Player 0               │
│                      [SWAP ROLES]    │
└──────────────────────────────────────┘
```

### State 2: Waiting for Response (Requester)
```
┌──────────────────────────────────────┐
│ YOUR ROLE: ATTACKER                  │
│ 🔴 Red Team - Player 0               │
│              [CANCEL REQUEST] ⏳     │
├──────────────────────────────────────┤
│ ⏳ Waiting for opponent to accept... │
└──────────────────────────────────────┘
```

### State 3: Received Request (Receiver)
```
┌──────────────────────────────────────┐
│ YOUR ROLE: DEFENDER                  │
│ 🔵 Blue Team - Player 1              │
│         [ACCEPT ✓]  [DECLINE ✗]     │
├──────────────────────────────────────┤
│ ⚠️ Player wants to swap! You'll     │
│    become ATTACKER (Player 0)        │
└──────────────────────────────────────┘
```

---

## Comparison: Public vs Private Lobby

| Feature | Public Lobby | Private Lobby | Status |
|---------|-------------|---------------|--------|
| YOUR ROLE Display | ✅ | ✅ | ✅ Match |
| Team Description | ✅ | ✅ | ✅ Match |
| Swap Request | ✅ | ✅ | ✅ Match |
| Swap Accept/Decline | ✅ | ✅ | ✅ Match |
| Swap Status Messages | ✅ | ✅ | ✅ Match |
| Role Assignment Section | ✅ | ❌ | ✅ Removed (redundant) |

---

## Testing Checklist

### Swap Request Flow
- [ ] Player 1 clicks "SWAP ROLES"
- [ ] Player 2 sees request notification
- [ ] Player 2 sees ACCEPT/DECLINE buttons
- [ ] Player 1 sees "Waiting for opponent..." message
- [ ] Player 1 can cancel request

### Swap Accept
- [ ] Player 2 clicks ACCEPT
- [ ] Positions swap instantly
- [ ] Player 1 becomes Defender
- [ ] Player 2 becomes Attacker
- [ ] Both see updated roles
- [ ] Swap buttons reset

### Swap Decline
- [ ] Player 2 clicks DECLINE
- [ ] Player 1 sees "declined" message
- [ ] No swap occurs
- [ ] Buttons reset to initial state

### Cancel Request
- [ ] Player 1 sends request
- [ ] Player 1 clicks CANCEL REQUEST
- [ ] Request cancelled
- [ ] Player 2 no longer sees request
- [ ] Buttons reset

---

## Files Modified

### Backend
- `backend-server/src/services/lobby-socket.service.ts`
  - Replaced `lobby:swap` with `lobby:swap:request`, `lobby:swap:accept`, `lobby:swap:decline`
  - Added request/accept/decline handlers

### Frontend
- `darknet-duel-frontend/src/services/websocketLobby.service.ts`
  - Added swap callback types
  - Replaced `swapPositions()` with `requestSwap()`, `acceptSwap()`, `declineSwap()`
  - Added event type signatures

- `darknet-duel-frontend/src/components/lobby/WebSocketLobbyDetail.tsx`
  - Added swap request state
  - Added swap event handlers
  - Replaced "Role Assignment" with "YOUR ROLE" section
  - Added request/accept/decline UI
  - Added status messages

---

## Summary

**Before:**
- ❌ No "YOUR ROLE" display
- ❌ Redundant "Role Assignment" section
- ❌ Instant swap (no confirmation)

**After:**
- ✅ "YOUR ROLE" section like public lobby
- ✅ Removed redundant section
- ✅ Swap requires both players to agree
- ✅ Clear status messages
- ✅ Cancel option for requester
- ✅ Accept/Decline options for receiver

The swap system now provides better UX with confirmation and clear communication! 🎉

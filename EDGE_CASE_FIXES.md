# Edge Case Fixes for WebSocket Lobbies

## Issues Fixed

### 1. ✅ Host Disconnection - Immediate Lobby Closure
### 2. ✅ Accidental Tab Close Prevention

---

## Issue 1: Host Disconnection

### The Problem

**Before:**
- Host clicks "Leave Lobby" → Lobby closes immediately ✅
- Host loses connection (network issue, crash, etc.) → Lobby stays open ❌
- Other players stuck in lobby with no host
- Lobby never gets cleaned up

### The Solution

**Immediate Closure on Host Disconnect:**
- When host disconnects, lobby closes **immediately**
- All players notified: "Host has lost connection. Lobby will be destroyed."
- No grace period for host (unlike regular players)

**Grace Period for Non-Host Players:**
- Non-host players get 30-second reconnection grace period
- If they reconnect within 30s, they stay in lobby
- If not, they're removed automatically

### Implementation

**File**: `backend-server/src/services/lobby-socket.service.ts`

```typescript
socket.on('disconnect', async () => {
  const lobbies = this.lobbyManager.getUserLobbies(socket.userId);

  for (const lobby of lobbies) {
    const isHost = lobby.createdBy === socket.userId;

    if (isHost) {
      // Host disconnected - close lobby immediately
      this.lobbyNamespace.to(`lobby:${lobby.lobbyId}`).emit('lobby:closed', {
        lobbyId: lobby.lobbyId,
        reason: 'Host has lost connection. Lobby will be destroyed.'
      });

      await this.lobbyManager.closeLobby(lobby.lobbyId);
    } else {
      // Non-host player - 30 second grace period
      setTimeout(async () => {
        // Check if still disconnected
        const currentLobby = this.lobbyManager.getLobby(lobby.lobbyId);
        const currentPlayer = currentLobby?.players.get(socket.userId);

        if (currentPlayer && currentPlayer.socketId === socket.id) {
          // Still disconnected, remove player
          await this.lobbyManager.leaveLobby(lobby.lobbyId, socket.userId);
          // Notify others...
        }
      }, 30000);
    }
  }
});
```

### Behavior

| User Type | Disconnection | Action | Time |
|-----------|---------------|--------|------|
| **Host** | Network loss, crash, tab close | Lobby closes immediately | 0s |
| **Host** | Clicks "Leave Lobby" | Lobby closes immediately | 0s |
| **Player** | Network loss, crash | Grace period starts | 30s |
| **Player** | Reconnects in time | Stays in lobby | <30s |
| **Player** | Doesn't reconnect | Removed from lobby | 30s |

---

## Issue 2: Accidental Tab Close

### The Problem

**Before:**
- User accidentally closes tab/window
- No warning shown
- Immediately disconnected from lobby
- Host: Lobby destroyed
- Player: Removed after 30s

### The Solution

**Browser Warning on Tab Close:**
- When user tries to close tab/window, browser shows warning
- User must confirm they want to leave
- Prevents accidental disconnections

### Implementation

**File**: `darknet-duel-frontend/src/components/lobby/WebSocketLobbyDetail.tsx`

```typescript
// Prevent accidental tab/window close while in lobby
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // Only show warning if user is in a lobby
    if (lobby) {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue to be set
      return ''; // Some browsers show this message
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [lobby]);
```

### Browser Behavior

**Modern Browsers (Chrome, Firefox, Edge):**
- Show generic warning: "Leave site? Changes you made may not be saved."
- User can choose "Leave" or "Stay"

**Note**: Browsers no longer allow custom messages for security reasons. The warning is generic but effective.

### When Warning Shows

| Scenario | Warning Shown? |
|----------|----------------|
| User in lobby, tries to close tab | ✅ Yes |
| User in lobby, tries to refresh page | ✅ Yes |
| User in lobby, tries to navigate away | ✅ Yes |
| User not in lobby (browsing site) | ❌ No |
| User leaves lobby normally | ❌ No (lobby becomes null) |

---

## Complete Flow Examples

### Example 1: Host Network Failure

```
1. Host and Player in lobby
   ↓
2. Host loses WiFi connection
   ↓
3. Backend detects host disconnect
   ↓
4. Backend emits 'lobby:closed' to all players
   ↓
5. Player sees: "Host has lost connection. Lobby will be destroyed."
   ↓
6. Player redirected to /lobbies after 3s
   ↓
7. Lobby deleted from backend
```

### Example 2: Player Accidental Tab Close

```
1. Player in lobby, tries to close tab
   ↓
2. Browser shows: "Leave site? Changes may not be saved."
   ↓
3a. Player clicks "Stay" → Tab stays open, still in lobby ✅
3b. Player clicks "Leave" → Tab closes, disconnected
   ↓
4. (If left) Backend starts 30s grace period
   ↓
5. (If left) Player removed after 30s if no reconnect
```

### Example 3: Host Accidental Tab Close (Prevented)

```
1. Host in lobby, tries to close tab
   ↓
2. Browser shows: "Leave site? Changes may not be saved."
   ↓
3a. Host clicks "Stay" → Tab stays open, lobby continues ✅
3b. Host clicks "Leave" → Lobby immediately destroyed
   ↓
4. (If left) All players see: "Host has lost connection..."
   ↓
5. (If left) All players redirected to /lobbies
```

---

## Files Modified

### Backend
- ✅ `backend-server/src/services/lobby-socket.service.ts`
  - Updated `disconnect` handler
  - Added host detection logic
  - Immediate closure for host disconnect
  - Grace period for non-host players

### Frontend
- ✅ `darknet-duel-frontend/src/components/lobby/WebSocketLobbyDetail.tsx`
  - Added `beforeunload` event listener
  - Shows browser warning when closing tab
  - Only active when user is in a lobby

---

## Testing Checklist

### Host Disconnection
- [ ] Host clicks "Leave Lobby" → Lobby closes immediately
- [ ] Host closes tab (confirms warning) → Lobby closes immediately
- [ ] Host loses network → Lobby closes immediately
- [ ] Host crashes browser → Lobby closes immediately
- [ ] All players see "Host has lost connection" message
- [ ] All players redirected to /lobbies

### Player Disconnection
- [ ] Player closes tab → Browser shows warning
- [ ] Player clicks "Stay" → Stays in lobby
- [ ] Player clicks "Leave" → 30s grace period starts
- [ ] Player reconnects within 30s → Stays in lobby
- [ ] Player doesn't reconnect → Removed after 30s
- [ ] Host sees "Player left" notification

### Tab Close Warning
- [ ] Warning shows when closing tab while in lobby
- [ ] Warning shows when refreshing page while in lobby
- [ ] Warning shows when navigating away while in lobby
- [ ] No warning when not in lobby
- [ ] No warning after leaving lobby normally

---

## Summary

**Host Disconnection:**
- ✅ Immediate lobby closure (no grace period)
- ✅ All players notified
- ✅ Prevents abandoned lobbies

**Tab Close Prevention:**
- ✅ Browser warning on close/refresh
- ✅ User must confirm
- ✅ Prevents accidental disconnections

Both edge cases are now handled properly! 🎉

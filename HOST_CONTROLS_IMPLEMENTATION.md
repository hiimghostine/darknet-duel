# Host Controls Implementation

## Overview
Added two critical host control features:
1. **Auto-close lobby when host leaves** - All players are kicked back to lobby browser
2. **Host can kick players** - Remove disruptive players with notification

## Features Implemented

### 1. Host Leave = Lobby Close

**Problem**: When the host left, the lobby remained open with no way to start the game.

**Solution**: When the host leaves, the lobby is automatically closed and all remaining players are kicked out.

#### Backend Changes (`lobby-socket.service.ts`)
```typescript
// Check if user is the host
const isHost = lobby.createdBy === socket.userId;

const success = await this.lobbyManager.leaveLobby(lobbyId, socket.userId);

if (success) {
  socket.leave(`lobby:${lobbyId}`);
  socket.emit('lobby:left', { lobbyId });

  // If host left, close the lobby and kick everyone
  if (isHost) {
    console.log(`👑 Host left lobby ${lobbyId}, closing lobby and kicking all players`);
    
    // Notify all remaining players
    this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:closed', {
      lobbyId,
      reason: 'Host has left the lobby'
    });

    // Close the lobby
    this.lobbyManager.closeLobby(lobbyId, 'Host left');
  }
}
```

#### User Experience
1. Host clicks "LEAVE LOBBY"
2. All players see: "Lobby closed: Host has left the lobby"
3. Players are redirected to lobby browser after 3 seconds
4. Lobby is permanently closed

---

### 2. Kick Player Feature

**Problem**: No way for host to remove disruptive or AFK players.

**Solution**: Host sees a kick button next to each non-host player.

#### Backend Changes (`lobby-socket.service.ts`)

Added new `lobby:kick` event handler:

```typescript
socket.on('lobby:kick', async (data: { lobbyId: string; userId: string }) => {
  // Verify requester is the host
  if (lobby.createdBy !== socket.userId) {
    socket.emit('lobby:error', { error: 'Only the host can kick players' });
    return;
  }

  // Can't kick yourself
  if (userId === socket.userId) {
    socket.emit('lobby:error', { error: 'You cannot kick yourself' });
    return;
  }

  // Remove player from lobby
  const success = await this.lobbyManager.leaveLobby(lobbyId, userId);

  if (success) {
    // Notify the kicked player
    this.lobbyNamespace.to(targetPlayer.socketId).emit('lobby:kicked', {
      lobbyId,
      reason: 'You have been kicked by the host'
    });

    // Force disconnect from lobby room
    const kickedSocket = this.lobbyNamespace.sockets.get(targetPlayer.socketId);
    if (kickedSocket) {
      kickedSocket.leave(`lobby:${lobbyId}`);
    }

    // Broadcast to remaining players
    this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:player:left', {
      userId,
      username: targetPlayer.username
    });

    // Send updated lobby state
    const updatedLobby = this.lobbyManager.getLobby(lobbyId);
    if (updatedLobby) {
      this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:updated', {
        lobby: this.lobbyManager.serializeLobby(updatedLobby)
      });
    }

    console.log(`👢 ${targetPlayer.username} kicked from lobby ${lobbyId} by ${socket.username}`);
  }
});
```

#### Frontend Changes

**1. Service (`websocketLobby.service.ts`)**
- Added `LobbyKickedCallback` type
- Added `kickPlayer()` method
- Added `on('lobby:kicked')` event handler

**2. Component (`WebSocketLobbyDetail.tsx`)**
- Added `handleKicked()` event handler
- Added `handleKickPlayer()` method
- Added kick button to player cards (host only)
- Imported `FaUserTimes` icon

**Kick Button UI:**
```tsx
{isHost && !player.isHost && (
  <button
    onClick={() => handleKickPlayer(player.userId)}
    className="px-2 py-1 border border-error/50 bg-error/10 hover:bg-error/20 text-error text-xs font-mono transition-colors"
    title="Kick player"
  >
    <FaUserTimes />
  </button>
)}
```

#### User Experience

**Host View:**
- Sees a red kick button (👤❌) next to each non-host player
- Clicks button to kick player
- Player is immediately removed from lobby

**Kicked Player View:**
- Sees error message: "You have been kicked by the host"
- Automatically redirected to lobby browser after 2 seconds

**Other Players View:**
- See notification: "Player left: [username]"
- Lobby updates with player removed

---

## Visual Examples

### Player Card (Host View)
```
┌──────────────────────────────────────┐
│ 🛡️ PlayerName    ✓    [KICK]        │
│ DEFENDER                              │
└──────────────────────────────────────┘
```

### Player Card (Non-Host View)
```
┌──────────────────────────────────────┐
│ 🛡️ PlayerName    ✓                   │
│ DEFENDER                              │
└──────────────────────────────────────┘
```

### Kicked Player Notification
```
┌────────────────────────────────────────┐
│ ⚠️ You have been kicked by the host   │
│    Redirecting to lobby browser...     │
└────────────────────────────────────────┘
```

### Host Left Notification
```
┌────────────────────────────────────────┐
│ ⚠️ Lobby closed: Host has left the    │
│    lobby. Redirecting...               │
└────────────────────────────────────────┘
```

---

## Security & Validation

### Backend Validation
1. ✅ Only authenticated users can kick
2. ✅ Only the host can kick players
3. ✅ Host cannot kick themselves
4. ✅ Can only kick players actually in the lobby
5. ✅ Kicked player is forcibly disconnected from lobby room

### Frontend Validation
1. ✅ Kick button only visible to host
2. ✅ Kick button only shown for non-host players
3. ✅ Proper error handling for kick failures

---

## Event Flow

### Host Leaves Flow
```
1. Host clicks "LEAVE LOBBY"
   ↓
2. Backend detects host leaving
   ↓
3. Backend emits 'lobby:closed' to all players
   ↓
4. Backend closes lobby in LobbyManager
   ↓
5. All players see "Host has left" message
   ↓
6. All players redirected to lobby browser
```

### Kick Player Flow
```
1. Host clicks kick button
   ↓
2. Frontend emits 'lobby:kick' event
   ↓
3. Backend validates (is host? player exists?)
   ↓
4. Backend removes player from lobby
   ↓
5. Backend emits 'lobby:kicked' to target player
   ↓
6. Backend emits 'lobby:player:left' to others
   ↓
7. Backend emits 'lobby:updated' with new state
   ↓
8. Kicked player sees message & redirects
   ↓
9. Other players see player left notification
```

---

## Files Modified

### Backend
- `backend-server/src/services/lobby-socket.service.ts`
  - Modified `lobby:leave` handler to detect host leaving
  - Added `lobby:kick` event handler

### Frontend
- `darknet-duel-frontend/src/services/websocketLobby.service.ts`
  - Added `LobbyKickedCallback` type
  - Added `kickPlayer()` method
  - Added `on('lobby:kicked')` overload

- `darknet-duel-frontend/src/components/lobby/WebSocketLobbyDetail.tsx`
  - Added `handleKicked()` handler
  - Added `handleKickPlayer()` method
  - Added kick button to player cards
  - Added `FaUserTimes` icon import

---

## Testing Checklist

### Test Scenario 1: Host Leaves
- [ ] Create a lobby as host
- [ ] Have another player join
- [ ] Host clicks "LEAVE LOBBY"
- [ ] **Expected**: Other player sees "Host has left the lobby"
- [ ] **Expected**: Other player redirected to lobby browser
- [ ] **Expected**: Lobby is closed and cannot be rejoined

### Test Scenario 2: Kick Player
- [ ] Create a lobby as host
- [ ] Have another player join
- [ ] Host sees kick button next to player
- [ ] Host clicks kick button
- [ ] **Expected**: Player sees "You have been kicked by the host"
- [ ] **Expected**: Player redirected to lobby browser
- [ ] **Expected**: Host sees player removed from lobby

### Test Scenario 3: Non-Host Cannot Kick
- [ ] Join a lobby as non-host
- [ ] **Expected**: No kick buttons visible
- [ ] Try to manually emit kick event (dev tools)
- [ ] **Expected**: Backend rejects with "Only the host can kick players"

### Test Scenario 4: Host Cannot Kick Self
- [ ] Create a lobby as host
- [ ] Try to kick yourself (if possible)
- [ ] **Expected**: Error or no action

---

## Summary

Both features significantly improve lobby management:

1. **Host Leave = Auto-Close**
   - ✅ Prevents orphaned lobbies
   - ✅ Clear communication to players
   - ✅ Automatic cleanup

2. **Kick Player**
   - ✅ Host has full control
   - ✅ Clear feedback to kicked player
   - ✅ Secure (host-only, validated)
   - ✅ Clean UI integration

The host now has complete control over their lobby! 👑

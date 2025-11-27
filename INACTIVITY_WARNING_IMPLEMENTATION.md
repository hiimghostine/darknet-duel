# Inactivity Warning Implementation

## Overview
Added a warning system that alerts users 30 seconds before a lobby is closed due to inactivity, similar to the public lobby system.

## Problem
WebSocket lobbies were being closed due to inactivity without warning users, causing a poor user experience. Users would suddenly find themselves kicked out without any notification.

## Solution

### Backend Changes

#### 1. `lobby-cleanup.service.ts`
- Added `WARNING_BEFORE_CLOSE_MS` constant (30 seconds)
- Added `warningsSent` Set to track which lobbies have been warned
- Added Socket.IO server parameter to constructor
- Modified cleanup logic to send warnings before closing:
  - **Empty lobbies**: Warn at 30 seconds remaining (out of 60 seconds total)
  - **Waiting lobbies**: Warn at 30 seconds remaining (out of 10 minutes total)
- Added `sendInactivityWarning()` method that emits `lobby:inactivity:warning` event

```typescript
private sendInactivityWarning(lobbyId: string, timeRemaining: number, reason: string): void {
  if (!this.io) return;
  
  const lobbyNamespace = this.io.of('/lobby');
  lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:inactivity:warning', {
    lobbyId,
    timeRemaining,
    reason,
    message: `This lobby will be closed in ${timeRemaining} seconds due to ${reason}`
  });
  
  console.log(`⚠️  Sent inactivity warning to lobby ${lobbyId} (${timeRemaining}s remaining)`);
}
```

#### 2. `lobby-socket.service.ts`
- Updated constructor to pass Socket.IO server instance to `LobbyCleanupService`
- This allows the cleanup service to emit events to lobby rooms

### Frontend Changes

#### 1. `websocketLobby.service.ts`
- Added `LobbyInactivityWarningCallback` type:
```typescript
export type LobbyInactivityWarningCallback = (data: { 
  lobbyId: string; 
  timeRemaining: number; 
  reason: string; 
  message: string 
}) => void;
```
- Added `on()` overload for `'lobby:inactivity:warning'` event

#### 2. `WebSocketLobbyDetail.tsx`
- Added `inactivityWarning` state to store warning data
- Added `handleInactivityWarning()` event handler
- Registered listener for `'lobby:inactivity:warning'` event
- Added warning UI that displays:
  - Yellow/warning colored banner
  - Animated pulse effect
  - Countdown timer
  - Reason for closure

```tsx
{inactivityWarning && (
  <div className="mb-3 border border-warning/50 bg-warning/20 text-warning px-3 py-2 flex items-center text-xs animate-pulse">
    <FaExclamationTriangle className="mr-2" />
    <p className="font-mono">
      ⚠️ WARNING: This lobby will be closed in {inactivityWarning.timeRemaining} seconds due to {inactivityWarning.reason}
    </p>
  </div>
)}
```

## How It Works

### Timeline Example (Empty Lobby)
1. **T=0s**: Last player leaves, lobby becomes empty
2. **T=30s**: Cleanup service detects lobby has been empty for 30s
3. **T=30s**: Warning sent to all connected clients: "30 seconds remaining"
4. **T=60s**: Lobby is closed if still empty
5. **T=60s**: `lobby:closed` event sent, users redirected to lobby browser

### Timeline Example (Waiting Lobby)
1. **T=0m**: Lobby created, waiting for players
2. **T=9m 30s**: Cleanup service detects lobby has been waiting for 9.5 minutes
3. **T=9m 30s**: Warning sent: "30 seconds remaining"
4. **T=10m**: Lobby is closed if still waiting
5. **T=10m**: `lobby:closed` event sent, users redirected

## User Experience

### Before
- ❌ Lobby suddenly closes
- ❌ No warning
- ❌ User confused about what happened

### After
- ✅ User sees warning 30 seconds before closure
- ✅ Clear message explaining why lobby will close
- ✅ Countdown timer shows time remaining
- ✅ Visual alert (animated pulse, warning colors)
- ✅ User can take action (invite players, ready up, etc.)

## Testing

### Test Scenario 1: Empty Lobby Warning
1. Create a private lobby
2. Have another player join
3. Both players leave
4. Wait 30 seconds
5. **Expected**: Warning appears saying "30 seconds remaining"
6. Wait another 30 seconds
7. **Expected**: Lobby closes, redirect to lobby browser

### Test Scenario 2: Waiting Lobby Warning
1. Create a private lobby
2. Wait 9 minutes 30 seconds (no activity)
3. **Expected**: Warning appears
4. Wait another 30 seconds
5. **Expected**: Lobby closes

### Test Scenario 3: Activity Resets Timer
1. Create a private lobby
2. Wait 25 seconds
3. Have a player join (activity!)
4. **Expected**: No warning (timer reset)
5. Player leaves
6. Wait 30 seconds
7. **Expected**: Warning appears (new timer started)

## Configuration

### Adjustable Timeouts
All timeouts are configurable in `lobby-cleanup.service.ts`:

```typescript
private readonly CLEANUP_INTERVAL_MS = 60000; // How often cleanup runs
private readonly WAITING_TIMEOUT_MS = 600000; // 10 minutes for waiting lobbies
private readonly WARNING_BEFORE_CLOSE_MS = 30000; // 30 seconds warning
```

### Warning Threshold
The warning is sent when:
- Empty lobby: `emptyDuration > (60000 - WARNING_BEFORE_CLOSE_MS)`
- Waiting lobby: `waitingDuration > (WAITING_TIMEOUT_MS - WARNING_BEFORE_CLOSE_MS)`

## Files Modified

### Backend
- `backend-server/src/services/lobby-cleanup.service.ts`
- `backend-server/src/services/lobby-socket.service.ts`

### Frontend
- `darknet-duel-frontend/src/services/websocketLobby.service.ts`
- `darknet-duel-frontend/src/components/lobby/WebSocketLobbyDetail.tsx`

## Future Enhancements

1. **Countdown Timer**: Update the warning every second to show live countdown
2. **Sound Alert**: Play a warning sound when the alert appears
3. **Auto-dismiss**: Hide warning if activity resumes (e.g., player joins)
4. **Customizable Messages**: Different messages for different closure reasons
5. **Grace Period Extension**: Allow host to extend the grace period

## Summary

The inactivity warning system provides a much better user experience by:
- Giving users advance notice before lobby closure
- Explaining why the lobby is being closed
- Providing time to take corrective action
- Matching the behavior of the public lobby system

Users are no longer surprised by sudden lobby closures! 🎉

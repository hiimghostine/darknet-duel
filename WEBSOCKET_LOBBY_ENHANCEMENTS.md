# WebSocket Lobby Enhancements

## Overview
Three major enhancements to match public lobby functionality:
1. **Role Swapping** - Host can swap Attacker ↔ Defender positions
2. **Per-Lobby Chat** - Real-time chat for each WebSocket lobby
3. **UI Redesign** - Match the public lobby's layout and style

## Status

### ✅ Completed
1. **Backend Role Swap** - `lobby:swap` event handler implemented
2. **Frontend Role Swap Service** - `swapPositions()` method added
3. **Frontend Role Swap Handler** - `handleSwapPositions()` added

### 🚧 To Complete
1. **Add Swap Button to UI** - Need to add button next to player list
2. **Add LobbyChat Component** - Need to integrate chat into layout
3. **Redesign Layout** - Split screen: lobby info (left) + chat (right)

---

## Implementation Guide

### 1. Role Swap Button Placement

Add this button in the player section, visible only to host when 2 players are present:

```tsx
{/* Add after player list, before action buttons */}
{isHost && lobby.players.length === 2 && (
  <div className="mt-4">
    <button
      onClick={handleSwapPositions}
      className="w-full px-4 py-2 border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-sm transition-colors flex items-center justify-center gap-2"
    >
      <FaSync />
      SWAP POSITIONS
    </button>
  </div>
)}
```

### 2. Layout Redesign

Change the main return structure to match public lobby (split layout):

```tsx
return (
  <div className="container mx-auto p-4">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* LEFT: Lobby Details (2/3 width on large screens) */}
      <div className="lg:col-span-2">
        <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
          <div className="bg-base-200 border border-primary/20 p-6 relative">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-mono text-primary font-bold flex items-center">
                  <FaLock className="mr-2" />
                  {lobby.name}
                </h2>
                <div className="text-sm font-mono text-primary/70">
                  {lobby.state.toUpperCase()}
                </div>
              </div>
              
              {/* Lobby Code */}
              <div className="flex items-center gap-2 mb-4">
                <div className="text-sm font-mono text-primary/70">LOBBY CODE:</div>
                <div className="text-lg font-mono text-primary font-bold">{lobby.lobbyCode}</div>
                <button
                  onClick={handleCopyLobbyCode}
                  className="px-2 py-1 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-mono transition-colors"
                >
                  <FaCopy className="inline mr-1" />
                  {copied ? 'COPIED!' : 'COPY'}
                </button>
              </div>

              {/* Warnings/Errors */}
              {error && (
                <div className="mb-3 border border-error/50 bg-error/20 text-error px-3 py-2 flex items-center text-xs">
                  <FaExclamationTriangle className="mr-2 animate-pulse" />
                  <p className="font-mono">{error}</p>
                </div>
              )}

              {inactivityWarning && (
                <div className="mb-3 border border-warning/50 bg-warning/20 text-warning px-3 py-2 flex items-center text-xs animate-pulse">
                  <FaExclamationTriangle className="mr-2" />
                  <p className="font-mono">
                    ⚠️ WARNING: This lobby will be closed in {inactivityWarning.timeRemaining} seconds due to {inactivityWarning.reason}
                  </p>
                </div>
              )}
            </div>

            {/* Players */}
            <div className="mb-6">
              <h3 className="text-sm font-mono text-primary font-bold mb-3">
                OPERATIVES ({lobby.players.length}/{lobby.maxPlayers})
              </h3>
              
              <div className="grid md:grid-cols-2 gap-3">
                {lobby.players.map((player, index) => (
                  <div
                    key={player.userId}
                    className={`border p-3 ${
                      player.isHost
                        ? 'border-accent/50 bg-accent/10'
                        : 'border-primary/30 bg-base-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {index === 0 ? (
                          <FaUserSecret className="text-accent mr-2" />
                        ) : (
                          <FaShieldAlt className="text-secondary mr-2" />
                        )}
                        <span className="font-mono text-sm font-bold">
                          {player.username}
                        </span>
                        {player.isHost && (
                          <span className="ml-2 text-xs text-accent font-mono">[HOST]</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {player.isHost ? (
                          <div className="flex items-center gap-1">
                            <FaCheck className="text-success" />
                            <span className="text-xs text-success/70 font-mono">(AUTO)</span>
                          </div>
                        ) : player.isReady ? (
                          <FaCheck className="text-success" />
                        ) : (
                          <FaTimes className="text-error/50" />
                        )}
                        
                        {isHost && !player.isHost && (
                          <button
                            onClick={() => handleKickPlayer(player.userId)}
                            className="px-2 py-1 border border-error/50 bg-error/10 hover:bg-error/20 text-error text-xs font-mono transition-colors"
                            title="Kick player"
                          >
                            <FaUserTimes />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs font-mono text-primary/60">
                      {index === 0 ? 'ATTACKER' : 'DEFENDER'}
                    </div>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: lobby.maxPlayers - lobby.players.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="border border-primary/20 border-dashed p-3 bg-base-900/40"
                  >
                    <div className="flex items-center text-primary/40">
                      <FaUserSecret className="mr-2" />
                      <span className="font-mono text-sm">Waiting for player...</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Swap Button */}
              {isHost && lobby.players.length === 2 && (
                <div className="mt-4">
                  <button
                    onClick={handleSwapPositions}
                    className="w-full px-4 py-2 border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <FaSync />
                    SWAP POSITIONS
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-primary/20">
              <button
                onClick={handleLeaveLobby}
                className="px-4 py-2 border border-error/50 bg-error/10 hover:bg-error/20 text-error font-mono text-sm transition-colors"
              >
                <FaDoorOpen className="inline mr-2" />
                LEAVE LOBBY
              </button>

              <div className="flex gap-2">
                {!isHost && (
                  <button
                    onClick={handleToggleReady}
                    className={`px-4 py-2 border font-mono text-sm transition-colors ${
                      isReady
                        ? 'border-success/50 bg-success/20 text-success hover:bg-success/30'
                        : 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {isReady ? (
                      <>
                        <FaCheck className="inline mr-2" />
                        READY
                      </>
                    ) : (
                      <>
                        <FaTimes className="inline mr-2" />
                        NOT READY
                      </>
                    )}
                  </button>
                )}

                {isHost && (
                  <button
                    onClick={handleStartGame}
                    disabled={!allPlayersReady}
                    className={`px-4 py-2 border font-mono text-sm transition-colors ${
                      allPlayersReady
                        ? 'border-success/50 bg-success/20 text-success hover:bg-success/30'
                        : 'border-primary/30 bg-primary/10 text-primary/50 cursor-not-allowed'
                    }`}
                  >
                    <FaPlay className="inline mr-2" />
                    START GAME
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Chat (1/3 width on large screens) */}
      <div className="lg:col-span-1">
        <LobbyChat matchID={lobbyId} />
      </div>
    </div>
  </div>
);
```

---

## Backend Implementation (✅ Complete)

### lobby-socket.service.ts

```typescript
// Swap player positions (host only)
socket.on('lobby:swap', async (data: { lobbyId: string }) => {
  try {
    if (!socket.userId) {
      socket.emit('lobby:error', { error: 'Not authenticated' });
      return;
    }

    const { lobbyId } = data;
    const lobby = this.lobbyManager.getLobby(lobbyId);

    if (!lobby) {
      socket.emit('lobby:error', { error: 'Lobby not found' });
      return;
    }

    // Verify requester is the host
    if (lobby.createdBy !== socket.userId) {
      socket.emit('lobby:error', { error: 'Only the host can swap positions' });
      return;
    }

    // Need exactly 2 players to swap
    if (lobby.players.size !== 2) {
      socket.emit('lobby:error', { error: 'Need exactly 2 players to swap positions' });
      return;
    }

    // Swap the players in the map (reverse the order)
    const playersArray = Array.from(lobby.players.entries());
    lobby.players.clear();
    
    // Add in reverse order
    lobby.players.set(playersArray[1][0], playersArray[1][1]);
    lobby.players.set(playersArray[0][0], playersArray[0][1]);

    lobby.lastActivity = Date.now();

    // Broadcast updated lobby state
    this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:updated', {
      lobby: this.lobbyManager.serializeLobby(lobby)
    });

    console.log(`🔄 Positions swapped in lobby ${lobbyId}`);
  } catch (error) {
    console.error('❌ Error swapping positions:', error);
    socket.emit('lobby:error', { error: 'Failed to swap positions' });
  }
});
```

---

## Frontend Service (✅ Complete)

### websocketLobby.service.ts

```typescript
/**
 * Swap player positions (host only)
 */
swapPositions(lobbyId: string): void {
  if (!this.socket) {
    console.error('Not connected to lobby server');
    return;
  }

  this.socket.emit('lobby:swap', { lobbyId });
}
```

---

## Chat Integration

The `LobbyChat` component already exists and works with `matchID`. For WebSocket lobbies, pass the `lobbyId` as the `matchID`:

```tsx
<LobbyChat matchID={lobbyId} />
```

This will create a separate chat room for each WebSocket lobby, just like public lobbies.

---

## Testing Checklist

### Role Swap
- [ ] Create lobby as host
- [ ] Have another player join
- [ ] Host sees "SWAP POSITIONS" button
- [ ] Host clicks swap button
- [ ] **Expected**: Attacker becomes Defender, Defender becomes Attacker
- [ ] **Expected**: All players see the swap happen in real-time

### Chat
- [ ] Create lobby
- [ ] Have another player join
- [ ] Both players see chat panel on the right
- [ ] Send messages from both sides
- [ ] **Expected**: Messages appear in real-time for both players
- [ ] **Expected**: Chat history persists during the lobby session

### Layout
- [ ] View on desktop (large screen)
- [ ] **Expected**: Lobby details (left 2/3) + Chat (right 1/3)
- [ ] View on mobile (small screen)
- [ ] **Expected**: Stacked layout (lobby details on top, chat below)

---

## Files Modified

### Backend
- ✅ `backend-server/src/services/lobby-socket.service.ts` - Added `lobby:swap` handler

### Frontend
- ✅ `darknet-duel-frontend/src/services/websocketLobby.service.ts` - Added `swapPositions()` method
- 🚧 `darknet-duel-frontend/src/components/lobby/WebSocketLobbyDetail.tsx` - Need to:
  - Add swap button
  - Integrate LobbyChat
  - Redesign layout to split screen

---

## Summary

**Completed:**
- ✅ Backend swap functionality
- ✅ Frontend swap service method
- ✅ Frontend swap handler

**To Do:**
- 🚧 Add swap button to UI (when 2 players present)
- 🚧 Integrate LobbyChat component
- 🚧 Redesign layout to match public lobby (split screen)

The backend and service layer are ready. Just need to update the UI component with the new layout!

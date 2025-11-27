# Lobby System Tests

Comprehensive test suite for the WebSocket-based lobby system.

## Setup

Install Jest and TypeScript types:

```bash
npm install --save-dev jest @types/jest ts-jest
```

Configure Jest by creating `jest.config.js` in the backend-server root:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- lobby.test.ts

# Run in watch mode
npm test -- --watch
```

## Test Coverage

### Test Categories

1. **Lobby Creation** (3 tests)
   - Create private lobby
   - Create public lobby
   - Lobby code uniqueness

2. **Joining Lobbies** (7 tests)
   - Host can join their own lobby
   - Second player can join active lobby
   - **Cannot join empty private lobby (CORE REQUIREMENT)**
   - Can join empty public lobby
   - Cannot join full lobby
   - Cannot join same lobby twice
   - Cannot join closed lobby

3. **Race Conditions** (2 tests)
   - Concurrent joins to last slot
   - Concurrent ready status updates

4. **Lobby Cleanup** (3 tests)
   - Lobby auto-closes after 60s empty
   - Waiting lobby times out after 10 minutes
   - Active lobby is not cleaned up

5. **Ready Status** (2 tests)
   - Update ready status
   - Cannot update ready status for non-existent player

6. **Game Start** (3 tests)
   - Host can start game when all ready
   - Non-host cannot start game
   - Cannot start game when not all ready

7. **Lobby Queries** (4 tests)
   - Get lobby by ID
   - Get lobby by code
   - Get user lobbies
   - Serialize lobby

**Total: 24 tests**

## Key Test Cases

### Empty Lobby Prevention (Critical)

```typescript
test('Cannot join empty private lobby (CORE REQUIREMENT)', async () => {
  const lobby = await lobbyManager.createLobby({...});
  
  // Host joins then leaves
  await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');
  await lobbyManager.leaveLobby(lobby.lobbyId, 'host-user');
  
  // Another player tries to join empty lobby
  const result = await lobbyManager.joinLobby(
    lobby.lobbyId,
    'player-2',
    'Player2',
    'socket-2'
  );
  
  expect(result.allowed).toBe(false);
  expect(result.reason).toBe('LOBBY_EMPTY');
});
```

### Race Condition Handling

```typescript
test('Concurrent joins to last slot', async () => {
  const lobby = await lobbyManager.createLobby({...});
  await lobbyManager.joinLobby(lobby.lobbyId, 'player-1', 'Player1', 'socket-1');
  
  // Two players try to join the last slot simultaneously
  const [result1, result2] = await Promise.all([
    lobbyManager.joinLobby(lobby.lobbyId, 'player-2', 'Player2', 'socket-2'),
    lobbyManager.joinLobby(lobby.lobbyId, 'player-3', 'Player3', 'socket-3')
  ]);
  
  // Exactly one should succeed
  expect(result1.allowed || result2.allowed).toBe(true);
  expect(result1.allowed && result2.allowed).toBe(false);
});
```

### Cleanup Service

```typescript
test('Lobby auto-closes after 60s empty', async () => {
  const lobby = await lobbyManager.createLobby({...});
  
  await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');
  await lobbyManager.leaveLobby(lobby.lobbyId, 'host-user');
  
  // Wait 61 seconds
  await sleep(61000);
  
  // Lobby should be closed
  const currentLobby = lobbyManager.getLobby(lobby.lobbyId);
  expect(currentLobby).toBeNull();
}, 65000); // 65 second timeout
```

## Notes

- The "Lobby auto-closes after 60s empty" test has a 65-second timeout
- Tests use in-memory lobby manager (no database required)
- Cleanup service is stopped after each test to prevent interference
- All tests are isolated and can run in any order

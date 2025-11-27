/**
 * Lobby System Tests
 * 
 * Comprehensive test suite for WebSocket-based lobby system
 * Tests cover: creation, joining, empty lobby prevention, race conditions, cleanup
 */

import { LobbyManager } from '../src/services/lobby-manager.service';
import { LobbyCleanupService } from '../src/services/lobby-cleanup.service';
import { LobbyVisibility, LobbyState } from '../src/types/lobby.types';

// Helper function to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Lobby System', () => {
  let lobbyManager: LobbyManager;
  let cleanupService: LobbyCleanupService;

  beforeEach(() => {
    lobbyManager = new LobbyManager();
    cleanupService = new LobbyCleanupService(lobbyManager);
  });

  afterEach(() => {
    cleanupService.stop();
  });

  describe('Lobby Creation', () => {
    test('Create private lobby', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'user-123',
        gameSettings: {
          gameMode: 'standard',
          initialResources: 100,
          maxTurns: 50
        }
      });

      expect(lobby.lobbyId).toBeDefined();
      expect(lobby.lobbyCode).toHaveLength(6);
      expect(lobby.name).toBe('Test Lobby');
      expect(lobby.visibility).toBe(LobbyVisibility.PRIVATE);
      expect(lobby.maxPlayers).toBe(2);
      expect(lobby.createdBy).toBe('user-123');
      expect(lobby.state).toBe(LobbyState.WAITING);
      expect(lobby.players.size).toBe(0);
    });

    test('Create public lobby', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Public Test',
        visibility: LobbyVisibility.PUBLIC,
        maxPlayers: 4,
        createdBy: 'user-456',
        gameSettings: {
          gameMode: 'blitz',
          initialResources: 50,
          maxTurns: 30
        }
      });

      expect(lobby.visibility).toBe(LobbyVisibility.PUBLIC);
      expect(lobby.maxPlayers).toBe(4);
    });

    test('Lobby code is unique', async () => {
      const lobby1 = await lobbyManager.createLobby({
        name: 'Lobby 1',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'user-1',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      const lobby2 = await lobbyManager.createLobby({
        name: 'Lobby 2',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'user-2',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      expect(lobby1.lobbyCode).not.toBe(lobby2.lobbyCode);
    });
  });

  describe('Joining Lobbies', () => {
    test('Host can join their own lobby', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      const result = await lobbyManager.joinLobby(
        lobby.lobbyId,
        'host-user',
        'HostPlayer',
        'socket-123'
      );

      expect(result.allowed).toBe(true);
      expect(result.lobby).toBeDefined();
      expect(result.lobby?.players.size).toBe(1);
      expect(result.lobby?.state).toBe(LobbyState.ACTIVE);

      const player = result.lobby?.players.get('host-user');
      expect(player?.isHost).toBe(true);
      expect(player?.username).toBe('HostPlayer');
    });

    test('Second player can join active lobby', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      // Host joins
      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');

      // Second player joins
      const result = await lobbyManager.joinLobby(
        lobby.lobbyId,
        'player-2',
        'Player2',
        'socket-2'
      );

      expect(result.allowed).toBe(true);
      expect(result.lobby?.players.size).toBe(2);
      expect(result.lobby?.state).toBe(LobbyState.FULL);

      const player2 = result.lobby?.players.get('player-2');
      expect(player2?.isHost).toBe(false);
    });

    test('Cannot join empty private lobby (CORE REQUIREMENT)', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

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

    test('Can join empty public lobby', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Public Lobby',
        visibility: LobbyVisibility.PUBLIC,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      // Host joins then leaves
      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');
      await lobbyManager.leaveLobby(lobby.lobbyId, 'host-user');

      // Another player can join empty public lobby
      const result = await lobbyManager.joinLobby(
        lobby.lobbyId,
        'player-2',
        'Player2',
        'socket-2'
      );

      expect(result.allowed).toBe(true);
    });

    test('Cannot join full lobby', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-host');
      await lobbyManager.joinLobby(lobby.lobbyId, 'player-1', 'Player1', 'socket-1');

      // Third player tries to join full lobby
      const result = await lobbyManager.joinLobby(
        lobby.lobbyId,
        'player-2',
        'Player2',
        'socket-2'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('LOBBY_FULL');
    });

    test('Cannot join same lobby twice', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');

      // Same player (host) tries to join again
      const result = await lobbyManager.joinLobby(
        lobby.lobbyId,
        'host-user',
        'Host',
        'socket-2'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('ALREADY_IN_LOBBY');
    });

    test('Cannot join closed lobby', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      lobbyManager.closeLobby(lobby.lobbyId, 'Test closure');

      const result = await lobbyManager.joinLobby(
        lobby.lobbyId,
        'player-1',
        'Player1',
        'socket-1'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('LOBBY_CLOSED');
    });
  });

  describe('Race Conditions', () => {
    test('Concurrent joins to last slot', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      // Host joins first (required for private lobbies)
      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-host');

      // Two players try to join the last slot simultaneously
      const [result1, result2] = await Promise.all([
        lobbyManager.joinLobby(lobby.lobbyId, 'player-1', 'Player1', 'socket-1'),
        lobbyManager.joinLobby(lobby.lobbyId, 'player-2', 'Player2', 'socket-2')
      ]);

      // Exactly one should succeed
      expect(result1.allowed || result2.allowed).toBe(true);
      expect(result1.allowed && result2.allowed).toBe(false);

      // The one that failed should have LOBBY_FULL reason
      const failedResult = result1.allowed ? result2 : result1;
      expect(failedResult.reason).toBe('LOBBY_FULL');

      // Verify lobby is full (host + 1 player)
      const finalLobby = lobbyManager.getLobby(lobby.lobbyId);
      expect(finalLobby?.players.size).toBe(2);
      expect(finalLobby?.state).toBe(LobbyState.FULL);
    });

    test('Concurrent ready status updates', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');

      // Multiple rapid ready toggles
      await Promise.all([
        lobbyManager.updateReadyStatus(lobby.lobbyId, 'host-user', true),
        lobbyManager.updateReadyStatus(lobby.lobbyId, 'host-user', false),
        lobbyManager.updateReadyStatus(lobby.lobbyId, 'host-user', true)
      ]);

      // Should complete without errors
      const finalLobby = lobbyManager.getLobby(lobby.lobbyId);
      expect(finalLobby).toBeDefined();
    });
  });

  describe('Lobby Cleanup', () => {
    test('Lobby auto-closes after 60s empty', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      // Join then leave
      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');
      await lobbyManager.leaveLobby(lobby.lobbyId, 'host-user');

      // Verify lobby is in EMPTY state
      let currentLobby = lobbyManager.getLobby(lobby.lobbyId);
      expect(currentLobby?.state).toBe(LobbyState.EMPTY);

      // Wait 61 seconds
      await sleep(61000);

      // Lobby should be closed
      currentLobby = lobbyManager.getLobby(lobby.lobbyId);
      expect(currentLobby).toBeNull();
    }, 65000); // 65 second timeout for this test

    test('Waiting lobby times out after 10 minutes', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      // Manually set lastActivity to 11 minutes ago
      const lobbyObj = lobbyManager.getLobby(lobby.lobbyId);
      if (lobbyObj) {
        lobbyObj.lastActivity = Date.now() - (11 * 60 * 1000);
      }

      // Run cleanup
      cleanupService.start();
      await sleep(1000); // Wait for cleanup to run

      // Lobby should be closed
      const currentLobby = lobbyManager.getLobby(lobby.lobbyId);
      expect(currentLobby).toBeNull();
    });

    test('Active lobby is not cleaned up', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');

      // Run cleanup
      cleanupService.start();
      await sleep(1000);

      // Lobby should still exist
      const currentLobby = lobbyManager.getLobby(lobby.lobbyId);
      expect(currentLobby).toBeDefined();
      expect(currentLobby?.state).toBe(LobbyState.ACTIVE);
    });
  });

  describe('Ready Status', () => {
    test('Update ready status', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');

      const success = await lobbyManager.updateReadyStatus(lobby.lobbyId, 'host-user', true);
      expect(success).toBe(true);

      const currentLobby = lobbyManager.getLobby(lobby.lobbyId);
      const player = currentLobby?.players.get('host-user');
      expect(player?.isReady).toBe(true);
    });

    test('Cannot update ready status for non-existent player', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      const success = await lobbyManager.updateReadyStatus(lobby.lobbyId, 'non-existent', true);
      expect(success).toBe(false);
    });
  });

  describe('Game Start', () => {
    test('Host can start game when all ready', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');
      await lobbyManager.joinLobby(lobby.lobbyId, 'player-2', 'Player2', 'socket-2');

      await lobbyManager.updateReadyStatus(lobby.lobbyId, 'host-user', true);
      await lobbyManager.updateReadyStatus(lobby.lobbyId, 'player-2', true);

      const success = await lobbyManager.startGame(lobby.lobbyId, 'host-user');
      expect(success).toBe(true);

      const currentLobby = lobbyManager.getLobby(lobby.lobbyId);
      expect(currentLobby?.state).toBe(LobbyState.STARTING);
    });

    test('Non-host cannot start game', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');
      await lobbyManager.joinLobby(lobby.lobbyId, 'player-2', 'Player2', 'socket-2');

      await lobbyManager.updateReadyStatus(lobby.lobbyId, 'host-user', true);
      await lobbyManager.updateReadyStatus(lobby.lobbyId, 'player-2', true);

      const success = await lobbyManager.startGame(lobby.lobbyId, 'player-2');
      expect(success).toBe(false);
    });

    test('Host can start game without being ready', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');
      await lobbyManager.joinLobby(lobby.lobbyId, 'player-2', 'Player2', 'socket-2');

      // Host is NOT ready, but player-2 is ready
      await lobbyManager.updateReadyStatus(lobby.lobbyId, 'player-2', true);

      const success = await lobbyManager.startGame(lobby.lobbyId, 'host-user');
      expect(success).toBe(true);

      const currentLobby = lobbyManager.getLobby(lobby.lobbyId);
      expect(currentLobby?.state).toBe(LobbyState.STARTING);
    });

    test('Cannot start game when not all non-host players ready', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');
      await lobbyManager.joinLobby(lobby.lobbyId, 'player-2', 'Player2', 'socket-2');

      // Host doesn't need to be ready, but player-2 is not ready
      // player-2 is not ready

      const success = await lobbyManager.startGame(lobby.lobbyId, 'host-user');
      expect(success).toBe(false);
    });
  });

  describe('Lobby Queries', () => {
    test('Get lobby by ID', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      const retrieved = lobbyManager.getLobby(lobby.lobbyId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.lobbyId).toBe(lobby.lobbyId);
    });

    test('Get lobby by code', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      const retrieved = lobbyManager.getLobbyByCode(lobby.lobbyCode);
      expect(retrieved).toBeDefined();
      expect(retrieved?.lobbyCode).toBe(lobby.lobbyCode);
    });

    test('Get user lobbies', async () => {
      const lobby1 = await lobbyManager.createLobby({
        name: 'Lobby 1',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'user-1',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      const lobby2 = await lobbyManager.createLobby({
        name: 'Lobby 2',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'user-2',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      // user-1 joins their own lobby
      await lobbyManager.joinLobby(lobby1.lobbyId, 'user-1', 'User1', 'socket-1');
      
      // user-2 joins their lobby first, then user-1 can join
      await lobbyManager.joinLobby(lobby2.lobbyId, 'user-2', 'User2', 'socket-host');
      await lobbyManager.joinLobby(lobby2.lobbyId, 'user-1', 'User1', 'socket-2');

      const userLobbies = lobbyManager.getUserLobbies('user-1');
      expect(userLobbies).toHaveLength(2);
      expect(userLobbies.map(l => l.lobbyId)).toContain(lobby1.lobbyId);
      expect(userLobbies.map(l => l.lobbyId)).toContain(lobby2.lobbyId);
    });

    test('Serialize lobby', async () => {
      const lobby = await lobbyManager.createLobby({
        name: 'Test Lobby',
        visibility: LobbyVisibility.PRIVATE,
        maxPlayers: 2,
        createdBy: 'host-user',
        gameSettings: { gameMode: 'standard', initialResources: 100, maxTurns: 50 }
      });

      await lobbyManager.joinLobby(lobby.lobbyId, 'host-user', 'Host', 'socket-1');

      const serialized = lobbyManager.serializeLobby(lobby);
      
      expect(serialized.lobbyId).toBe(lobby.lobbyId);
      expect(serialized.players).toBeInstanceOf(Array);
      expect(serialized.players).toHaveLength(1);
      expect(serialized.players[0].username).toBe('Host');
    });
  });
});

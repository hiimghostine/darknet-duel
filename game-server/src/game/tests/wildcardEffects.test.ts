import { TemporaryEffectsManager } from '../actions/temporaryEffectsManager';
import { WildcardResolver, WildcardPlayContext } from '../actions/wildcardResolver';

// Required Jest types
declare const describe: any;
declare const test: any;
declare const expect: any;
declare const beforeEach: any;

// Import types from the actual project paths
type GameState = any;
type InfrastructureState = 'secure' | 'vulnerable' | 'compromised';
type Card = any;
type PlayerRole = 'attacker' | 'defender';

describe('Wildcard Effects', () => {
  let mockGameState: GameState;
  let mockCard: Card;

  beforeEach(() => {
    // Set up a mock game state with minimal required properties
    mockGameState = {
      temporaryEffects: [],
      infrastructure: [
        {
          id: 'infra1',
          name: 'Test Infrastructure 1',
          state: 'secure' as InfrastructureState,
          vulnerabilities: ['network'],
          type: 'user'
        },
        {
          id: 'infra2',
          name: 'Test Infrastructure 2',
          state: 'vulnerable' as InfrastructureState,
          vulnerabilities: ['web'],
          type: 'server'
        }
      ],
      attacker: {
        id: 'attacker-id',
        name: 'Attacker',
        hand: [],
        discard: [],
        actionPoints: 3
      },
      defender: {
        id: 'defender-id',
        name: 'Defender',
        hand: [],
        discard: [],
        actionPoints: 3
      },
      actions: [],
      gameConfig: { maxActionPoints: 5, maxTurns: 20 },
      currentTurn: 'attacker'
    } as unknown as GameState;

    // Set up a mock wildcard card
    mockCard = {
      id: 'A301',
      name: 'Advanced Persistent Threat',
      cost: 2,
      type: 'wildcard',
      wildcardType: ['attack', 'exploit'],
      specialEffect: 'prevent_reactions'
    } as Card;
  });

  describe('TemporaryEffectsManager', () => {
    test('should add a temporary effect', () => {
      const updatedState = TemporaryEffectsManager.addEffect(mockGameState, {
        type: 'prevent_reactions',
        targetId: 'infra1',
        playerId: 'attacker-id',
        duration: 2,
        sourceCardId: 'A301'
      });

      expect(updatedState.temporaryEffects).toHaveLength(1);
      expect(updatedState.temporaryEffects[0].type).toBe('prevent_reactions');
      expect(updatedState.temporaryEffects[0].targetId).toBe('infra1');
    });

    test('should check if an effect exists', () => {
      // Add an effect first
      const updatedState = TemporaryEffectsManager.addEffect(mockGameState, {
        type: 'prevent_restore',
        targetId: 'infra2',
        playerId: 'attacker-id',
        duration: 1,
        sourceCardId: 'A304'
      });

      // Check if the effect exists
      const effectExists = TemporaryEffectsManager.hasEffect(updatedState, 'prevent_restore', 'infra2');
      expect(effectExists).toBe(true);
    });

    test('should process turn start and decrement durations', () => {
      // Add two effects with different durations
      let updatedState = TemporaryEffectsManager.addEffect(mockGameState, {
        type: 'prevent_reactions',
        targetId: 'infra1',
        playerId: 'attacker-id',
        duration: 1,
        sourceCardId: 'A301'
      });
      updatedState = TemporaryEffectsManager.addEffect(updatedState, {
        type: 'prevent_restore',
        targetId: 'infra2',
        playerId: 'attacker-id',
        duration: 2,
        sourceCardId: 'A304'
      });

      // Process turn start
      const afterTurnState = TemporaryEffectsManager.processTurnStart(updatedState);

      // One effect should have expired
      expect(afterTurnState.temporaryEffects).toHaveLength(1);
      expect(afterTurnState.temporaryEffects[0].type).toBe('prevent_restore');
      expect(afterTurnState.temporaryEffects[0].duration).toBe(1);
    });
  });

  describe('WildcardResolver', () => {
    test('should apply A301 effect (Advanced Persistent Threat)', () => {
      const mockContext = {
        gameState: mockGameState,
        playerID: 'attacker-id',
        playerRole: 'attacker' as PlayerRole,
        targetInfrastructure: mockGameState.infrastructure![0],
        card: mockCard
      };

      const updatedState = WildcardResolver.applyWildcardEffects(mockCard, mockContext);

      expect(updatedState.temporaryEffects).toHaveLength(1);
      expect(updatedState.temporaryEffects[0].type).toBe('prevent_reactions');
      expect(updatedState.temporaryEffects[0].targetId).toBe('infra1');
      expect(updatedState.message).toContain('prevents reactions');
    });

    test('should apply A304 effect (Privilege Escalation)', () => {
      const privilegeEscalationCard = {
        ...mockCard,
        id: 'A304',
        name: 'Privilege Escalation',
        specialEffect: 'prevent_restore'
      };

      const mockContext = {
        gameState: mockGameState,
        playerID: 'attacker-id',
        playerRole: 'attacker' as PlayerRole,
        targetInfrastructure: mockGameState.infrastructure![1],
        card: privilegeEscalationCard
      };

      const updatedState = WildcardResolver.applyWildcardEffects(privilegeEscalationCard, mockContext);

      expect(updatedState.temporaryEffects).toHaveLength(1);
      expect(updatedState.temporaryEffects[0].type).toBe('prevent_restore');
      expect(updatedState.temporaryEffects[0].targetId).toBe('infra2');
      expect(updatedState.message).toContain('prevents restoration');
    });
  });
});

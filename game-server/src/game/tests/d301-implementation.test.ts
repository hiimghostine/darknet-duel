import { TemporaryEffectsManager } from '../actions/temporaryEffectsManager';
import { WildcardResolver, WildcardPlayContext } from '../actions/wildcardResolver';
import { GameState, InfrastructureCard } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';
import { isCardPlayable } from '../utils/cardUtils';

describe('D301 Advanced Threat Defense Implementation', () => {
  let mockGameState: GameState;
  let mockInfrastructure: InfrastructureCard;
  let d301Card: Card;
  let reactiveAttackCard: Card;

  beforeEach(() => {
    // Set up mock infrastructure
    mockInfrastructure = {
      id: 'infra1',
      name: 'Test Server',
      type: 'data',
      state: 'secure',
      description: 'Test infrastructure',
      flavor: 'Test flavor',
      vulnerabilities: [],
      img: 'test'
    };

    // Set up mock game state
    mockGameState = {
      attacker: {
        id: 'attacker1',
        name: 'Attacker',
        role: 'attacker',
        resources: 10,
        actionPoints: 5,
        freeCardCyclesUsed: 0,
        deck: [],
        hand: [],
        field: [],
        discard: []
      },
      defender: {
        id: 'defender1',
        name: 'Defender',
        role: 'defender',
        resources: 10,
        actionPoints: 5,
        freeCardCyclesUsed: 0,
        deck: [],
        hand: [],
        field: [],
        discard: []
      },
      infrastructure: [mockInfrastructure],
      currentTurn: 'defender',
      turnNumber: 1,
      currentRound: 1,
      gamePhase: 'playing',
      attackerScore: 0,
      defenderScore: 0,
      actions: [],
      playerConnections: {},
      gameConfig: {
        initialResources: 10,
        maxTurns: 20,
        startingHandSize: 5,
        infrastructureCount: 6,
        initialActionPoints: 3,
        attackerActionPointsPerTurn: 3,
        defenderActionPointsPerTurn: 3,
        maxActionPoints: 5,
        freeCardCyclesPerTurn: 1,
        maxHandSize: 10,
        cardsDrawnPerTurn: 2
      }
    };

    // Set up D301 card
    d301Card = {
      id: 'D301',
      name: 'Advanced Threat Defense',
      type: 'wildcard',
      cost: 2,
      description: 'Multi-layered security system with reactive blocking',
      wildcardType: 'shield_or_fortify',
      specialEffect: 'prevent_reactive_attacks',
      isReactive: false
    };

    // Set up reactive attack card
    reactiveAttackCard = {
      id: 'A201',
      name: 'Security Service Terminator',
      type: 'counter-attack',
      cost: 1,
      description: 'Kills security processes and services',
      isReactive: true
    };
  });

  test('D301 creates prevent_reactions temporary effect', () => {
    const context: WildcardPlayContext = {
      gameState: mockGameState,
      playerRole: 'defender',
      card: d301Card,
      targetInfrastructure: mockInfrastructure,
      playerID: 'defender1'
    };

    const updatedGameState = WildcardResolver.applyWildcardEffects(d301Card, context);

    // Check that the prevent_reactions effect was added
    expect(updatedGameState.temporaryEffects).toBeDefined();
    expect(updatedGameState.temporaryEffects!.length).toBe(1);
    
    const effect = updatedGameState.temporaryEffects![0];
    expect(effect.type).toBe('prevent_reactions');
    expect(effect.targetId).toBe(mockInfrastructure.id);
    expect(effect.duration).toBe(2); // Should last 1 full round (2 turns)
    expect(effect.sourceCardId).toBe('D301');
    expect(effect.metadata?.preventType).toBe('reactive_attacks');
  });

  test('Reactive attack cards are blocked when infrastructure has prevent_reactions effect', () => {
    // Add prevent_reactions effect to game state
    const gameStateWithEffect = TemporaryEffectsManager.addEffect(mockGameState, {
      type: 'prevent_reactions',
      targetId: mockInfrastructure.id,
      playerId: 'defender1',
      duration: 2,
      sourceCardId: 'D301',
      metadata: {
        preventType: 'reactive_attacks',
        description: 'Target infrastructure cannot be compromised by reactive attack cards'
      }
    });

    // Test throw card validation (which is what actually gets called in the game)
    const { validateThrowCardMove } = require('../actions/throwCardMove/utils/throwCardValidation');
    
    const validationContext = {
      G: gameStateWithEffect,
      ctx: { activePlayers: { '0': 'reaction' } } as any,
      playerID: '0',
      cardId: reactiveAttackCard.id,
      targetInfrastructureId: mockInfrastructure.id
    };

    // Add the card to the attacker's hand for validation
    gameStateWithEffect.attacker!.hand = [reactiveAttackCard];

    const validationResult = validateThrowCardMove(validationContext);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.message).toContain('blocked by Advanced Threat Defense');
  });

  test('Reactive attack cards are allowed when infrastructure has no prevent_reactions effect', () => {
    // Set up reaction phase context
    mockGameState.pendingReactions = [{ cardId: 'test' }];

    const mockCtx = {
      activePlayers: { '0': 'reaction' },
      currentPlayer: '0'
    } as any;

    // Test that reactive attack card IS playable when no protection
    const isPlayable = isCardPlayable(
      mockGameState,
      mockCtx,
      '0', // attacker player ID
      reactiveAttackCard,
      mockGameState.attacker!,
      true, // debug
      mockInfrastructure.id // target infrastructure
    );

    expect(isPlayable).toBe(true);
  });

  test('Temporary effects are processed correctly on turn start', () => {
    // Add effect with duration 2
    const gameStateWithEffect = TemporaryEffectsManager.addEffect(mockGameState, {
      type: 'prevent_reactions',
      targetId: mockInfrastructure.id,
      playerId: 'defender1',
      duration: 2,
      sourceCardId: 'D301'
    });

    // Process turn start (should reduce duration by 1)
    const afterOneTurn = TemporaryEffectsManager.processTurnStart(gameStateWithEffect);
    expect(afterOneTurn.temporaryEffects!.length).toBe(1);
    expect(afterOneTurn.temporaryEffects![0].duration).toBe(1);

    // Process another turn start (should remove effect)
    const afterTwoTurns = TemporaryEffectsManager.processTurnStart(afterOneTurn);
    expect(afterTwoTurns.temporaryEffects!.length).toBe(0);
  });
});
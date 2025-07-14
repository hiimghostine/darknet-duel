import { Game, Ctx } from 'boardgame.io';
import { FnContext } from 'boardgame.io/dist/types/src/types';
import { GameState, GameAction, PlayerRole } from 'shared-types/game.types';
import { ChatMessage } from 'shared-types/chat.types';

// Import core modules
import { createInitialState, checkGameEnd } from './core/gameState';
import { createPlayerView } from './core/playerView';
import { setupPhase, playingPhase, gameOverPhase } from './core/gamePhases';

// Import actions
import { cycleCardMove, playCardMove, endTurnMove, throwCardMove } from './actions/playerActions';
import { chooseWildcardTypeMove } from './moves/chooseWildcardType';
import { chooseChainTargetMove } from './moves/chooseChainTarget';
import { chooseHandDiscardMove } from './moves/chooseHandDiscard';

/**
 * Darknet Duel Game Definition
 * 
 * A cybersecurity-themed card game where players take on the roles of attacker and defender
 * competing to control digital infrastructure.
 */
const DarknetDuel: Game<GameState> = {
  name: 'darknet-duel',
  // Using boardgame.io's built-in presence plugin (no need to explicitly add it)
  
  // Setup function initializes the game state
  setup({ ctx }: { ctx: Ctx }) {
    console.log('Game setup initiated - creating minimal initial state');
    console.log(`Players in setup: ${ctx.playOrder.length}/2`);
    
    // ✅ FIX: Only create basic state structure, don't initialize players yet
    // Player initialization will happen in the setup phase onBegin when both players join
    const state = createInitialState();
    
    console.log('✅ Minimal game state created, waiting for players to join');
    return state;
  },

  // Filter game state for different players
  playerView({ G, ctx, playerID }: { G: GameState; ctx: Ctx; playerID: string | null }) {
    return createPlayerView({ G, ctx, playerID });
  },

  // Game phases
  phases: {
    setup: setupPhase,
    playing: playingPhase,
    gameOver: gameOverPhase
  },
  
  // Game moves (actions players can take)
  moves: {
    // Send chat message
    sendChatMessage: ({ G, playerID }, message) => {
      // Determine player role based on game state
      // Default to attacker if we can't determine, but we'll always try to get the correct role
      let senderRole: PlayerRole = 'attacker';
      if (playerID === G.attacker?.id) {
        senderRole = 'attacker';
      } else if (playerID === G.defender?.id) {
        senderRole = 'defender';
      }
      
      // Create a new chat message object
      const chatMessage: ChatMessage = {
        id: Date.now().toString(), // Simple ID generation
        sender: playerID || 'unknown',
        senderRole: senderRole,
        content: message,
        timestamp: Date.now(),
      };

      // Initialize chat state if it doesn't exist
      const currentChat = G.chat || { messages: [] };
      
      // Add message to chat messages array in game state
      return {
        ...G,
        chat: {
          ...currentChat,
          messages: [...currentChat.messages, chatMessage]
        }
      };
    },

    // Cycle a card - discard and draw a new card
    cycleCard: (props, args) => {
      const cardId = typeof args === 'string' ? args : args?.cardId;
      return cycleCardMove(props, cardId);
    },
    
    // Play a card from hand onto the field
    playCard: (props, args) => {
      // Handle both formats: single string param or object with cardId and targetId
      const cardId = typeof args === 'string' ? args : args?.cardId;
      const targetId = typeof args === 'string' ? undefined : args?.targetId;
      return playCardMove(props, cardId, targetId);
    },
    
    // Throw a card at an infrastructure target
    throwCard: (props, args1, args2) => {
      // Handle both formats: separate params or object with cardId and targetId
      let cardId, targetInfrastructureId;
      
      if (typeof args1 === 'object' && args1 !== null) {
        // Object format from frontend: { cardId, targetId }
        cardId = args1.cardId;
        targetInfrastructureId = args1.targetId;
      } else {
        // Separate parameters format
        cardId = args1;
        targetInfrastructureId = args2;
      }
      
      return throwCardMove(props, cardId, targetInfrastructureId);
    },
    
    // End the current player's turn
    endTurn: (props) => endTurnMove(props),
    
    // Choose a type for a wildcard card
    chooseWildcardType: (props, args) => {
      // Handle both formats: direct type or object with type property
      const chosenType = typeof args === 'string' ? args : args?.type;
      return chooseWildcardTypeMove(props, chosenType);
    },
    
    // Choose target for chain effect (lateral movement)
    chooseChainTarget: (props, args) => {
      // Handle both formats: direct string or object with targetId
      const targetInfrastructureId = typeof args === 'string' ? args : args?.targetId;
      return chooseChainTargetMove(props.G, props.ctx, props.playerID, targetInfrastructureId);
    },
    
    // Choose cards to discard from opponent's hand (hand disruption)
    chooseHandDiscard: (props, args) => {
      // Handle both formats: array of strings or object with cardIds
      const cardIds = Array.isArray(args) ? args : args?.cardIds || [];
      return chooseHandDiscardMove(props.G, props.ctx, props.playerID, cardIds);
    },
    
    // Skip reaction during reaction stage
    skipReaction: (props) => {
      const { G, events, playerID } = props;
      
      // Clear pending reactions for this player
      const updatedPendingReactions = G.pendingReactions ? 
        G.pendingReactions.filter(reaction => reaction.target !== playerID) : [];
      
      // Return control to the action player if no more pending reactions
      if (updatedPendingReactions.length === 0) {
        if (G.currentActionPlayer) {
          events.setActivePlayers({ value: { [G.currentActionPlayer]: 'action' } });
        } else {
          events.setActivePlayers({ currentPlayer: 'action' });
        }
      }
      
      // Record the action of skipping a reaction
      const isAttacker = playerID === G.attacker?.id;
      const newAction: GameAction = {
        playerRole: isAttacker ? 'attacker' : 'defender',
        actionType: 'skipReaction',
        timestamp: Date.now(),
        payload: {}
      };
      
      return {
        ...G,
        pendingReactions: updatedPendingReactions,
        reactionComplete: updatedPendingReactions.length === 0,
        actions: [...G.actions, newAction],
        message: 'Reaction skipped'
      };
    },
  },
  
  // Check if the game has ended
  endIf({ G }: FnContext<GameState>) {
    return checkGameEnd(G);
  }
};

// Export the game
export default DarknetDuel;

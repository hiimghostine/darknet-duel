import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { TurnOrder } from 'boardgame.io/core';
// Import optimized version of GameBoard with memoization to prevent re-renders
import GameBoard from './MemoGameBoard';
import { useAuthStore } from '../../store/auth.store';
import { useGameCredentials } from '../../hooks/useGameCredentials';
import { useGameConnection } from '../../hooks/useGameConnection';
import { 
  isDebugEnabled,
  logGameState, 
  logClientInit,
  logAvailableMoves,
  logConnectionEvent
} from '../../utils/gameDebugUtils';
import GameLoading from '../ui/GameLoading';
import GameError from '../ui/GameError';
import GameControls from '../ui/GameControls';
import './GameClient.css';

// Type declarations for debugging
declare global {
  interface Window {
    _debug?: {
      lastAction?: string;
      lastTimestamp?: number;
    };
  }
};

// Define a minimal game definition for the client that matches the server structure
// The actual game logic implementation lives on the server
const DarknetDuelGame = {
  name: 'darknet-duel',
  
  // Minimal setup function - actual state comes from server
  setup: () => ({
    // The server will override this with the real state
    players: {},
    currentTurn: 0,
    turnNumber: 0,
    gamePhase: '',
    actions: [],
    gameConfig: {}
  }),
  
  // CRITICAL: Make sure the turn order is properly defined with DEFAULT
  turn: {
    // This is essential to prevent the 'turn undefined' error
    order: TurnOrder.DEFAULT,
    // Add minimum required properties to match server expectations
    onBegin: (G: any) => {
      console.log('Turn beginning');
      return G;
    },
    onEnd: (G: any) => {
      console.log('Turn ending');
      return G;
    },
    // Ensure moves are accessible during turns
    stages: {
      // Using explicit move functions rather than boolean values to satisfy TypeScript
      default: {
        moves: {
          // Reference the actual move functions from the top-level moves
          playCard: {
            move: function playCard(_G: any, _ctx: any, cardId: string) {
              console.log('Stage move - playCard with cardId:', cardId);
              return {}; // Return empty object instead of G
            }
          },
          throwCard: {
            move: function throwCard(_G: any, _ctx: any, cardId: string, targetId: string) {
              console.log('Stage move - throwCard with cardId:', cardId, 'targetId:', targetId);
              return {}; // Return empty object instead of G
            }
          },
          endTurn: {
            move: function endTurn(_G: any, _ctx: any) {
              console.log('Stage move - endTurn');
              return {}; // Return empty object instead of G
            }
          },
          cycleCard: {
            move: function cycleCard(_G: any, _ctx: any, cardId: string) {
              console.log('Stage move - cycleCard with cardId:', cardId);
              return {}; // Return empty object instead of G
            }
          },
          skipReaction: {
            move: function skipReaction(_G: any, _ctx: any) {
              console.log('Stage move - skipReaction');
              return {}; // Return empty object instead of G
            }
          },
          surrender: {
            move: function surrender(_G: any, _ctx: any) {
              console.log('Stage move - surrender');
              return {}; // Return empty object instead of G
            }
          }
        }
      }
    }
  },
  
  // Define all client-side moves at the top level
  // These registrations are critical for the client to recognize the moves
  moves: {
    // IMPORTANT: Move functions should NOT modify state on the client
    // Just return {} to let the server handle the actual state updates
    // Critical: Add sendChatMessage move for post-game chat
    sendChatMessage: {
      move: function sendChatMessage(_G: any, _ctx: any, content: string): {} {
        console.log('Top-level move - sendChatMessage:', content);
        return {}; // Return empty object, server handles actual logic
      }
    },
    requestRematch: {
      move: function requestRematch(_G: any, _ctx: any): {} {
        console.log('Top-level move - requestRematch');
        return {}; // Return empty object, server handles actual logic
      }
    },
    playCard: {
      // Use named function for better stack traces
      move: function playCard(_G: any, _ctx: any, cardId: string): {} {
        console.log('Client move registration - playCard:', cardId);
        // Return a new empty object instead of the original G to avoid serialization issues
        return {};
      }
    },
    throwCard: {
      move: function throwCard(_G: any, _ctx: any, cardId: string, targetId: string): {} {
        console.log('Client move registration - throwCard:', cardId, targetId);
        // Return a new empty object instead of the original G to avoid serialization issues
        return {};
      }
    },
    endTurn: {
      move: function endTurn(_G: any, _ctx: any): {} {
        console.log('Client move registration - endTurn');
        // Return a new empty object instead of the original G to avoid serialization issues
        return {};
      }
    },
    cycleCard: {
      move: function cycleCard(_G: any, _ctx: any, cardId: string): {} {
        console.log('Client move registration - cycleCard:', cardId);
        // Return a new empty object instead of the original G to avoid serialization issues
        return {};
      }
    },
    skipReaction: {
      move: function skipReaction(_G: any, _ctx: any): {} {
        console.log('Client move registration - skipReaction');
        return {};
      }
    },
    surrender: {
      move: function surrender(_G: any, _ctx: any): {} {
        console.log('Client move registration - surrender');
        return {};
      }
    }
  },
  
  // Define phases to match server implementation
  phases: {
    setup: {
      start: true,
      next: 'playing',
      turn: {
        // Duplicate turn order config to ensure it's available in all phases
        order: TurnOrder.DEFAULT
      }
    },
    
    playing: {
      next: 'gameOver',
      turn: {
        // Duplicate turn order config to ensure it's available in this phase
        order: TurnOrder.DEFAULT,
        // Make sure moves are accessible in this phase using function references
        moves: {
          playCard: {
            move: function playCard(_G: any, _ctx: any, cardId: string) {
              console.log('Phase move - playCard with cardId:', cardId);
              return {}; // Return empty object instead of G
            }
          },
          throwCard: {
            move: function throwCard(_G: any, _ctx: any, cardId: string, targetId: string) {
              console.log('Phase move - throwCard with cardId:', cardId, 'targetId:', targetId);
              return {}; // Return empty object instead of G
            }
          },
          endTurn: {
            move: function endTurn(_G: any, _ctx: any) {
              console.log('Phase move - endTurn');
              return {}; // Return empty object instead of G
            }
          },
          cycleCard: {
            move: function cycleCard(_G: any, _ctx: any, cardId: string) {
              console.log('Phase move - cycleCard with cardId:', cardId);
              return {}; // Return empty object instead of G
            }
          },
          skipReaction: {
            move: function skipReaction(_G: any, _ctx: any) {
              console.log('Phase move - skipReaction');
              return {}; // Return empty object instead of G
            }
          },
          surrender: {
            move: function surrender(_G: any, _ctx: any) {
              console.log('Phase move - surrender');
              return {}; // Return empty object instead of G
            }
          }
        }
      }
    },
    
    gameOver: {
      onBegin: (G: any) => {
        console.log('Game over phase beginning');
        return G;
      },
      turn: {
        // Ensure turn structure in gameOverPhase
        order: TurnOrder.DEFAULT,
        activePlayers: { all: 'gameOver' },
        stages: {
          gameOver: {
            moves: {
              // Critical: Register the sendChatMessage move for post-game chat
              sendChatMessage: {
                move: function sendChatMessage(_G: any, _ctx: any, content: string) {
                  console.log('Phase move - sendChatMessage:', content);
                  return {}; // Return empty object, server handles actual logic
                }
              },
              requestRematch: {
                move: function requestRematch(_G: any, _ctx: any) {
                  console.log('Phase move - requestRematch');
                  return {}; // Return empty object, server handles actual logic
                }
              },
              surrender: {
                move: function surrender(_G: any, _ctx: any) {
                  console.log('Phase move - surrender in gameOver');
                  return {}; // Return empty object, server handles actual logic
                }
              }
            }
          }
        }
      }
    }
  },
  
  // Game ends when server decides
  endIf: () => null
};

/**
 * GameClient component - Connects to the boardgame.io server and renders the game board
 */
const GameClient: React.FC = () => {
  // Get match ID and other params from URL
  const { matchID } = useParams<{ matchID: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Use the extracted credentials hook
  const {
    playerID,
    credentials,
    loadStoredCredentials,
    clearCredentials
  } = useGameCredentials(matchID);
  
  // Use the extracted connection hook
  const {
    connectionStatus,
    connectionError,
    leaveMatch,
    GAME_SERVER_URL
  } = useGameConnection(matchID, playerID, credentials);
  
  // Component state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientComponent, setClientComponent] = useState<React.ReactNode>(null);
  
  /**
   * Handle leaving the game and clean up resources
   */
  const handleLeaveGame = async () => {
    logConnectionEvent('User requested to leave game');
    
    if (matchID && playerID && credentials) {
      await leaveMatch();
      clearCredentials();
    }
    
    // Navigate back to lobbies
    navigate('/lobbies');
  };
  
  /**
   * Creates a boardgame.io client component
   */
  const createBoardgameClient = (matchID: string, playerID: string, credentials: string) => {
    logClientInit(matchID, playerID);
    
    // Create the boardgame.io client component using our game definition
    return Client({
      game: DarknetDuelGame,
      board: GameBoard as any, // Type cast to avoid TS prop mismatch
      multiplayer: SocketIO({
        server: GAME_SERVER_URL,
        socketOpts: {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          timeout: 20000,
          autoConnect: true,
          query: {
            matchID,
            playerID,
            credentials
          },
          forceNew: true
        }
      }),
      debug: isDebugEnabled(),
      numPlayers: 2,
      enhancer: (state: any) => {
        // Use the extracted debug utilities for logging
        if (isDebugEnabled()) {
          logGameState(state.G, state.ctx);
          
          if (state._stateID !== undefined) {
            logAvailableMoves(state.moves);
          }
        }
        
        // Create a smoother transition between states and handle state loss protection
        // This helps prevent the abrupt DOM reflow that causes the "jump" effect
        
        // Log moves for debugging but don't alter state
        if (state?.ctx?.gameover) {
          console.log('Game over detected!');
        }
        
        if (state.G && state._stateID) {
          // Mark when state transitions occur
          state.G._transitionTimestamp = Date.now();
          
          // Only store state if it has valid content
        }
        
        return state;
      }
    });
  };
  
  // Initialize game on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!matchID) {
      setError('Match ID not provided');
      setLoading(false);
      return;
    }
    
    logConnectionEvent(`Initializing game for match ID: ${matchID}`);
    
    // Get credentials and player ID using the extracted hook
    try {
      const { storedPlayerID, storedCredentials } = loadStoredCredentials();
      
      if (storedPlayerID && storedCredentials) {
        logConnectionEvent(`Found stored credentials for player: ${storedPlayerID}`);
        
        try {
          // Create the client component
          const BGClient = createBoardgameClient(matchID, storedPlayerID, storedCredentials);
          
          // Set the client component and render it
          setClientComponent(
            <BGClient 
              playerID={storedPlayerID} 
              matchID={matchID} 
              credentials={storedCredentials} 
            />
          );
          setLoading(false);
          logConnectionEvent('Boardgame.io client component mounted');
          
        } catch (clientErr) {
          console.error('Error creating boardgame.io client:', clientErr);
          setError('Failed to initialize game client: ' + ((clientErr as Error)?.message || 'Unknown error'));
          setLoading(false);
        }
      } else {
        setError('Could not find game credentials. Please join the game again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error initializing game client:', err);
      setError(`Failed to connect to game server: ${(err as Error)?.message || 'Unknown error'}`);
      setLoading(false);
    }
    
    // Cleanup function to handle component unmounting
    return () => {
      console.log('GameClient component unmounting');
      
      // Only clean up if we're actually navigating away from the game page
      if (window.location.pathname !== `/game/${matchID}`) {
        console.log('Cleaning up game resources');
        // No need to manually disconnect - boardgame.io handles this internally
      }
    };
  }, [matchID, navigate, user]);
  
  // Render component
  return (
    <div className="game-client-container">
      {loading && <GameLoading message="Loading game..." />}
      {error && <GameError message={error || 'Unknown error'} />}
      {connectionError && <GameError message="Connection Error" details={connectionError} />}
      
      {clientComponent}
      
      <GameControls 
        onLeaveGame={handleLeaveGame}
        matchID={matchID}
        playerID={playerID}
        connectionStatus={connectionStatus}
      />
    </div>
  );
};

export default GameClient;

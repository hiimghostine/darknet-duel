import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { GameState } from 'shared-types/game.types';
import LobbyChat from '../../lobby/LobbyChat';
import { useGameCredentials } from '../../../hooks/useGameCredentials';
import { useGameConnection } from '../../../hooks/useGameConnection';
import { playBGM, stopBGM } from '../../../utils/audioHandler';
import { validateAndCorrectWinner, getWinReason } from '../../../utils/winConditionUtils';

interface WinnerLobbyProps {
  G: GameState;
  playerID?: string;
  moves: {
    sendChatMessage: (content: string) => void;
    requestRematch: () => void;
    surrender?: () => void;
  };
  isAttacker?: boolean;
  matchID?: string;
}

const WinnerLobby: React.FC<WinnerLobbyProps> = ({
  G,
  playerID,
  moves,
  isAttacker,
  matchID
}) => {
  const navigate = useNavigate();
  
  // Validate and correct the winner using the authoritative win logic
  const validatedWinner = validateAndCorrectWinner(G);
  const isWinner = validatedWinner === (isAttacker ? 'attacker' : 'defender');
  
  // Get the proper win reason
  const winReason = getWinReason(G, validatedWinner);
  
  // Play victory/defeat BGM on mount and suppress global BGM manager
  React.useEffect(() => {
    window.__suppressGlobalBGM = true;
    if (isWinner) {
      playBGM('end-credits');
    } else {
      playBGM('unplugged-from-the-matrix');
    }
    return () => {
      window.__suppressGlobalBGM = false;
      stopBGM();
    };
  }, [isWinner]);

  // Use the same hooks as GameClient for proper cleanup
  const { clearCredentials } = useGameCredentials(matchID);
  const { leaveMatch } = useGameConnection(matchID, playerID || null, null);
  
  // Format duration from milliseconds to minutes:seconds
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // FIXED: Calculate fallback statistics when G.gameStats is missing or incomplete
  const calculateFallbackStats = () => {
    // Fallback game duration calculation
    const gameStartTime = G.actions?.length > 0 ? G.actions[0].timestamp : Date.now();
    const gameEndTime = Date.now();
    const fallbackDuration = gameEndTime - gameStartTime;
    
    // Fallback cards played calculation
    const fallbackCardsPlayed = G.actions?.filter(action => {
      return action.actionType === 'playCard' ||
             action.actionType === 'throwCard' ||
             action.actionType === 'cycleCard';
    }).length || 0;
    
    // Fallback infrastructure changes calculation
    const fallbackInfrastructureChanged = G.actions?.filter(action => {
      return action.payload &&
             (action.payload.infrastructureId !== undefined ||
              action.payload.oldState !== undefined ||
              action.payload.newState !== undefined ||
              action.actionType === 'throwCard');
    }).length || 0;
    
    return {
      gameDuration: fallbackDuration,
      cardsPlayed: fallbackCardsPlayed,
      infrastructureChanged: fallbackInfrastructureChanged,
      winReason: winReason
    };
  };

  // Use gameStats if available, otherwise calculate fallbacks
  const stats = G.gameStats || calculateFallbackStats();

  // Request rematch
  const handleRematchRequest = () => {
    if (moves.requestRematch) {
      moves.requestRematch();
    }
  };
  
  // Handle leaving the game (replacing surrender for post-game)
  const handleLeaveGame = async () => {
    const confirmed = window.confirm('Are you sure you want to leave the game? You will return to the lobby.');
    if (!confirmed) {
      return;
    }

    try {
      // Clean up game credentials and notify server when leaving post-game
      if (matchID && playerID) {
        await leaveMatch();
        clearCredentials();
      }
      navigate('/lobbies');
    } catch (error) {
      console.error('Error leaving game:', error);
      // Still clean up and navigate even if server notification fails
      clearCredentials();
      navigate('/lobbies');
    }
  };

  // Check if both players requested a rematch
  const bothRequestedRematch = G.rematchRequested && 
    G.attacker && G.defender && 
    G.rematchRequested.includes(G.attacker.id) && 
    G.rematchRequested.includes(G.defender.id);
  
  // Check if current player requested a rematch
  const currentPlayerRequestedRematch = G.rematchRequested && 
    playerID && G.rematchRequested.includes(playerID);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const glitchVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8,
        type: "spring" as const,
        bounce: 0.4
      }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <motion.div 
      className="h-screen bg-base-100 relative overflow-hidden text-base-content flex flex-col"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Cyberpunk Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        
        {/* Scanlines */}
        <div className="absolute inset-0 scanlines pointer-events-none"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-primary to-transparent"></div>
        
        {/* Binary background */}
        <div className="absolute top-20 left-10 opacity-5 text-9xl font-mono text-primary">101</div>
        <div className="absolute bottom-20 right-10 opacity-5 text-9xl font-mono text-primary">010</div>
        <div className="absolute top-1/3 right-20 opacity-5 text-7xl font-mono text-primary rotate-12">
          {isWinner ? 'WIN' : 'FAIL'}
        </div>
      </div>

      {/* Header */}
      <motion.header 
        className="p-4 border-b border-primary/20 backdrop-blur-sm bg-base-100/80 relative z-10"
        variants={itemVariants}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
              DARKNET_DUEL
            </h1>
            <div className="badge badge-primary font-mono text-xs">
              MISSION_COMPLETE
            </div>
          </div>
          
          <div className="flex gap-3">

            
            <motion.button
              onClick={handleLeaveGame}
              className="btn btn-sm btn-error font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚪 EXIT_NODE
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto p-4 relative z-10 flex-1 overflow-y-auto">
        {/* Victory/Defeat Banner */}
        <motion.div 
          className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm mb-8"
          variants={glitchVariants}
        >
          <div className={`bg-base-200 border-2 p-8 relative text-center ${
            isWinner ? 'border-success' : 'border-error'
          }`}>
            {/* Corner accents */}
            <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${
              isWinner ? 'border-success' : 'border-error'
            }`}></div>
            <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${
              isWinner ? 'border-success' : 'border-error'
            }`}></div>
            <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${
              isWinner ? 'border-success' : 'border-error'
            }`}></div>
            <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${
              isWinner ? 'border-success' : 'border-error'
            }`}></div>
            
                         <motion.div
               animate={isWinner ? pulseAnimation : undefined}
               className="mb-4"
             >
              <div className={`text-8xl mb-4 ${isWinner ? 'text-success' : 'text-error'}`}>
                {isWinner ? '🏆' : '💀'}
              </div>
              <h1 className={`text-6xl font-mono font-bold mb-4 ${
                isWinner ? 'text-success' : 'text-error'
              } data-corrupt`} data-text={isWinner ? 'VICTORY' : 'DEFEAT'}>
                {isWinner ? 'VICTORY' : 'DEFEAT'}
              </h1>
            </motion.div>
            
            <div className="font-mono">
              <p className="text-xl mb-2">
                {isWinner 
                  ? `MISSION_SUCCESS: Network ${isAttacker ? 'compromised' : 'defended'} successfully!`
                  : `MISSION_FAILED: Your ${isAttacker ? 'attack' : 'defense'} operation has failed!`
                }
              </p>
              {/* Creds earned message */}
              <p className={`text-lg font-bold mb-2 ${isWinner ? 'text-success' : 'text-info'}`}
                 style={{ marginTop: '1rem' }}>
                {isWinner ? 'You earned 10 creds!' : 'You earned 5 creds!'}
              </p>
              <p className="text-sm text-base-content/70">
                TERMINATION_REASON: {winReason}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rematch Status */}
        <AnimatePresence>
          {bothRequestedRematch && (
            <motion.div 
              className="p-1 bg-gradient-to-br from-success/20 via-success/10 to-transparent backdrop-blur-sm mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-base-200 border border-success/50 p-4 relative">
                <div className="flex items-center gap-4 font-mono">
                  <div className="text-4xl">⚡</div>
                  <div>
                    <div className="text-lg font-bold text-success">REMATCH_PROTOCOL_INITIATED</div>
                    <div className="text-sm text-base-content/70">Both operatives have agreed to a new engagement...</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="loading loading-dots loading-sm text-success"></span>
                      <span className="text-xs">INITIALIZING_NEW_MISSION</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
          {/* Game Statistics */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            variants={itemVariants}
          >
            {/* Mission Stats */}
            <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
              <div className="bg-base-200 border border-primary/20 p-6 relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-mono text-primary text-lg">MISSION_STATISTICS</h3>
                  <div className="text-xs text-base-content/70 font-mono">STATUS: ARCHIVED</div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-primary/30 bg-base-300/50 p-4 text-center">
                    <div className="text-2xl font-mono mb-2 text-primary">
                      {formatDuration(stats.gameDuration)}
                    </div>
                    <div className="text-xs text-primary font-mono">DURATION</div>
                  </div>
                  <div className="border border-primary/30 bg-base-300/50 p-4 text-center">
                    <div className="text-2xl font-mono mb-2 text-primary">
                      {stats.cardsPlayed}
                    </div>
                    <div className="text-xs text-primary font-mono">CARDS_PLAYED</div>
                  </div>
                  <div className="border border-primary/30 bg-base-300/50 p-4 text-center">
                    <div className="text-2xl font-mono mb-2 text-primary">
                      {G.turnNumber}
                    </div>
                    <div className="text-xs text-primary font-mono">TURNS</div>
                  </div>
                  <div className="border border-primary/30 bg-base-300/50 p-4 text-center">
                    <div className="text-2xl font-mono mb-2 text-primary">
                      {stats.infrastructureChanged}
                    </div>
                    <div className="text-xs text-primary font-mono">INFRA_CHANGES</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
              <div className="bg-base-200 border border-primary/20 p-6 relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-mono text-primary text-lg">FINAL_SCORES</h3>
                  <div className="text-xs text-base-content/70 font-mono">NETWORK_CONTROL</div>
                </div>
                
                <div className="grid grid-cols-3 gap-6 items-center">
                  <motion.div 
                    className={`border-2 bg-base-300/50 p-6 text-center relative ${
                      isAttacker ? 'border-primary' : 'border-primary/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    {isAttacker && (
                      <div className="absolute -top-2 -right-2 bg-primary text-base-100 text-xs font-mono px-2 py-1 rounded">
                        YOU
                      </div>
                    )}
                    <div className="text-3xl font-mono mb-2 text-error">
                      {G.attackerScore}
                    </div>
                    <div className="text-xs text-error font-mono">ATTACKER</div>
                  </motion.div>
                  
                  <div className="text-center font-mono text-2xl text-base-content/50">
                    VS
                  </div>
                  
                  <motion.div 
                    className={`border-2 bg-base-300/50 p-6 text-center relative ${
                      !isAttacker ? 'border-primary' : 'border-primary/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    {!isAttacker && (
                      <div className="absolute -top-2 -right-2 bg-primary text-base-100 text-xs font-mono px-2 py-1 rounded">
                        YOU
                      </div>
                    )}
                    <div className="text-3xl font-mono mb-2 text-info">
                      {G.defenderScore}
                    </div>
                    <div className="text-xs text-info font-mono">DEFENDER</div>
                  </motion.div>
                </div>
              </div>
            </div>

            
          </motion.div>

          {/* Post-Game Communications */}
          <motion.div 
            className="space-y-6 flex flex-col min-h-0"
            variants={itemVariants}
          >
            <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm flex-1 min-h-0">
              <div className="bg-base-200 border border-primary/20 p-4 relative h-full flex flex-col">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-mono text-primary text-lg">SECURE_CHANNEL</h3>
                  <div className="text-xs text-base-content/70 font-mono">ENCRYPTED</div>
                </div>
                
                <div className="flex-1 min-h-0">
                  <LobbyChat 
                    lobbyId={matchID}
                    showChannelSwitcher={false}
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
};

export default WinnerLobby;

declare global {
  interface Window {
    __suppressGlobalBGM?: boolean;
  }
}

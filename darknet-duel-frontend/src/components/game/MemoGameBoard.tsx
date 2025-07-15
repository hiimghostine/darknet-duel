import React, { useCallback, useMemo } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import isEqual from 'lodash/isEqual';

// Import local types only - we'll use @ts-expect-error for shared type mismatches
import type { GameState } from '../../types/game.types';

// Import custom hooks for memoization
import { useMemoizedValue, useMemoizedKeys } from '../../hooks/useMemoizedValue';

// Import all the extracted components
import PlayerHand from './board-components/PlayerHand';
import PlayerBoard from './board-components/PlayerBoard';
import InfrastructureArea from './board-components/InfrastructureArea';
import PlayerInfo from './board-components/PlayerInfo';
import GameControls from './board-components/GameControls';
import PowerBar from './board-components/PowerBar';
import WinnerLobby from './board-components/WinnerLobby';
import ChainEffectUI from './board-components/ChainEffectUI';
import WildcardChoiceUI from './board-components/WildcardChoiceUI';
import HandDisruptionUI from './board-components/HandDisruptionUI';
import CardSelectionUI from './board-components/CardSelectionUI';

// Import custom hooks
import { useCardActions } from '../../hooks/useCardActions';
import { useTurnActions } from '../../hooks/useTurnActions';
import { useGameState } from '../../hooks/useGameState';

// Import layout fix CSS
import '../../styles/game-layout-fix.css';

// Extended interface for client properties
type ClientMoves = Record<string, ((...args: unknown[]) => unknown) | undefined> & {
  surrender?: () => void;
  sendChatMessage?: (content: string) => void;
  requestRematch?: () => void;
}

interface GameClient {
  moves: ClientMoves;
  makeMove: (type: string, args: unknown[]) => void;
}

interface GameBoardProps extends BoardProps<GameState> {
  client?: GameClient;
}

// Cyberpunk-style GameBoard component
const GameBoardComponent = (props: GameBoardProps) => {
  const {
    G,
    ctx,
    moves,
    playerID,
    isActive
  } = props;
  
  // Use optimized memoization strategies
  const memoizedG = useMemoizedValue(G);
  const memoizedCtx = useMemoizedKeys(ctx, ['phase', 'currentPlayer', 'gameover', 'activePlayers']);
  
  // Memoize only critical game state properties that affect rendering
  useMemoizedKeys(G, [
    'gamePhase', 'message', 'attackerScore', 'defenderScore',
    'infrastructure', 'attacker', 'defender', 'chat', 'rematchRequested',
    'pendingChainChoice', 'pendingWildcardChoice', 'pendingHandChoice', 'pendingCardChoice'
  ]);

  // Use custom hooks for game state and actions with memoized values
  const {
    currentPlayerObj,
    opponent,
    opponentDisconnected,
    currentPhase,
    isAttacker
  } = useGameState(memoizedG, memoizedCtx, playerID);
  
  // Create optimized props object for hooks - use memoized values but maintain full interface
  const optimizedProps = useMemo(() => ({
    ...props,
    G: memoizedG,
    ctx: memoizedCtx
  }), [props, memoizedG, memoizedCtx]);
  
  const {
    selectedCard,
    targetMode,
    targetedInfraId,
    animatingThrow,
    processing: cardProcessing,
    playCard,
    cycleCard,
    selectCardToThrow,
    handleInfrastructureTarget,
    cancelTargeting
  } = useCardActions(optimizedProps);
  
  // Turn actions hook - also optimized
  const {
    processing: turnProcessing,
    handleEndTurn,
    handleSkipReaction
  } = useTurnActions(optimizedProps);
  
  // Track processing state for UI feedback
  const isProcessingMove = cardProcessing || turnProcessing;
  
  // Handle player surrender - memoize callback to maintain referential equality
  const surrender = useCallback(() => {
    const confirmed = window.confirm('Are you sure you want to surrender? This will end the game and count as a loss.');
    if (!confirmed) return;
    
    console.log('CLIENT: Executing surrender move');
    
    if (moves && typeof moves.surrender === 'function') {
      try {
        moves.surrender();
        return;
      } catch (error) {
        console.error('CLIENT: Error calling moves.surrender:', error);
      }
    }
    
    if (props.client && props.client.moves && typeof props.client.moves.surrender === 'function') {
      try {
        props.client.moves.surrender();
        return;
      } catch (error) {
        console.error('CLIENT: Error calling client.moves.surrender:', error);
      }
    }
    
    try {
      if (props.client) {
        props.client.makeMove('surrender', []);
      }
    } catch (error) {
      console.error('CLIENT: All surrender attempts failed:', error);
      alert('Unable to surrender. Please try again or refresh the page.');
    }
  }, [moves, props.client]);

  // Helper to make the chat message move correctly
  const sendChatMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    console.log('CLIENT: Trying to send chat message:', content);
    
    if (moves && typeof moves.sendChatMessage === 'function') {
      try {
        console.log('CLIENT: Executing sendChatMessage move');
        moves.sendChatMessage(content);
        return;
      } catch (error) {
        console.error('CLIENT: Error calling moves.sendChatMessage:', error);
      }
    }
    
    if (props.client && props.client.moves && typeof props.client.moves.sendChatMessage === 'function') {
      try {
        console.log('CLIENT: Attempting to use client.moves.sendChatMessage as fallback');
        props.client.moves.sendChatMessage(content);
        return;
      } catch (error) {
        console.error('CLIENT: Error calling client.moves.sendChatMessage:', error);
      }
    }
    
    try {
      if (props.client) {
        props.client.makeMove('sendChatMessage', [content]);
      }
    } catch (error) {
      console.error('CLIENT: All chat message attempts failed:', error);
    }
  }, [moves, props.client]);

  // Helper to make the rematch request move
  const requestRematch = useCallback(() => {
    console.log('CLIENT: Trying to request rematch');
    
    if (moves && typeof moves.requestRematch === 'function') {
      try {
        console.log('CLIENT: Executing requestRematch move');
        moves.requestRematch();
      } catch (error) {
        console.error('CLIENT: Error requesting rematch:', error);
      }
    } else {
      console.error('CLIENT: requestRematch move is not defined or not a function');
      if (props.client && props.client.moves && typeof props.client.moves.requestRematch === 'function') {
        console.log('CLIENT: Attempting to use client.moves.requestRematch as fallback');
        props.client.moves.requestRematch();
      }
    }
  }, [moves, props.client]);
  
  // Create the handler for chain target choice
  const handleChooseChainTarget = useCallback((targetId: string) => {
    console.log('🔥 Chain target handler called with:', targetId);
    
    if (moves.chooseChainTarget) {
      console.log('🔥 Calling moves.chooseChainTarget with:', targetId);
      moves.chooseChainTarget(targetId);
    } else {
      console.error('🔥 moves.chooseChainTarget is not available!');
    }
  }, [moves]);
  
  // Create the handler for wildcard type choice
  const handleChooseWildcardType = useCallback((type: string) => {
    if (moves.chooseWildcardType) {
      moves.chooseWildcardType({ type });
    }
  }, [moves]);
  
  // Create the handler for hand discard choice
  const handleChooseHandDiscard = useCallback((cardIds: string[]) => {
    if (moves.chooseHandDiscard) {
      moves.chooseHandDiscard({ cardIds });
      console.log('Hand cards selected for discard:', cardIds);
    }
  }, [moves]);
  
  // Create the handler for card selection from deck
  const handleChooseCardFromDeck = useCallback((cardId: string) => {
    if (moves.chooseCardFromDeck) {
      moves.chooseCardFromDeck({ cardId });
      console.log('Card selected from deck:', cardId);
    }
  }, [moves]);
  
  // Optimized common props with performance utilities
  const infrastructureData = useMemo(() => ({
    cards: memoizedG?.infrastructure || [],
    length: memoizedG?.infrastructure?.length || 0,
    states: memoizedG?.infrastructure?.map(infra => ({ id: infra.id, state: infra.state })) || []
  }), [memoizedG?.infrastructure]);
  
  // Common props to pass to child components
  const commonProps = useMemo(() => ({
    G: memoizedG,
    ctx: memoizedCtx,
    playerID,
    isActive,
    moves,
    isAttacker
  }), [memoizedG, memoizedCtx, playerID, isActive, moves, isAttacker]);

  if (!G || !ctx) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 font-mono text-base-content">LOADING GAME DATA...</p>
        </div>
      </div>
    );
  }

  // If the game is over, show the winner lobby
  if (ctx.gameover || ctx.phase === 'gameOver' || G.gamePhase === 'gameOver') {
    console.log('CLIENT: Rendering winner lobby. Phase:', ctx.phase, 'gamePhase:', G.gamePhase);
    
    const winnerLobbyMoves = {
      sendChatMessage,
      requestRematch,
      surrender
    };
    
    return (
      <WinnerLobby
        // @ts-expect-error - Missing gameConfig.maxHandSize and gameConfig.cardsDrawnPerTurn in local type
        G={G}
        playerID={playerID || undefined}
        moves={winnerLobbyMoves}
        isAttacker={isAttacker}
      />
    );
  }
  
  // Main cyberpunk-style game UI matching dashboard design
  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden text-base-content">
      {/* Background grid and decorative elements - matching dashboard */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
        <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-primary to-transparent"></div>
        
        {/* Tech-inspired typography */}
        <div className="absolute top-20 left-10 opacity-5 text-9xl font-mono text-primary">101</div>
        <div className="absolute bottom-20 right-10 opacity-5 text-9xl font-mono text-primary">010</div>
      </div>

      {/* Processing indicator */}
      {isProcessingMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm w-full">
            <div className="h-full p-3 bg-base-200 border border-primary/20 relative w-full">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <div className="flex items-center gap-4">
                <div className="loading loading-spinner loading-md text-primary"></div>
                <span className="font-mono text-primary">PROCESSING_MOVE...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content - matching dashboard's scanline effect */}
      <div className="relative z-10 scanline w-full max-w-full">
        {/* Cyberpunk header - matching dashboard design */}
        <div className="p-3 border-t border-primary/20 backdrop-blur-sm bg-base-100/80">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
                DARKNET_DUEL
              </h1>
              <div className="text-xs text-base-content/70 font-mono">
                NEURAL_LINK: ACTIVE
              </div>
            </div>
        
            <div className="flex items-center gap-4">
              {/* Game info section */}
              <div className="hidden md:flex items-center gap-4 text-xs font-mono">
                <div className="flex flex-col items-center">
                  <span className="text-primary">ROUND</span>
                  <span className="text-base-content">{memoizedG.currentRound || 1}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-primary">PHASE</span>
                  <span className="text-base-content">{currentPhase}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-primary">TURN</span>
                  <span className={isActive ? "text-success pulse-glow" : "text-base-content/60"}>
                    {isActive ? 'YOUR_TURN' : 'WAITING'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={surrender}
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
              >
                <span className="mr-1">🚪</span> 
                <span className="hidden sm:inline">EXIT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main dashboard content */}
        <main className="w-full px-2 py-2 overflow-x-hidden">
          {/* Status message banner */}
          {memoizedG.message && (
            <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm mb-6">
              <div className="bg-base-200 border border-primary/20 p-3 relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                
                <div className="font-mono text-center">
                  <span className="text-primary mr-2">&gt;</span>
                  <span className="text-base-content">{memoizedG.message}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Grid layout - desktop: 3 columns, mobile: stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4 w-full mx-0 px-0">
            
            {/* Left column - Player status */}
            <div className="space-y-6">
              {/* Your status panel */}
              <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
                <div className="bg-base-200 border border-primary/20 p-4 relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-primary text-lg">YOUR_STATUS</h3>
                    <div className="text-xs text-base-content/70 font-mono">
                      ROLE: {isAttacker ? 'ATTACKER' : 'DEFENDER'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <PlayerInfo
                      {...commonProps}
                      player={currentPlayerObj}
                      isOpponent={false}
                    />
                    <PlayerBoard
                      {...commonProps}
                      player={currentPlayerObj}
                      isCurrentPlayer={true}
                    />
                  </div>
                </div>
              </div>

              {/* Score panel */}
              <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
                <div className="bg-base-200 border border-primary/20 p-4 relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-primary text-lg">BATTLE_STATUS</h3>
                    <div className="text-xs text-base-content/70 font-mono">
                      TOTAL: {infrastructureData.length}
                    </div>
                  </div>
                  
                  <PowerBar
                    attackerScore={memoizedG?.attackerScore || 0}
                    defenderScore={memoizedG?.defenderScore || 0}
                    totalInfrastructure={infrastructureData.length}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className={`border border-primary/30 bg-base-300/50 p-3 text-center ${isAttacker ? 'border-success bg-success/10' : ''}`}>
                      <div className="text-xl font-mono mb-1">{memoizedG?.attackerScore || 0}</div>
                      <div className="text-xs text-primary font-mono">ATTACKER</div>
                      {isAttacker && <div className="text-xs text-success font-mono mt-1">YOU</div>}
                    </div>
                    <div className={`border border-primary/30 bg-base-300/50 p-3 text-center ${!isAttacker ? 'border-success bg-success/10' : ''}`}>
                      <div className="text-xl font-mono mb-1">{memoizedG?.defenderScore || 0}</div>
                      <div className="text-xs text-primary font-mono">DEFENDER</div>
                      {!isAttacker && <div className="text-xs text-success font-mono mt-1">YOU</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center column - Infrastructure */}
            <div className="space-y-6">
              <div className="p-px bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
              <div className="bg-base-200 border border-primary/20 p-3 relative min-h-[500px]">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-primary text-lg">NETWORK_GRID</h3>
                    <div className="text-xs text-base-content/70 font-mono flex gap-4">
                      <span>COMPROMISED: {infrastructureData.cards.filter(c => c.state === 'compromised').length}</span>
                      <span>SECURED: {infrastructureData.cards.filter(c => c.state === 'fortified').length}</span>
                    </div>
                  </div>
                  
                  <div className="h-full">
                    <InfrastructureArea
                      {...commonProps}
                      infrastructureCards={infrastructureData.cards}
                      targetMode={targetMode}
                      targetedInfraId={targetedInfraId}
                      animatingThrow={animatingThrow}
                      onTargetInfrastructure={handleInfrastructureTarget}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Opponent status */}
            <div className="space-y-6">
              <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
                <div className="bg-base-200 border border-primary/20 p-4 relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-primary text-lg">OPPONENT_STATUS</h3>
                    <div className="text-xs text-base-content/70 font-mono">
                      ROLE: {isAttacker ? 'DEFENDER' : 'ATTACKER'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <PlayerInfo
                      {...commonProps}
                      player={opponent}
                      isOpponent={true}
                    />
                    <PlayerBoard
                      {...commonProps}
                      player={opponent}
                      isCurrentPlayer={false}
                    />
                  </div>

                  {opponentDisconnected && (
                    <div className="mt-4 p-2 border border-error bg-error/10 text-center">
                      <div className="text-xs font-mono text-error">CONNECTION_LOST</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Game controls - moved out of player hand section */}
          <div className="flex justify-end mb-4 w-full">
            <GameControls
              {...commonProps}
              targetMode={targetMode}
              selectedCard={selectedCard}
              onEndTurn={handleEndTurn}
              onCycleCard={cycleCard}
              onCancelThrow={cancelTargeting}
              onSkipReaction={handleSkipReaction}
              onSurrender={surrender}
            />
          </div>
          
          {/* Player Arsenal Row - Added as part of main grid */}
          <div className="grid grid-cols-1 gap-2 lg:gap-4 w-full mx-0 px-0">
            <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
              <div className="bg-base-200 border border-primary/20 p-3 relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-mono text-primary text-lg">ARSENAL_ACCESS</h3>
                </div>
                
                <div className="arsenal-container w-full">
                  <PlayerHand
                    {...commonProps}
                    player={currentPlayerObj}
                    onPlayCard={playCard}
                    onCycleCard={cycleCard}
                    onSelectCardToThrow={selectCardToThrow}
                    targetMode={targetMode}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="p-4 border-t border-primary/20 text-center mt-8">
          <div className="text-base-content/60 text-xs font-mono">
            DARKNET_DUEL v0.0.1 • {new Date().toISOString().split('T')[0]} • 
            <span className="text-primary ml-1 text-flicker">NEURAL_LINK: ACTIVE</span>
          </div>
        </footer>
      </div>

      {/* Overlay UIs for game choices */}
      {memoizedG.pendingWildcardChoice && playerID === memoizedG.pendingWildcardChoice.playerId && (
        <WildcardChoiceUI
          pendingChoice={memoizedG.pendingWildcardChoice}
          playerId={playerID || ''}
          onChooseType={handleChooseWildcardType}
        />
      )}
      
      {memoizedG.pendingChainChoice && playerID === memoizedG.pendingChainChoice.playerId && (
        <ChainEffectUI
          pendingChainChoice={memoizedG.pendingChainChoice}
          infrastructureCards={infrastructureData.cards}
          onChooseTarget={handleChooseChainTarget}
        />
      )}
      
      {memoizedG.pendingHandChoice && playerID === memoizedG.pendingHandChoice.targetPlayerId && (
        <HandDisruptionUI
          pendingChoice={memoizedG.pendingHandChoice}
          playerId={playerID || ''}
          onChooseCards={handleChooseHandDiscard}
        />
      )}
      
      {memoizedG.pendingCardChoice && playerID === memoizedG.pendingCardChoice.playerId && (
        <CardSelectionUI
          pendingChoice={memoizedG.pendingCardChoice}
          onChooseCard={handleChooseCardFromDeck}
        />
      )}
    </div>
  );
};

// Create a memoized version with optimized comparison function
const MemoGameBoard = React.memo(GameBoardComponent, (prevProps, nextProps) => {
  // Safety check
  if (!prevProps.G || !nextProps.G || !prevProps.ctx || !nextProps.ctx) {
    console.log('CLIENT: Re-rendering due to missing props');
    return false;
  }
  
  // Quick primitive checks first
  if (prevProps.isActive !== nextProps.isActive ||
      prevProps.playerID !== nextProps.playerID) {
    console.log('CLIENT: Re-rendering due to player/active state change');
    return false;
  }
  
  // Context changes
  if (prevProps.ctx.phase !== nextProps.ctx.phase ||
      prevProps.ctx.currentPlayer !== nextProps.ctx.currentPlayer ||
      prevProps.ctx.gameover !== nextProps.ctx.gameover) {
    console.log('CLIENT: Re-rendering due to context change');
    return false;
  }
  
  // CRITICAL: Check activePlayers for reaction mode detection
  if (!isEqual(prevProps.ctx.activePlayers, nextProps.ctx.activePlayers)) {
    console.log('CLIENT: Re-rendering due to activePlayers change (reaction mode)');
    return false;
  }
  
  // Game state primitive checks
  if (prevProps.G.gamePhase !== nextProps.G.gamePhase ||
      prevProps.G.message !== nextProps.G.message ||
      prevProps.G.attackerScore !== nextProps.G.attackerScore ||
      prevProps.G.defenderScore !== nextProps.G.defenderScore) {
    console.log('CLIENT: Re-rendering due to game state change');
    return false;
  }
  
  // Chat messages - only check length and last message for performance
  const prevMessages = prevProps.G?.chat?.messages || [];
  const nextMessages = nextProps.G?.chat?.messages || [];
  if (prevMessages.length !== nextMessages.length ||
      (prevMessages.length > 0 && nextMessages.length > 0 &&
       !isEqual(prevMessages[prevMessages.length - 1], nextMessages[nextMessages.length - 1]))) {
    console.log('CLIENT: Re-rendering due to chat message changes');
    return false;
  }
  
  // Player objects - check IDs and hand lengths only
  if (prevProps.G?.attacker?.id !== nextProps.G?.attacker?.id ||
      prevProps.G?.defender?.id !== nextProps.G?.defender?.id ||
      prevProps.G?.attacker?.hand?.length !== nextProps.G?.attacker?.hand?.length ||
      prevProps.G?.defender?.hand?.length !== nextProps.G?.defender?.hand?.length) {
    console.log('CLIENT: Re-rendering due to player changes');
    return false;
  }
  
  // Infrastructure - check length and states only
  const prevInfra = prevProps.G?.infrastructure || [];
  const nextInfra = nextProps.G?.infrastructure || [];
  if (prevInfra.length !== nextInfra.length) {
    console.log('CLIENT: Re-rendering due to infrastructure count change');
    return false;
  }
  
  // Check infrastructure states
  for (let i = 0; i < prevInfra.length; i++) {
    if (prevInfra[i]?.state !== nextInfra[i]?.state ||
        prevInfra[i]?.id !== nextInfra[i]?.id) {
      console.log('CLIENT: Re-rendering due to infrastructure state change');
      return false;
    }
  }
  
  // Pending choices - check player IDs only
  if (prevProps.G?.pendingChainChoice?.playerId !== nextProps.G?.pendingChainChoice?.playerId ||
      prevProps.G?.pendingWildcardChoice?.playerId !== nextProps.G?.pendingWildcardChoice?.playerId ||
      prevProps.G?.pendingHandChoice?.targetPlayerId !== nextProps.G?.pendingHandChoice?.targetPlayerId ||
      prevProps.G?.pendingCardChoice?.playerId !== nextProps.G?.pendingCardChoice?.playerId) {
    console.log('CLIENT: Re-rendering due to pending choice changes');
    return false;
  }
  
  // Rematch requests
  if (prevProps.G?.rematchRequested !== nextProps.G?.rematchRequested) {
    console.log('CLIENT: Re-rendering due to rematch request changes');
    return false;
  }
  
  // If we reach here, no meaningful changes detected
  return true;
});

export default MemoGameBoard;

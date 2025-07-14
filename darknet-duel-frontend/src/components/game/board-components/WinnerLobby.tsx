import React from 'react';
import type { GameState } from 'shared-types/game.types';
import '../../../styles/winner-lobby.css';
import PostGameChat from './PostGameChat';

interface WinnerLobbyProps {
  G: GameState;
  playerID?: string;
  moves: {
    sendChatMessage: (content: string) => void;
    requestRematch: () => void;
    surrender?: () => void;
  };
  isAttacker?: boolean;
}

const WinnerLobby: React.FC<WinnerLobbyProps> = ({ 
  G, 
  playerID,
  moves,
  isAttacker
}) => {
  const isWinner = G.winner === (isAttacker ? 'attacker' : 'defender');
  
  // Format duration from milliseconds to minutes:seconds
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // Format timestamp to HH:MM:SS (used by sub-components)
  
  // Request rematch
  const handleRematchRequest = () => {
    if (moves.requestRematch) {
      moves.requestRematch();
    }
  };
  
  // Handle surrender
  const handleSurrender = () => {
    if (moves.surrender) {
      moves.surrender();
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

  return (
    <div className="winner-lobby">
      <div className="winner-lobby-content">
        {/* Header section with game result */}
        <div className="winner-announcement">
          {isWinner ? (
            <div className="winner-message">
              <h1>VICTORY</h1>
              <p>You have successfully {isAttacker ? 'hacked' : 'defended'} the network!</p>
              {G.gameStats?.winReason && (
                <p className="win-reason">{G.gameStats.winReason}</p>
              )}
            </div>
          ) : (
            <div className="loser-message">
              <h1>DEFEAT</h1>
              <p>Your {isAttacker ? 'attack' : 'defense'} has failed!</p>
              {G.gameStats?.winReason && (
                <p className="win-reason">{G.gameStats.winReason}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions section */}
        <div className="winner-lobby-actions">
          <button 
            className={`rematch-button ${currentPlayerRequestedRematch ? 'requested' : ''}`}
            onClick={handleRematchRequest}
            disabled={currentPlayerRequestedRematch || false}
          >
            {currentPlayerRequestedRematch ? 'Rematch Requested' : 'Request Rematch'}
          </button>
          
          {/* Only show surrender button if the function is available */}
          {moves.surrender && (
            <button 
              className="surrender-button"
              onClick={handleSurrender}
            >
              Surrender
            </button>
          )}

          {bothRequestedRematch && (
            <div className="rematch-pending">
              Both players requested a rematch! Starting new game...
            </div>
          )}
        </div>

        {/* Game stats section - always visible in the full page layout */}
        <div className="post-game-section">
          <h2 className="section-title">Game Statistics</h2>
          
          {G.gameStats ? (
            <div className="game-stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Duration</span>
                  <span className="stat-value">{formatDuration(G.gameStats.gameDuration)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Cards Played</span>
                  <span className="stat-value">{G.gameStats.cardsPlayed}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Infrastructure Changes</span>
                  <span className="stat-value">{G.gameStats.infrastructureChanged}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Turns Played</span>
                  <span className="stat-value">{G.turnNumber}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Attacker Score</span>
                  <span className="stat-value">{G.attackerScore}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Defender Score</span>
                  <span className="stat-value">{G.defenderScore}</span>
                </div>
              </div>
            </div>
          ) : (
            <p>Loading game statistics...</p>
          )}
        </div>
        
        {/* Future analytics section placeholder */}
        <div className="analytics-ready-section">
          <h2 className="section-title">Performance Analytics</h2>
          <p>This section will display detailed game analytics in future updates.</p>
          {/* Will be populated with charts and detailed performance metrics */}
        </div>

        {/* Post-game chat section */}
        <div className="post-game-section">
          <h2 className="section-title">Post-Game Chat</h2>
          <PostGameChat 
            chat={G.chat || { messages: [], lastReadTimestamp: {} }}
            playerID={playerID}
            sendMessage={(content) => moves.sendChatMessage(content)}
          />
        </div>
      </div>
    </div>
  );
};

export default WinnerLobby;

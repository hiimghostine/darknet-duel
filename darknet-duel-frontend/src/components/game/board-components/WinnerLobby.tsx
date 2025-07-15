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
    <div className="winner-lobby-dashboard">
      {/* Dashboard-style header */}
      <div className="winner-lobby-header">
        <div className="brand-section">
          <h1 className="game-title">DARKNET DUEL</h1>
          <span className="game-status">Match Complete</span>
        </div>
        <div className="header-actions">
          <button 
            className={`action-btn ${currentPlayerRequestedRematch ? 'requested' : 'primary'}`}
            onClick={handleRematchRequest}
            disabled={currentPlayerRequestedRematch || false}
          >
            {currentPlayerRequestedRematch ? 'Rematch Requested' : 'Request Rematch'}
          </button>
          
          {moves.surrender && (
            <button 
              className="action-btn secondary"
              onClick={handleSurrender}
            >
              Leave Game
            </button>
          )}
        </div>
      </div>

      {/* Dashboard-style content */}
      <div className="winner-lobby-content">
        
        {/* Result panel - hero section */}
        <div className="result-panel">
          <div className={`result-announcement ${isWinner ? 'victory' : 'defeat'}`}>
            <div className="result-icon">
              {isWinner ? '🏆' : '💀'}
            </div>
            <h1 className="result-title">
              {isWinner ? 'VICTORY' : 'DEFEAT'}
            </h1>
            <p className="result-subtitle">
              {isWinner 
                ? `You successfully ${isAttacker ? 'compromised' : 'defended'} the network!`
                : `Your ${isAttacker ? 'attack' : 'defense'} has failed!`
              }
            </p>
            {G.gameStats?.winReason && (
              <p className="win-reason">{G.gameStats.winReason}</p>
            )}
          </div>

          {bothRequestedRematch && (
            <div className="rematch-status">
              <div className="status-icon">⚡</div>
              <div className="status-text">
                <strong>Both players requested a rematch!</strong>
                <p>Starting new game...</p>
              </div>
            </div>
          )}
        </div>

        {/* Two-column layout like dashboard */}
        <div className="content-grid">
          
          {/* Left column - Statistics */}
          <div className="stats-section">
            <div className="section-panel">
              <h2 className="panel-title">Game Statistics</h2>
              
              {G.gameStats ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{formatDuration(G.gameStats.gameDuration)}</div>
                    <div className="stat-label">Duration</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{G.gameStats.cardsPlayed}</div>
                    <div className="stat-label">Cards Played</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{G.turnNumber}</div>
                    <div className="stat-label">Turns</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{G.gameStats.infrastructureChanged}</div>
                    <div className="stat-label">Infrastructure Changes</div>
                  </div>
                </div>
              ) : (
                <div className="loading-state">Loading statistics...</div>
              )}
            </div>

            <div className="section-panel">
              <h2 className="panel-title">Score Breakdown</h2>
              <div className="score-grid">
                <div className={`score-card ${isAttacker ? 'current-player' : ''}`}>
                  <div className="score-value">{G.attackerScore}</div>
                  <div className="score-label">Attacker Score</div>
                  {isAttacker && <div className="player-indicator">You</div>}
                </div>
                <div className="score-divider">vs</div>
                <div className={`score-card ${!isAttacker ? 'current-player' : ''}`}>
                  <div className="score-value">{G.defenderScore}</div>
                  <div className="score-label">Defender Score</div>
                  {!isAttacker && <div className="player-indicator">You</div>}
                </div>
              </div>
            </div>

            {/* Future analytics placeholder */}
            <div className="section-panel analytics-preview">
              <h2 className="panel-title">Performance Analytics</h2>
              <div className="analytics-placeholder">
                <div className="placeholder-icon">📊</div>
                <p>Detailed analytics coming soon</p>
                <span className="placeholder-subtitle">Charts, insights, and performance metrics will be available in future updates</span>
              </div>
            </div>
          </div>

          {/* Right column - Chat */}
          <div className="chat-section">
            <div className="section-panel chat-panel">
              <h2 className="panel-title">Post-Game Chat</h2>
              <div className="chat-container">
                <PostGameChat 
                  chat={G.chat || { messages: [], lastReadTimestamp: {} }}
                  playerID={playerID}
                  sendMessage={(content) => moves.sendChatMessage(content)}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WinnerLobby;

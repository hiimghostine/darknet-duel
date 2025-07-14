import React from 'react';
import type { PlayerInfoProps } from './types';

const PlayerInfo: React.FC<PlayerInfoProps> = ({
  player,
  G,
  isOpponent = false,
}) => {
  if (!player || !G) {
    return (
      <div className={`player-info ${isOpponent ? 'opponent-info' : ''}`}>
        <div className="player-name">
          <strong>{isOpponent ? 'Opponent' : 'You'}:</strong> Waiting...
        </div>
        <div className="player-role">
          Role: <span className="role-badge">Loading...</span>
        </div>
      </div>
    );
  }

  // Render resource display for the player (only action points as per requirement)
  const renderResources = () => {
    // Get current AP and max AP (10)
    const currentAP = (player as any).actionPoints || 0;
    const maxAP = G?.gameConfig?.maxActionPoints || 10;
    
    return (
      <div className="player-resources">
        <div className="resource-counter">
          <span className="resource-icon">⚡</span>
          <span className="resource-value">
            {currentAP}/{maxAP}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`player-info ${isOpponent ? 'opponent-info' : ''}`}>
      <div className="player-name">
        <strong>{isOpponent ? 'Opponent' : 'You'}:</strong> {player.name || player.id}
      </div>
      <div className="player-role">
        Role: <span className={`role-badge ${player.id === G?.attacker?.id ? 'attacker' : 'defender'}`}>
          {player.id === G?.attacker?.id ? '🎯 Attacker' : '🛡️ Defender'}
        </span>
      </div>
      {renderResources()}
    </div>
  );
};

export default PlayerInfo;

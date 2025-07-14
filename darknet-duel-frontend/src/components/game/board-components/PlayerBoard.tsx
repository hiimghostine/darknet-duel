import React from 'react';
import type { PlayerBoardProps, ExtendedCard } from './types';

const PlayerBoard: React.FC<PlayerBoardProps> = ({
  player,
  isCurrentPlayer,
}) => {
  if (!player || !player.playedCards || player.playedCards.length === 0) {
    return (
      <div className={`player-board ${isCurrentPlayer ? 'current-player-board' : 'opponent-board'}`}>
        <div className="board-label">{isCurrentPlayer ? 'Your' : 'Opponent'} Played Cards</div>
        <div className="empty-board">No cards played</div>
      </div>
    );
  }

  // Group cards by type
  const attackCards = player.playedCards.filter((card: ExtendedCard) => card.type === 'attack');
  // Use valid CardType values from shared-types: shield and fortify are defensive cards
  const defenseCards = player.playedCards.filter((card: ExtendedCard) => 
    card.type === 'shield' || card.type === 'fortify');
  const utilityCards = player.playedCards.filter((card: ExtendedCard) => 
    card.type !== 'attack' && card.type !== 'shield' && card.type !== 'fortify');

  return (
    <div className={`player-board ${isCurrentPlayer ? 'current-player-board' : 'opponent-board'}`}>
      <div className="board-label">{isCurrentPlayer ? 'Your' : 'Opponent'} Played Cards</div>
      
      <div className="cards-container">
        {attackCards.length > 0 && (
          <div className="card-section attack-section">
            <div className="attack-cards" key="attacks">
              <h4>Attack Cards</h4>
              <div className="played-cards-container">
                {attackCards.map((card: ExtendedCard, i: number) => (
                  <div 
                    key={`attack-${i}`} 
                    className={`card attack-card ${card.disabled ? 'disabled-card' : ''}`}
                  >
                    <div className="card-header">
                      <div>{card.name}</div>
                    </div>
                    <div className="card-details">
                      <div>ATK: {card.attackValue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {defenseCards.length > 0 && (
          <div className="card-section defense-section">
            <div className="section-label">Defense</div>
            <div className="cards-row">
              {defenseCards.map((card: ExtendedCard) => (
                <div 
                  key={card.id} 
                  className={`board-card defense-card ${card.disabled ? 'disabled' : ''}`}
                  title={`${card.name}: ${card.description}`}
                >
                  <div className="board-card-header">
                    <span className="board-card-name">{card.name}</span>
                  </div>
                  <div className="board-card-value">{card.defenseValue}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {utilityCards.length > 0 && (
          <div className="card-section utility-section">
            <div className="section-label">Utility</div>
            <div className="cards-row">
              {utilityCards.map((card: ExtendedCard) => (
                <div 
                  key={card.id} 
                  className={`board-card utility-card ${card.disabled ? 'disabled' : ''}`}
                  title={`${card.name}: ${card.description}`}
                >
                  <div className="board-card-header">
                    <span className="board-card-name">{card.name}</span>
                  </div>
                  <div className="board-card-text">{card.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerBoard;

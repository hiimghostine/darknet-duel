import React from 'react';
import type { GameControlsProps } from './types';

const GameControls: React.FC<GameControlsProps> = ({
  targetMode,
  selectedCard,
  onEndTurn,
  onCycleCard,
  onCancelThrow,
  onSkipReaction,
  onSurrender,
  isActive,
  currentPlayerObj,
  ctx,
  playerID
}) => {
  // Check if player is in reaction mode
  const isInReactionMode = ctx.activePlayers && playerID && ctx.activePlayers[playerID] === 'reaction';
  return (
    <div className="game-controls">
      {targetMode && selectedCard && (
        <div className="targeting-info">
          <span>Targeting with: {selectedCard.name}</span>
          <button 
            onClick={onCancelThrow}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      )}
      
      {isActive && !targetMode && !isInReactionMode && (
        <div className="action-buttons">
          <button 
            onClick={onEndTurn}
            className="end-turn-btn"
          >
            End Turn
          </button>
          
          {/* Add cycle card button when player has cards */}
          {currentPlayerObj && currentPlayerObj.hand && currentPlayerObj.hand.length > 0 && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCycleCard(currentPlayerObj.hand[0].id);
              }}
              className="cycle-button"
              title="Cycle out your current hand for a new card"
            >
              Cycle Card
            </button>
          )}
          
          {/* Surrender Button */}
          {onSurrender && (
            <button
              className="surrender-button"
              onClick={onSurrender}
            >
              Surrender
            </button>
          )}
        </div>
      )}
      
      {isActive && !targetMode && isInReactionMode && (
        <div className="reaction-buttons">
          <div className="reaction-mode-alert">Reaction Mode</div>
          <div className="reaction-instruction">Play a defense card to counter the attack or skip</div>
          <button 
            onClick={onSkipReaction}
            className="skip-reaction-btn"
          >
            Skip Reaction
          </button>
        </div>
      )}
    </div>
  );
};

export default GameControls;

import React, { useState } from 'react';
import type { HandDisruptionChoice } from '../../../types/game.types';
// Card type is used within pendingChoice.revealedHand
import CardDisplay from './CardDisplay';
import '../../../styles/hand-disruption.css';

interface HandDisruptionUIProps {
  pendingChoice: HandDisruptionChoice;
  playerId: string;
  onChooseCards: (cardIds: string[]) => void;
}

const HandDisruptionUI: React.FC<HandDisruptionUIProps> = ({
  pendingChoice,
  // playerId is not used in this component as it's primarily for the active player
  onChooseCards
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const maxSelections = pendingChoice.count || 1;
  
  const handleCardToggle = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
    } else if (selectedCards.length < maxSelections) {
      setSelectedCards([...selectedCards, cardId]);
    }
  };
  
  return (
    <div className="hand-disruption-overlay">
      <div className="hand-disruption-container">
        <h3>Choose Cards to Discard</h3>
        <p className="disruption-description">Select {maxSelections} card(s) from opponent's hand:</p>
        
        <div className="disruption-cards-section">
          <div className="player-hand-selection">
            {pendingChoice.revealedHand.map(card => (
              <div
                key={card.id}
                className={`discard-card-option ${selectedCards.includes(card.id) ? 'selected' : ''}`}
                onClick={() => handleCardToggle(card.id)}
              >
                <div className="disruption-card-display">
                  <CardDisplay card={card} />
                </div>
                {selectedCards.includes(card.id) && (
                  <div className="discard-button">Selected</div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="disruption-counter">
          Selected: {selectedCards.length} / {maxSelections}
        </div>
        
        <button
          onClick={() => onChooseCards(selectedCards)}
          disabled={selectedCards.length !== maxSelections}
          className="confirm-discard-button"
          style={{
            background: selectedCards.length === maxSelections ? '#cc3333' : '#666',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: selectedCards.length === maxSelections ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease'
          }}
        >
          Discard Selected Cards
        </button>
      </div>
    </div>
  );
};

export default HandDisruptionUI;

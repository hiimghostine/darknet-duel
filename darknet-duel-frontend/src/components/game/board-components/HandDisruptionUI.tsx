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
    <div className="hand-disruption-modal">
      <h3>Choose Cards to Discard</h3>
      <p>Select {maxSelections} card(s) from opponent's hand:</p>
      <div className="revealed-hand">
        {pendingChoice.revealedHand.map(card => (
          <div
            key={card.id}
            className={`revealed-card ${selectedCards.includes(card.id) ? 'selected' : ''}`}
            onClick={() => handleCardToggle(card.id)}
          >
            <CardDisplay card={card} />
          </div>
        ))}
      </div>
      <button 
        onClick={() => onChooseCards(selectedCards)}
        disabled={selectedCards.length !== maxSelections}
        className="confirm-discard-button"
      >
        Discard Selected Cards
      </button>
    </div>
  );
};

export default HandDisruptionUI;

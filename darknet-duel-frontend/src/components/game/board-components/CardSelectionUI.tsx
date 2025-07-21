import React from 'react';
import type { Card } from 'shared-types/card.types';
import CardDisplay from './CardDisplay';
import '../../../styles/card-selection.css';

interface PendingCardChoice {
  playerId: string;
  availableCards: Card[];
  choiceType: 'deck_selection' | 'hand_selection' | 'discard_selection';
  sourceCardId: string;
  timestamp: number;
}

interface CardSelectionUIProps {
  pendingChoice: PendingCardChoice;
  onChooseCard: (cardId: string) => void;
  onCancel?: () => void;
}

const CardSelectionUI: React.FC<CardSelectionUIProps> = ({
  pendingChoice,
  onChooseCard,
  onCancel
}) => {
  const { availableCards, choiceType, sourceCardId } = pendingChoice;
  
  const getTitle = () => {
    switch (choiceType) {
      case 'deck_selection':
        return 'Choose a card from your deck';
      case 'hand_selection':
        return 'Choose a card from your hand';
      case 'discard_selection':
        return 'Choose a card from your discard pile';
      default:
        return 'Choose a card';
    }
  };
  
  const getDescription = () => {
    switch (choiceType) {
      case 'deck_selection':
        return 'AI-Powered Attack lets you look at the top 3 cards of your deck and choose one to add to your hand.';
      case 'hand_selection':
        return 'Choose a card from your hand.';
      case 'discard_selection':
        return 'Choose a card from your discard pile.';
      default:
        return 'Make your selection.';
    }
  };
  
  return (
    <div className="card-selection-overlay">
      <div className="card-selection-container">
        <div className="card-selection-header">
          <h3>{getTitle()}</h3>
          <p className="card-selection-description">{getDescription()}</p>
          <p className="source-card-info">Source: {sourceCardId}</p>
        </div>
        
        <div className="available-cards-grid">
          {availableCards.map((card) => (
            <div
              key={card.id}
              className="selectable-card"
              onClick={() => {
                console.log(`🎯 CARD SELECTION UI DEBUG: Card clicked: ${card.id}`);
                console.log(`🎯 CARD SELECTION UI DEBUG: Card name: ${card.name}`);
                console.log(`🎯 CARD SELECTION UI DEBUG: Calling onChooseCard...`);
                onChooseCard(card.id);
              }}
            >
              <CardDisplay 
                card={card} 
                showDetails={true}
                className="card-selection-card"
              />
              <div className="select-card-button">
                Select This Card
              </div>
            </div>
          ))}
        </div>
        
        {availableCards.length === 0 && (
          <div className="no-cards-message">
            No cards available to select.
          </div>
        )}
        
        {onCancel && (
          <button 
            className="cancel-selection-button" 
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default CardSelectionUI;
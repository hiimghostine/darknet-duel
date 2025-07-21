import React, { useState, useCallback } from 'react';
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
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // DEFENSIVE: Validate pendingChoice structure
  if (!pendingChoice || !pendingChoice.availableCards) {
    console.error('🎯 CARD SELECTION UI ERROR: Invalid pendingChoice structure');
    return (
      <div className="card-selection-overlay">
        <div className="card-selection-container">
          <div className="card-selection-header">
            <h3>Selection Error</h3>
            <p className="card-selection-description error">
              Invalid card selection state. Please try again.
            </p>
          </div>
          {onCancel && (
            <button
              className="cancel-selection-button"
              onClick={onCancel}
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }
  
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
  
  // ROBUST: Handle card selection with validation and feedback
  const handleCardSelection = useCallback((card: Card) => {
    console.log(`🎯 CARD SELECTION UI DEBUG: Card clicked: ${card.id}`);
    console.log(`🎯 CARD SELECTION UI DEBUG: Card name: ${card.name}`);
    console.log(`🎯 CARD SELECTION UI DEBUG: Current processing state: ${isProcessing}`);
    
    // DEFENSIVE: Prevent double-clicks during processing
    if (isProcessing) {
      console.log(`🎯 CARD SELECTION UI DEBUG: Ignoring click - already processing`);
      return;
    }
    
    // DEFENSIVE: Validate card object
    if (!card || !card.id || typeof card.id !== 'string') {
      console.error(`🎯 CARD SELECTION UI ERROR: Invalid card object:`, card);
      return;
    }
    
    // Set processing state and selected card for visual feedback
    setSelectedCardId(card.id);
    setIsProcessing(true);
    
    console.log(`🎯 CARD SELECTION UI DEBUG: Calling onChooseCard...`);
    
    try {
      onChooseCard(card.id);
      
      // Reset processing state after a short delay to prevent rapid clicking
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error(`🎯 CARD SELECTION UI ERROR: Failed to process card selection:`, error);
      setIsProcessing(false);
      setSelectedCardId(null);
    }
  }, [onChooseCard, isProcessing]);
  
  return (
    <div className="card-selection-overlay">
      <div className="card-selection-container">
        <div className="card-selection-header">
          <h3>{getTitle()}</h3>
          <p className="card-selection-description">{getDescription()}</p>
          <p className="source-card-info">Source: {sourceCardId}</p>
          {isProcessing && (
            <p className="processing-indicator">
              🔄 Processing your selection...
            </p>
          )}
        </div>
        
        <div className="available-cards-grid">
          {availableCards.map((card) => {
            // DEFENSIVE: Validate each card
            if (!card || !card.id) {
              console.warn(`🎯 CARD SELECTION UI WARNING: Skipping invalid card:`, card);
              return null;
            }
            
            const isSelected = selectedCardId === card.id;
            const isClickable = !isProcessing;
            
            return (
              <div
                key={card.id}
                className={`selectable-card ${isSelected ? 'selected' : ''} ${!isClickable ? 'disabled' : ''}`}
                onClick={() => isClickable && handleCardSelection(card)}
                style={{
                  opacity: isClickable ? 1 : 0.6,
                  cursor: isClickable ? 'pointer' : 'not-allowed'
                }}
              >
                <CardDisplay
                  card={card}
                  showDetails={true}
                  className="card-selection-card"
                />
                <div className={`select-card-button ${isSelected ? 'selected' : ''}`}>
                  {isSelected ? 'Selected!' : 'Select This Card'}
                </div>
              </div>
            );
          })}
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
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CardSelectionUI;
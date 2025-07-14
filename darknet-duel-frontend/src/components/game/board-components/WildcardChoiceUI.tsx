import React from 'react';
import type { CardType } from 'shared-types/card.types';
import './WildcardChoiceUI.css';

// Use the actual structure from the game state
interface PendingWildcardChoice {
  cardId: string;
  playerId: string;
  availableTypes: CardType[];
  targetInfrastructure?: string;
  timestamp: number;
}

interface WildcardChoiceUIProps {
  pendingChoice: PendingWildcardChoice;
  playerId: string;
  onChooseType: (type: string) => void;
}

// Helper function to format card type for display
const formatCardType = (type: CardType): string => {
  const typeMap: Record<string, string> = {
    'attack': 'Attack',
    'defense': 'Defense',
    'utility': 'Utility',
    'special': 'Special',
    'wildcard': 'Wildcard'
  };
  
  return typeMap[type] || 'Unknown';
}

/**
 * Component for selecting a type for wildcard cards
 * Displays when a player needs to choose what type to play a wildcard as
 */
const WildcardChoiceUI: React.FC<WildcardChoiceUIProps> = ({ 
  pendingChoice,
  playerId,
  onChooseType
}) => {
  // Check if this player needs to make the choice
  const isMyChoice = playerId === pendingChoice.playerId;
  
  if (!isMyChoice) {
    return (
      <div className="wildcard-choice-container waiting">
        <div className="wildcard-choice-message">
          Waiting for player to choose wildcard type...
        </div>
      </div>
    );
  }
  
  // Handle type selection
  const handleTypeClick = (type: string) => {
    onChooseType(type);
  };
  
  // Get type-specific button styling
  const getButtonClass = (type: CardType): string => {
    return `wildcard-type-button ${type}`;
  };
  
  return (
    <div className="wildcard-choice-container">
      <h3 className="wildcard-choice-title">Choose Wildcard Type</h3>
      <p className="wildcard-choice-message">
        Select which type to play this wildcard card as:
      </p>
      
      <div className="wildcard-choices">
        {pendingChoice.availableTypes.map(type => (
          <button 
            key={type} 
            className={getButtonClass(type)}
            onClick={() => handleTypeClick(type)}
          >
            {formatCardType(type)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WildcardChoiceUI;

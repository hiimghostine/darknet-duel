import React from 'react';
import type { ExtendedCard } from './types';
import { isAttackerCard, isDefenderCard, isReactiveCardObject } from '../../../types/card.types';
import { getWildcardTypeDisplay } from '../../../utils/wildcardTypeUtils';
import '../../../styles/card.css';

interface CardDisplayProps {
  card: ExtendedCard;
  onClick?: (card: ExtendedCard, event?: React.MouseEvent) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  showDetails?: boolean;
  className?: string;
  effectiveCost?: number; // Added for cost reduction display
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  onClick,
  isSelectable = true,
  isSelected = false,
  isDisabled = false,
  showDetails = true,
  className = '',
  effectiveCost
}) => {
  const handleClick = (event: React.MouseEvent) => {
    console.log('CardDisplay handleClick:', {
      cardName: card.name,
      isDisabled,
      isSelectable,
      hasOnClick: !!onClick,
      willTriggerClick: !isDisabled && isSelectable && !!onClick
    });
    
    if (!isDisabled && isSelectable && onClick) {
      console.log('🔔 Executing onClick handler for card:', card.name);
      onClick(card, event);
    } else {
      console.log('🔕 Click blocked for card:', card.name, {
        reason: !isSelectable ? 'not selectable' : 
               isDisabled ? 'disabled' : 
               !onClick ? 'no click handler' : 'unknown'
      });
    }
  };

  // Determine card type for styling
  const cardTypeClass = getCardTypeClass(card);
  
  // Determine if card is playable based on context
  const playableClass = card.playable ? 'card-playable' : '';
  
  // Handle selection state
  const selectedClass = isSelected ? 'card-selected' : '';
  
  // Handle disabled state
  const disabledClass = isDisabled ? 'card-disabled' : '';

  // Special marker for reactive cards
  // Use isReactiveCardObject since we have a full card object, not just a type
  const reactiveMarker = isReactiveCardObject(card) ? (
    <div className="card-reactive-marker" title="Reactive: Can be played during opponent's turn">R</div>
  ) : null;

  // Display attack vector if present
  const attackVectorDisplay = card.attackVector ? (
    <div className={`card-vector card-vector-${card.attackVector}`}>
      {card.attackVector.charAt(0).toUpperCase()}
    </div>
  ) : null;
  
  // Display category tag from metadata if present
  const categoryTag = card.metadata?.category ? (
    <div className={`card-category card-category-${card.metadata.category}`} title={`Category: ${card.metadata.category}`}>
      {card.metadata.category.charAt(0).toUpperCase() + card.metadata.category.slice(1)}
    </div>
  ) : null;

  return (
    <div 
      className={`card ${cardTypeClass} ${playableClass} ${selectedClass} ${disabledClass} ${className}`}
      onClick={handleClick}
      data-card-id={card.id}
      data-card-type={card.type}
    >
      <div className="card-header">
        <div className="card-cost">
          {effectiveCost !== undefined && effectiveCost < card.cost && (
            <span className="original-cost">{card.cost}</span>
          )}
          <span className="effective-cost">{effectiveCost !== undefined ? effectiveCost : card.cost}</span>
        </div>
        <div className="card-name">{card.name}</div>
        {attackVectorDisplay}
      </div>
      
      <div className="card-body">
        {showDetails && (
          <>
            <div className="card-type">{formatCardType(card.type)}</div>
            <div className="card-description">{card.description}</div>
            {/* DEBUG: Check if flavor exists */}
            {console.log('🐛 CardDisplay DEBUG:', {
              cardName: card.name,
              hasDescription: !!card.description,
              hasFlavor: !!(card as any).flavor,
              flavorContent: (card as any).flavor,
              showDetails,
              cardKeys: Object.keys(card)
            })}
            {(card as any).flavor && (
              <div className="card-flavor">{(card as any).flavor}</div>
            )}
            {card.power !== undefined && (
              <div className="card-power">Power: {card.power}</div>
            )}
          </>
        )}
      </div>
      
      <div className="card-footer">
        <div className="card-footer-left">
          {reactiveMarker}
          {categoryTag}
        </div>
        <div className="card-footer-right">
          {card.specialEffect && (
            <div className="card-special" title={card.specialEffect}>✦</div>
          )}
          {card.wildcardType && (
            <div className="card-wildcard" title={`Can be played as: ${getWildcardTypeDisplay(card.wildcardType)}`}>W</div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper function to get CSS class for a card based on its type
 */
function getCardTypeClass(card: ExtendedCard): string {
  if (isAttackerCard(card.type)) {
    return 'card-attacker';
  } else if (isDefenderCard(card.type)) {
    return 'card-defender';
  } else if (card.type === 'wildcard') {
    return 'card-wildcard';
  }
  return '';
}

/**
 * Format card type for display
 */
function formatCardType(cardType: string): string {
  // Convert kebab-case to Title Case
  return cardType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default CardDisplay;

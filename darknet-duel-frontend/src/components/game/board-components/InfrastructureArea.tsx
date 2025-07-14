import React from 'react';
import type { InfrastructureAreaProps } from './types';
import type { InfrastructureCard, InfrastructureCardEffect } from '../../../types/game.types';
import InfrastructureCardDisplay from './InfrastructureCardDisplay';
import '../../../styles/infrastructure.css';
import '../../../styles/infrastructure-card.css';

const InfrastructureArea: React.FC<InfrastructureAreaProps> = ({
  infrastructureCards,
  targetMode,
  targetedInfraId,
  animatingThrow,
  onTargetInfrastructure,
  G,
  isActive,
}) => {
  // Handle targeting of infrastructure card
  const handleTargetInfrastructure = (card: InfrastructureCard) => {
    if (targetMode && isActive && onTargetInfrastructure) {
      // Extract card ID for the onTargetInfrastructure function since it expects a string ID
      onTargetInfrastructure(card.id);
    }
  };

  // Get temporary effects from game state
  const temporaryEffects = G.temporaryEffects || [];

  if (!infrastructureCards || infrastructureCards.length === 0) {
    return (
      <div className="infrastructure-area">
        <div className="infrastructure-title">Corporate Infrastructure</div>
        <div className="empty-infrastructure">No infrastructure cards</div>
      </div>
    );
  }

  return (
    <div className="infrastructure-area">
      <div className="infrastructure-title">Corporate Infrastructure</div>
      <div className="infrastructure-cards-container">
        {infrastructureCards.map((infra: InfrastructureCard) => {
          // Determine if card is being targeted currently
          const isBeingTargeted = animatingThrow && targetedInfraId === infra.id;
          const isTargetable = targetMode && !isBeingTargeted;

          return (
            <div
              key={infra.id}
              className={`infrastructure-card-wrapper ${isBeingTargeted ? 'being-targeted' : ''}`}
            >
              <InfrastructureCardDisplay
                key={infra.id}
                card={infra}
                onClick={handleTargetInfrastructure}
                isTargetable={isTargetable}
                isSelected={targetedInfraId === infra.id}
                isTargeted={targetedInfraId === infra.id}
                animatingAttack={isBeingTargeted}
                temporaryEffects={temporaryEffects}
                className="board-infrastructure-card"
              />

              {/* Effects badges if any */}
              {infra.effects && infra.effects.length > 0 && (
                <div className="infra-effects-overlay">
                  {infra.effects.map((effect: InfrastructureCardEffect, index: number) => (
                    <div key={index} className="effect-badge">
                      {effect.type} ({effect.duration})
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfrastructureArea;

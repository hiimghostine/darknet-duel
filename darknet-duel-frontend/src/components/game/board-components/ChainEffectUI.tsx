import React, { useMemo } from 'react';
import type { ChainEffect, InfrastructureCard } from '../../../types/game.types';
import CardDisplay from './CardDisplay';
import '../../../styles/chain-effect.css';

interface ChainEffectUIProps {
  pendingChainChoice: ChainEffect;
  infrastructureCards: InfrastructureCard[];
  onChooseTarget: (targetId: string) => void;
  onCancel?: () => void;
}

const ChainEffectUI: React.FC<ChainEffectUIProps> = ({
  pendingChainChoice,
  infrastructureCards,
  onChooseTarget,
  onCancel
}) => {
  // Extract properties from the chainEffect object
  const { availableTargets, sourceCardId, type } = pendingChainChoice;
  
  // Filter the infrastructure cards to only those that are valid targets
  const validTargets = useMemo(() => {
    if (!availableTargets || availableTargets.length === 0) return [];
    return infrastructureCards.filter(card =>
      availableTargets.includes(card.id)
    );
  }, [infrastructureCards, availableTargets]);
  
  // Dynamic content based on chain effect type
  const getChainDescription = (effectType: string) => {
    switch (effectType) {
      case 'chain_vulnerability':
        return 'Lateral Movement allows you to make another infrastructure vulnerable.';
      case 'chain_compromise':
        return 'Advanced attack allows you to compromise another infrastructure.';
      case 'chain_security':
        return 'Security Automation Suite allows you to shield another infrastructure.';
      default:
        return 'Chain effect allows you to target another infrastructure.';
    }
  };
  
  return (
    <div className="chain-effect-overlay">
      <div className="chain-effect-container">
        <h3>Chain Effect Triggered</h3>
        <div className="chain-effect-content">
          <div className="source-card-section">
            <p>Source card: {sourceCardId}</p>
            <div className="chain-effect-description">
              {getChainDescription(type)}
            </div>
          </div>
        </div>
        
        <div className="chain-valid-targets">
          <h4>Valid Targets ({validTargets.length})</h4>
          {validTargets.length > 0 ? (
            <div className="target-cards-container">
              {validTargets.map((target) => (
                <div 
                  key={target.id} 
                  className="chain-target-card"
                  onClick={() => onChooseTarget(target.id)}
                >
                  <InfrastructureCardDisplay
                    card={target as any}
                    isTargetable={true}
                    showDetails={false}
                    className="chain-target-infrastructure-card"
                  />
                  <div className="select-target-button">Select</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-targets-message">No valid targets available.</p>
          )}
        </div>
        
        {onCancel && (
          <button 
            className="cancel-chain-button" 
            onClick={onCancel}
          >
            Skip Chain Effect
          </button>
        )}
      </div>
    </div>
  );
};

export default ChainEffectUI;

// Import separately to avoid circular dependency
import InfrastructureCardDisplay from './InfrastructureCardDisplay';

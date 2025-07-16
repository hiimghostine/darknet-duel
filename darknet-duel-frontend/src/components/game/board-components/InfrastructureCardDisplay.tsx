import React from 'react';
// Import from shared types directly using the main module
import type { InfrastructureCard, AttackVector, Vulnerability } from 'shared-types';
import '../../../styles/infrastructure-card.css';
import TemporaryEffectsDisplay from './TemporaryEffectsDisplay';

interface TemporaryEffect {
  type: string;
  targetId?: string;
  playerId?: string;
  duration: number;
  sourceCardId: string;
  metadata?: Record<string, unknown>;
}

interface InfrastructureCardDisplayProps {
  card: InfrastructureCard;
  onClick?: (card: InfrastructureCard) => void;
  isTargetable?: boolean;
  isSelected?: boolean;
  isTargeted?: boolean;
  animatingAttack?: boolean;
  showDetails?: boolean;
  className?: string;
  temporaryEffects?: TemporaryEffect[];
}

const InfrastructureCardDisplay: React.FC<InfrastructureCardDisplayProps> = ({
  card,
  onClick,
  isTargetable = false,
  isSelected = false,
  isTargeted = false,
  animatingAttack = false,
  showDetails = true,
  className = '',
  temporaryEffects = []
}) => {
  const handleClick = () => {
    if (isTargetable && onClick) {
      onClick(card);
    }
  };

  // Create CSS classes based on card state
  const stateClass = `infra-state-${card.state}`;
  const targetableClass = isTargetable ? 'infra-targetable' : '';
  const selectedClass = isSelected ? 'infra-selected' : '';
  const damagedClass = card.damaged ? 'infra-damaged' : '';
  const targetedClass = isTargeted ? 'infra-targeted' : '';
  const animatingClass = animatingAttack ? 'animating-attack' : '';
  const criticalClass = card.critical ? 'infra-critical' : '';
  
  // Filter effects that apply to this card
  const cardEffects = temporaryEffects.filter(effect => effect.targetId === card.id);

  return (
    <div 
      className={`infrastructure-card ${stateClass} ${targetableClass} ${selectedClass} ${damagedClass} ${targetedClass} ${animatingClass} ${criticalClass} ${className}`}
      onClick={handleClick}
      data-card-id={card.id}
      data-card-type={card.type}
    >
      <div className="infra-header">
        <div className="infra-name">{card.name}</div>
        <div className="infra-type">{formatInfraType(card.type)}</div>
        {card.critical && <div className="critical-indicator">CRITICAL</div>}
      </div>
      
      {showDetails && (
        <div className="infra-body">
          <div className="infra-state">
            <div className="infra-state-indicator">{formatState(card.state)}</div>
            {card.healthPoints !== undefined && (
              <div className="infra-health">HP: {card.healthPoints}</div>
            )}
          </div>
          
          <div className="infra-description">{card.description}</div>
          
          {card.vulnerableVectors && card.vulnerableVectors.length > 0 && (
            <div className="infra-vulnerabilities">
              <div className="vuln-title">Vulnerabilities:</div>
              <div className="vuln-vectors">
                {card.vulnerableVectors.map((vector: AttackVector | Vulnerability | string, index) => {
                  // Handle the three possible formats of Vulnerability:
                  // 1. Simple string (e.g., 'exploit', 'ddos')
                  // 2. AttackVector enum values
                  // 3. Object with vector property
                  let vectorValue = '';
                  
                  if (typeof vector === 'string') {
                    // Handle string format
                    vectorValue = vector;
                  } else if (typeof vector === 'object' && vector !== null) {
                    // Handle object format (check for vector property)
                    vectorValue = (vector as {vector?: string}).vector || '';
                  }
                  
                  return (
                    <span key={`${vectorValue}-${index}`} className={`vuln-tag vuln-${vectorValue}`}>
                      {vectorValue.charAt(0).toUpperCase() + vectorValue.slice(1)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="infra-footer">
        {card.flavor && <div className="infra-flavor">"{card.flavor}"</div>}
        
        {/* Display temporary effects active on this infrastructure */}
        {cardEffects.length > 0 && (
          <TemporaryEffectsDisplay 
            effects={cardEffects} 
            targetInfrastructure={card}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Format infrastructure type for display
 */
function formatInfraType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Format infrastructure state for display using the proper InfrastructureState values
 */
function formatState(state: string): string {
  switch (state) {
    // Defender path states
    case 'secure':
      return '✓ Secure';
    case 'shielded':
      return '🛡️ Shielded';
    case 'fortified':
      return '🔒 Fortified';
    case 'fortified_weaken':
      return '🔓 Weakening';
    
    // Attacker path states
    case 'vulnerable':
      return '⚠️ Vulnerable';
    case 'compromised':
      return '☠️ Compromised';
      
    // Fallback for any other states
    default:
      return state.charAt(0).toUpperCase() + state.slice(1);
  }
}

export default InfrastructureCardDisplay;

import React from 'react';
import './TemporaryEffectsDisplay.css';

// Type imports
import type { InfrastructureCard } from '../../../types/game.types';

interface TemporaryEffect {
  type: string;
  targetId?: string;
  playerId?: string;
  duration: number;
  sourceCardId: string;
  metadata?: Record<string, unknown>; // For complex effect data
}

interface TemporaryEffectsDisplayProps {
  effects: TemporaryEffect[];
  targetInfrastructure?: InfrastructureCard;
}

/**
 * Formats the effect type string for display
 */
const formatEffectType = (effectType: string): string => {
  return effectType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Component to display temporary effects that are active on cards or players
 */
const TemporaryEffectsDisplay: React.FC<TemporaryEffectsDisplayProps> = ({ 
  effects 
  // targetInfrastructure parameter is available but not used in this component yet
}) => {
  const activeEffects = effects.filter(effect => effect.duration > 0);
  
  if (activeEffects.length === 0) {
    return null;
  }
  
  return (
    <div className="temporary-effects-display">
      {activeEffects.map(effect => (
        <div key={effect.sourceCardId} className={`effect-badge ${effect.type}`}>
          <span className="effect-type">{formatEffectType(effect.type)}</span>
          <span className="effect-duration">{effect.duration} turn{effect.duration !== 1 ? 's' : ''}</span>
        </div>
      ))}
    </div>
  );
};

export default TemporaryEffectsDisplay;

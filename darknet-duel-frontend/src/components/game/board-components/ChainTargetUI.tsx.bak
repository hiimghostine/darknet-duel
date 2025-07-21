import React from 'react';
import type { ChainEffect } from '../../../types/game.types';
import '../../../styles/chain-target.css';

interface ChainTargetUIProps {
  pendingChoice: ChainEffect;
  playerId: string;
  onChooseTarget: (targetId: string) => void;
}

// Helper function to get infrastructure name from ID
const getInfrastructureName = (targetId: string) => {
  // This is a placeholder implementation
  // In a real implementation, you would look up the infrastructure name from somewhere
  return `Infrastructure ${targetId}`;
};

const ChainTargetUI: React.FC<ChainTargetUIProps> = ({ 
  pendingChoice, 
  playerId, 
  onChooseTarget 
}) => {
  const isMyChoice = playerId === pendingChoice.playerId;
  
  if (!isMyChoice) {
    return (
      <div className="chain-target-waiting">
        <p>Waiting for player to choose chain target...</p>
      </div>
    );
  }
  
  return (
    <div className="chain-target-selection">
      <h3>Choose Chain Target</h3>
      <p>Select infrastructure to apply {pendingChoice.type} effect:</p>
      <div className="available-targets">
        {pendingChoice.availableTargets.map(targetId => (
          <button
            key={targetId}
            onClick={() => onChooseTarget(targetId)}
            className="target-button"
          >
            {getInfrastructureName(targetId)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChainTargetUI;

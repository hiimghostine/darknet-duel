import React from 'react';
import './GameError.css';

interface GameErrorProps {
  message: string;
  details?: string | null;
  onRetry?: () => void;
}

/**
 * A reusable error display component for game-related errors
 */
const GameError: React.FC<GameErrorProps> = ({ 
  message, 
  details, 
  onRetry 
}) => {
  return (
    <div className="game-error">
      <div className="error-icon">!</div>
      <div className="error-content">
        <h3 className="error-title">Error</h3>
        <p className="error-message">{message}</p>
        {details && <p className="error-details">{details}</p>}
      </div>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default GameError;

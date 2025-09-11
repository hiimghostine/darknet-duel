import React from 'react';
import type { DisconnectionState } from '../../hooks/useDisconnectionHandler';

interface DisconnectionAlertProps {
  disconnectionState: DisconnectionState;
  onForfeit?: () => void;
}

const DisconnectionAlert: React.FC<DisconnectionAlertProps> = ({
  disconnectionState,
  onForfeit
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  if (!disconnectionState.showDisconnectionAlert && !disconnectionState.showReconnectWindow) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 border-2 border-error rounded-lg p-6 max-w-md mx-4 shadow-2xl">
        {disconnectionState.showDisconnectionAlert && (
          <>
            {/* Opponent Disconnected Alert */}
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-error mb-2">
                Opponent Disconnected
              </h2>
              <p className="text-base-content/80 mb-4">
                Your opponent has lost connection. If they don't reconnect within the time limit, you will win by forfeit.
              </p>
              
              <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-error">
                  {formatTime(disconnectionState.countdownRemaining)}
                </div>
                <div className="text-sm text-error/80">
                  until automatic forfeit
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button 
                  className="btn btn-success btn-sm"
                  disabled
                >
                  🏆 You Win on Forfeit
                </button>
              </div>
            </div>
          </>
        )}

        {disconnectionState.showReconnectWindow && (
          <>
            {/* Client Reconnect Window */}
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h2 className="text-xl font-bold text-warning mb-2">
                Connection Lost
              </h2>
              <p className="text-base-content/80 mb-4">
                You've lost connection to the game server. Attempting to reconnect...
              </p>
              
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-warning">
                  {formatTime(disconnectionState.countdownRemaining)}
                </div>
                <div className="text-sm text-warning/80">
                  to reconnect or forfeit
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button 
                  className="btn btn-warning btn-sm loading"
                  disabled
                >
                  Reconnecting...
                </button>
                {onForfeit && (
                  <button 
                    className="btn btn-error btn-sm"
                    onClick={onForfeit}
                  >
                    Forfeit Game
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DisconnectionAlert;

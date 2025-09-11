import React from 'react';
import type { ConnectionStatus } from '../../hooks/useHeartbeat';

interface ConnectionStatusIndicatorProps {
  connectionStatus: ConnectionStatus;
  opponentStatus: ConnectionStatus;
  isAttacker: boolean;
  playerName?: string;
  opponentName?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  connectionStatus,
  opponentStatus,
  isAttacker,
  playerName = 'You',
  opponentName = 'Opponent'
}) => {
  const formatLatency = (latency: number) => {
    if (latency === 0) return '--';
    return `${latency}ms`;
  };

  const getConnectionIcon = (isConnected: boolean, reconnectAttempts: number) => {
    if (!isConnected && reconnectAttempts > 0) {
      return '🔄'; // Reconnecting
    }
    return isConnected ? '🟢' : '🔴';
  };

  const getConnectionText = (isConnected: boolean, reconnectAttempts: number) => {
    if (!isConnected && reconnectAttempts > 0) {
      return 'RECONNECTING';
    }
    return isConnected ? 'CONNECTED' : 'DISCONNECTED';
  };

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-4 py-2 bg-base-200/50 border border-base-300 rounded-lg">
      {/* Your connection status */}
      <div className={`flex items-center gap-3 ${isAttacker ? 'text-red-300' : 'text-blue-300'}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {getConnectionIcon(connectionStatus.isConnected, connectionStatus.reconnectAttempts)}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold font-mono">
              {playerName} ({isAttacker ? 'ATTACKER' : 'DEFENDER'})
            </span>
            <span className="text-xs opacity-75">
              {getConnectionText(connectionStatus.isConnected, connectionStatus.reconnectAttempts)}
            </span>
          </div>
        </div>
        
        {connectionStatus.isConnected && (
          <div className="text-xs opacity-60">
            {formatLatency(connectionStatus.latency)}
          </div>
        )}
      </div>

      {/* VS Divider */}
      <div className="text-base-content/50 font-bold text-lg mx-4">
        VS
      </div>

      {/* Opponent connection status */}
      <div className={`flex items-center gap-3 ${!isAttacker ? 'text-red-300' : 'text-blue-300'}`}>
        {opponentStatus.isConnected && (
          <div className="text-xs opacity-60">
            {formatLatency(opponentStatus.latency)}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold font-mono">
              {opponentName} ({!isAttacker ? 'ATTACKER' : 'DEFENDER'})
            </span>
            <span className="text-xs opacity-75">
              {getConnectionText(opponentStatus.isConnected, 0)}
            </span>
          </div>
          <span className="text-lg">
            {getConnectionIcon(opponentStatus.isConnected, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatusIndicator;

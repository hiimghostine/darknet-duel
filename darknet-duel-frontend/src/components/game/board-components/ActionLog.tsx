import React, { useMemo } from 'react';
import { Clock, Zap, Shield, Sword, SkipForward, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import type { GameState, GameAction } from '../../../types/game.types';

interface ActionLogProps {
  G: GameState;
  maxActions?: number;
}

const ActionLog: React.FC<ActionLogProps> = ({ G, maxActions = 8 }) => {
  // Get the most recent actions
  const recentActions = useMemo(() => {
    if (!G?.actions || G.actions.length === 0) return [];
    
    // Get the last N actions and reverse to show most recent first
    return [...G.actions].slice(-maxActions).reverse();
  }, [G?.actions, maxActions]);

  // Format action type to readable text
  const formatActionType = (action: GameAction): string => {
    const { actionType, payload } = action;
    
    switch (actionType) {
      case 'playCard':
        return payload?.cardName ? `Played ${payload.cardName}` : 'Played card';
      case 'throwCard':
        return payload?.cardName && payload?.targetName 
          ? `Threw ${payload.cardName} at ${payload.targetName}`
          : 'Threw card at target';
      case 'cycleCard':
        return payload?.cardName ? `Cycled ${payload.cardName}` : 'Cycled card';
      case 'endTurn':
        return 'Ended turn';
      case 'skipReaction':
        return 'Skipped reaction';
      case 'surrender':
        return 'Surrendered';
      case 'drawCard':
        return `Drew ${payload?.count || 1} card(s)`;
      case 'gainActionPoints':
        return `Gained ${payload?.amount || 0} AP`;
      case 'spendActionPoints':
        return `Spent ${payload?.amount || 0} AP`;
      case 'infrastructureSecured':
        return `Secured ${payload?.name || 'infrastructure'}`;
      case 'infrastructureBreached':
        return `Breached ${payload?.name || 'infrastructure'}`;
      case 'infrastructureMonitored':
        return `Monitored ${payload?.name || 'infrastructure'}`;
      default:
        return actionType.replace(/([A-Z])/g, ' $1').trim();
    }
  };

  // Get icon for action type
  const getActionIcon = (action: GameAction) => {
    const { actionType } = action;
    const iconClass = "w-3.5 h-3.5";
    
    switch (actionType) {
      case 'playCard':
      case 'throwCard':
        return <Zap className={iconClass} />;
      case 'cycleCard':
        return <RefreshCw className={iconClass} />;
      case 'endTurn':
      case 'skipReaction':
        return <SkipForward className={iconClass} />;
      case 'surrender':
        return <XCircle className={iconClass} />;
      case 'infrastructureSecured':
        return <Shield className={iconClass} />;
      case 'infrastructureBreached':
        return <Sword className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  // Get role color class
  const getRoleColorClass = (role: string): string => {
    return role === 'attacker' ? 'text-red-400' : 'text-blue-400';
  };

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
      {recentActions.length > 0 ? (
        recentActions.map((action, index) => {
          const roleColor = getRoleColorClass(action.playerRole);
          const isAttacker = action.playerRole === 'attacker';
          
          return (
            <div 
              key={`${action.timestamp}-${index}`}
              className="flex items-start gap-2 p-2 bg-base-300/30 border border-primary/10 rounded-lg text-xs font-mono"
            >
              {/* Icon */}
              <div className={`flex-shrink-0 mt-0.5 ${roleColor}`}>
                {getActionIcon(action)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${roleColor} uppercase text-[10px]`}>
                    {isAttacker ? '🎯 ATK' : '🛡️ DEF'}
                  </span>
                  <span className="text-base-content/60 text-[10px] flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimestamp(action.timestamp)}
                  </span>
                </div>
                <div className="text-base-content/80 truncate">
                  {formatActionType(action)}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-base-content/50 py-8">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="font-mono text-xs">NO ACTIONS YET</div>
          <div className="font-mono text-[10px] mt-1">Actions will appear here</div>
        </div>
      )}
    </div>
  );
};

export default ActionLog;


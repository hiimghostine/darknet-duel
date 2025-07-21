import React, { useMemo } from 'react';
import type { GameState, InfrastructureCard } from '../../../types/game.types';
import TemporaryEffectsDisplay from './TemporaryEffectsDisplay';

export interface InfrastructureGridProps {
  G: GameState;
  playerID: string | null;
  targetMode: boolean;
  validTargets: string[];
  targetedInfraId: string | null;
  isAttacker: boolean;
  onInfrastructureTarget: (infraId: string) => void;
}

const InfrastructureGrid: React.FC<InfrastructureGridProps> = ({
  G,
  playerID,
  targetMode,
  validTargets,
  targetedInfraId,
  isAttacker,
  onInfrastructureTarget
}) => {
  // Get optimized infrastructure data
  const optimizedInfrastructureData = useMemo(() => ({
    cards: G?.infrastructure || [],
    length: G?.infrastructure?.length || 0,
    states: G?.infrastructure?.map(infra => ({ id: infra.id, state: infra.state })) || []
  }), [G?.infrastructure]);

  // Helper function to get infrastructure state classes
  const getInfraStateClasses = (state: string) => {
    switch (state) {
      case 'secure':
        return 'bg-green-900/70 border-green-500 text-base-content shadow-green-500/30';
      case 'vulnerable':
        return 'bg-amber-900/70 border-amber-500 text-base-content shadow-amber-500/40 animate-pulse';
      case 'compromised':
        return 'bg-red-900/80 border-red-500 text-base-content shadow-red-500/50 animate-pulse';
      case 'fortified':
        return 'bg-blue-900/70 border-blue-500 text-base-content shadow-blue-500/40';
      case 'shielded':
        return 'bg-purple-900/70 border-purple-500 text-base-content shadow-purple-500/40';
      default:
        return isAttacker 
          ? 'bg-red-900/60 border-red-600 text-base-content' 
          : 'bg-blue-900/60 border-blue-600 text-base-content';
    }
  };

  const infrastructure = optimizedInfrastructureData.cards;
  
  // Get temporary effects from game state
  const temporaryEffects = G.temporaryEffects || [];
  
  // Get persistent effects from game state
  const persistentEffects = G.persistentEffects || [];
  
  // Debug persistent effects
  if (persistentEffects.length > 0) {
    console.log('🎯 PERSISTENT EFFECTS DEBUG:', persistentEffects);
    console.log('🎯 Current player ID:', playerID);
  }
  
  return (
    <div className="flex flex-wrap gap-3 justify-center items-center max-w-full">
      {infrastructure.map((infra) => {
        const isTargetable = targetMode && validTargets.includes(infra.id);
        const isSelected = targetMode && targetedInfraId === infra.id;
        
        // Filter effects that apply to this specific infrastructure card
        const infraEffects = temporaryEffects.filter((effect: any) => effect.targetId === infra.id);
        
        // Filter persistent effects that apply to this infrastructure
        // Show monitoring indicators to BOTH players, but rewards only go to the effect owner
        const infraPersistentEffects = persistentEffects.filter((effect: any) =>
          effect.targetId === infra.id
        );
        
        // Check if this infrastructure has any monitoring effects
        const hasMonitoringEffects = infraPersistentEffects.length > 0;
        const hasActiveEffects = infraEffects.length > 0;
        const totalEffectsCount = infraEffects.length + infraPersistentEffects.length;
        
        return (
          <div
            key={infra.id}
            className={`
              group relative lg:w-44 lg:h-56 w-40 h-48 border-2 rounded-xl lg:p-4 p-3
              flex flex-col justify-center items-center transition-all duration-500 cursor-pointer
              font-mono lg:text-base text-sm overflow-visible
              ${getInfraStateClasses(infra.state)}
              ${isTargetable ? 'border-warning shadow-lg shadow-warning/50 scale-105 animate-pulse z-40' : ''}
              ${isSelected ? 'border-accent shadow-xl shadow-accent/70 scale-110 z-50' : ''}
              ${targetMode && !isTargetable ? 'opacity-50 cursor-not-allowed' : ''}
              ${!targetMode ? 'hover:scale-150 hover:z-[9999] hover:shadow-2xl transform-gpu' : ''}
              ${hasMonitoringEffects ? 'ring-2 ring-orange-500/60 ring-offset-2 ring-offset-base-100' : ''}
            `}
            onClick={() => {
              if (targetMode && isTargetable) {
                onInfrastructureTarget(infra.id);
              }
            }}
          >
            {/* Monitoring & Effects Indicators - Top overlay */}
            {(hasMonitoringEffects || hasActiveEffects) && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-[999999] group/effects flex gap-1">
                {/* Monitoring Indicator */}
                {hasMonitoringEffects && (
                  <div className="lg:text-[9px] text-[8px] bg-warning text-base-content rounded-full px-2 py-1 font-bold uppercase animate-pulse shadow-lg border border-warning/50 cursor-help">
                    🎯 MONITORED
                  </div>
                )}
                
                {/* Active Effects Indicator */}
                {hasActiveEffects && (
                  <div className="lg:text-[9px] text-[8px] bg-info text-base-content rounded-full px-2 py-1 font-bold uppercase animate-pulse shadow-lg border border-info/50 cursor-help">
                    ⚡ AFFECTED
                  </div>
                )}
                
                {/* Effects Magnification on Hover */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/effects:opacity-100 transition-all duration-300 bg-base-200/95 backdrop-blur-sm rounded-xl border-2 border-base-content/20 z-[999999] transform scale-110 origin-top shadow-2xl w-72 p-3 pointer-events-none">
                  <div className="text-center mb-2">
                    <div className="font-bold text-sm text-base-content mb-1">Effects & Monitoring</div>
                    <div className="text-xs text-base-content/70">on {infra.name}</div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Persistent Effects Section */}
                    {infraPersistentEffects.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-warning mb-2 uppercase flex items-center gap-1">
                          <span>🎯</span> Monitoring Effects
                        </div>
                        {infraPersistentEffects.map((effect, idx) => (
                          <div key={`persistent-${idx}`} className="bg-warning/10 rounded-lg p-2 border border-warning/30 mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs font-bold text-base-content capitalize">
                                Multi-Stage Malware
                              </div>
                              <div className="text-xs text-warning">
                                {effect.triggered ? 'TRIGGERED' : 'ACTIVE'}
                              </div>
                            </div>
                            <div className="text-[10px] text-base-content/70 mb-1">
                              Condition: {effect.condition.fromState || 'any'} → {effect.condition.toState}
                            </div>
                            <div className="text-[10px] text-base-content/70 mb-1">
                              Reward: +{effect.reward.amount} AP when compromised
                            </div>
                            <div className="text-[10px] text-base-content/70 mb-1">
                              Owner: Player {effect.playerId} {effect.playerId === playerID ? '(You)' : '(Opponent)'}
                            </div>
                            <div className="text-[10px] text-warning/70 italic">
                              Watching for infrastructure compromise...
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Temporary Effects Section */}
                    {infraEffects.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-info mb-2 uppercase flex items-center gap-1">
                          <span>⚡</span> Active Effects
                        </div>
                        {infraEffects.map((effect, idx) => (
                          <div key={`temporary-${idx}`} className="bg-info/10 rounded-lg p-2 border border-info/30 mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs font-bold text-base-content capitalize">
                                {effect.type.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-info">
                                {effect.duration} turn{effect.duration !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="text-[10px] text-base-content/70">
                              Source: {effect.sourceCardId}
                            </div>
                            {effect.type === 'prevent_reactions' && (
                              <div className="text-[10px] text-info/70 mt-1 italic">
                                Blocks reaction cards from targeting this infrastructure
                              </div>
                            )}
                            {effect.type === 'prevent_restore' && (
                              <div className="text-[10px] text-info/70 mt-1 italic">
                                Prevents restoration effects on this infrastructure
                              </div>
                            )}
                            {effect.type === 'cost_reduction' && (
                              <div className="text-[10px] text-info/70 mt-1 italic">
                                Reduces action point costs when targeting this
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Compact Infrastructure Card View */}
            <div className="group-hover:opacity-0 transition-opacity duration-300 flex flex-col justify-between h-full text-center p-1">
              {/* Top section - ID and Type Icon */}
              <div className="flex items-center justify-between w-full mb-1">
                <div className="lg:text-xs text-[10px] bg-base-300 text-base-content rounded px-1.5 py-1 font-semibold">
                  {infra.id}
                </div>
                <div className="lg:text-3xl text-2xl">
                  {infra.type === 'network' ? '🌐' :
                   infra.type === 'data' ? '💾' :
                   infra.type === 'web' ? '🖥️' :
                   infra.type === 'user' ? '👤' :
                   infra.type === 'critical' ? '🔧' : '⚙️'}
                </div>
              </div>
              
              {/* Middle section - Infrastructure name */}
              <div className="flex-1 flex items-center justify-center mb-2">
                <div className="font-bold lg:text-sm text-xs leading-tight px-1 text-center">
                  {infra.name.length > 16 ? infra.name.substring(0, 16) + '...' : infra.name}
                </div>
              </div>
              
              {/* Bottom section - Type and Vulnerabilities */}
              <div className="space-y-2">
                <div className="lg:text-xs text-[10px] font-semibold uppercase text-base-content/70 text-center">
                  {infra.type} Infra
                </div>
                
                {/* Vulnerability categories - show all vectors */}
                {(infra as any).vulnerableVectors && (infra as any).vulnerableVectors.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {(infra as any).vulnerableVectors.slice(0, 3).map((vector: string, idx: number) => (
                      <div key={idx} className={`
                        inline-block lg:text-[9px] text-[8px] rounded-full px-2 py-1 font-bold uppercase tracking-wide text-base-content
                        ${vector === 'network' ? 'bg-blue-600' :
                          vector === 'web' ? 'bg-green-600' :
                          vector === 'social' ? 'bg-purple-600' :
                          vector === 'physical' ? 'bg-orange-600' :
                          vector === 'malware' ? 'bg-red-600' :
                          'bg-gray-600'}
                      `}>
                        {vector}
                      </div>
                    ))}
                    {(infra as any).vulnerableVectors.length > 3 && (
                      <div className="inline-block lg:text-[9px] text-[8px] bg-base-300 text-base-content rounded-full px-2 py-1 font-bold">
                        +{(infra as any).vulnerableVectors.length - 3}
                      </div>
                    )}
                  </div>
                )}
                
                {/* State indicator */}
                <div className={`
                  lg:text-[10px] text-[9px] font-bold px-2 py-1 rounded uppercase text-center text-base-content
                  ${infra.state === 'compromised' ? 'bg-red-600' :
                    infra.state === 'fortified' ? 'bg-blue-600' :
                    infra.state === 'vulnerable' ? 'bg-amber-600' :
                    infra.state === 'shielded' ? 'bg-purple-600' :
                    'bg-green-600'}
                `}>
                  {infra.state}
                </div>
              </div>
            </div>

            {/* Expanded Infrastructure Card View (on hover) - Card-like proportions */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-base-200/95 backdrop-blur-sm rounded-xl border-2 border-base-content/20 z-[99999] transform scale-125 origin-center shadow-2xl w-48 h-72 p-2.5 flex flex-col pointer-events-none">
              {/* Infrastructure Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-base-content
                    ${infra.state === 'compromised' ? 'bg-red-600' :
                      infra.state === 'fortified' ? 'bg-blue-600' :
                      infra.state === 'vulnerable' ? 'bg-amber-600' :
                      infra.state === 'shielded' ? 'bg-purple-600' :
                      'bg-green-600'}
                  `}>
                    {infra.state === 'compromised' ? '💥' :
                     infra.state === 'fortified' ? '🛡️' :
                     infra.state === 'vulnerable' ? '⚠️' :
                     infra.state === 'shielded' ? '🔒' :
                     '✅'}
                  </div>
                  <div className="text-xs bg-base-300 text-base-content rounded px-1.5 py-0.5 font-semibold uppercase">
                    {infra.id}
                  </div>
                </div>
                <div className="text-xl">
                  {infra.type === 'network' ? '🌐' :
                   infra.type === 'data' ? '💾' :
                   infra.type === 'web' ? '🖥️' :
                   infra.type === 'user' ? '👤' :
                   infra.type === 'critical' ? '🔧' : '⚙️'}
                </div>
              </div>

              {/* Infrastructure Name and Type */}
              <div className="text-center mb-2 border-b border-current/30 pb-2">
                <div className="font-bold text-sm text-base-content leading-tight mb-1">
                  {infra.name}
                </div>
                <div className="text-xs opacity-70 uppercase text-base-content/70 font-semibold">
                  {infra.type} Infrastructure
                </div>
                <div className={`
                  mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded uppercase text-base-content
                  ${infra.state === 'compromised' ? 'bg-red-600' :
                    infra.state === 'fortified' ? 'bg-blue-600' :
                    infra.state === 'vulnerable' ? 'bg-amber-600' :
                    infra.state === 'shielded' ? 'bg-purple-600' :
                    'bg-green-600'}
                `}>
                  {infra.state}
                </div>
              </div>

              {/* Infrastructure Description */}
              <div className="flex-1 mb-2">
                <div className="text-xs text-base-content/70 leading-tight mb-2">
                  {infra.description}
                </div>
                
                {/* Vulnerabilities Section */}
                {((infra as any).vulnerableVectors && (infra as any).vulnerableVectors.length > 0) || ((infra as any).vulnerabilities && (infra as any).vulnerabilities.length > 0) && (
                  <div className="mb-2">
                    <div className="text-[10px] font-bold text-error mb-1 uppercase">Vulnerable To:</div>
                    <div className="flex flex-wrap gap-1">
                      {/* Show vulnerableVectors if available */}
                      {(infra as any).vulnerableVectors && (infra as any).vulnerableVectors.map((vector: string, idx: number) => (
                        <span key={`vector-${idx}`} className="text-[10px] text-error bg-error/10 rounded px-1.5 py-0.5">
                          {vector.toUpperCase()}
                        </span>
                      ))}
                      {/* Show vulnerabilities if available and different from vulnerableVectors */}
                      {(infra as any).vulnerabilities && (infra as any).vulnerabilities.map((vuln: string, idx: number) => (
                        <span key={`vuln-${idx}`} className="text-[10px] text-error bg-error/10 rounded px-1.5 py-0.5">
                          {vuln.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flavor Text */}
                {(infra as any).flavor && (
                  <div className="border-t border-current/20 pt-1.5">
                    <div className="text-[10px] italic text-warning leading-tight">
                      "{(infra as any).flavor}"
                    </div>
                  </div>
                )}
              </div>

              {/* Infrastructure Footer - Additional Info */}
              <div className="space-y-1">
                {/* Security Level Indicator */}
                <div className="text-center">
                  <div className={`
                    text-[10px] font-bold py-0.5 px-1.5 rounded text-base-content
                    ${infra.state === 'compromised' ? 'bg-red-600' :
                      infra.state === 'fortified' ? 'bg-blue-600' :
                      infra.state === 'vulnerable' ? 'bg-amber-600' :
                      infra.state === 'shielded' ? 'bg-purple-600' :
                      'bg-green-600'}
                  `}>
                    Security: {infra.state === 'compromised' ? 'BREACHED' :
                              infra.state === 'fortified' ? 'FORTIFIED' :
                              infra.state === 'vulnerable' ? 'AT RISK' :
                              infra.state === 'shielded' ? 'SHIELDED' :
                              'SECURE'}
                  </div>
                </div>

                {/* Infrastructure Type Category */}
                <div className="text-center text-[10px] bg-base-300 text-base-content/70 py-0.5 px-1.5 rounded">
                  Category: {infra.type.charAt(0).toUpperCase() + infra.type.slice(1)}
                </div>
                
                {/* Effects Display for detailed view */}
                {(infraEffects.length > 0 || infraPersistentEffects.length > 0) && (
                  <div className="mt-2 pt-2 border-t border-current/20">
                    {/* Persistent Effects */}
                    {infraPersistentEffects.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-bold text-warning mb-1 uppercase flex items-center gap-1">
                          <span>🎯</span> Monitoring:
                        </div>
                        <div className="space-y-1">
                          {infraPersistentEffects.map((effect, idx) => (
                            <div key={`persist-${idx}`} className="text-[9px] text-warning bg-warning/10 rounded px-1.5 py-0.5">
                              <span className="font-semibold">Multi-Stage Malware:</span> +{effect.reward.amount} AP on compromise
                              <div className="text-[8px] text-warning/70 mt-0.5">
                                Owner: Player {effect.playerId} {effect.playerId === playerID ? '(You)' : '(Opponent)'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Temporary Effects */}
                    {infraEffects.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-info mb-1 uppercase flex items-center gap-1">
                          <span>⚡</span> Active Effects:
                        </div>
                        <TemporaryEffectsDisplay
                          effects={infraEffects}
                          targetInfrastructure={infra}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(InfrastructureGrid);
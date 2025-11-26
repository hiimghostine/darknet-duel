import React, { useMemo, useState } from 'react';
import { 
  Globe, Database, Monitor, User as UserIcon, Wrench, 
  CheckCircle, AlertTriangle, Flame, ShieldCheck, Lock,
  Target, Eye, Zap
} from 'lucide-react';
import type { GameState, InfrastructureCard } from '../../../types/game.types';
import TemporaryEffectsDisplay from './TemporaryEffectsDisplay';
import { useResponsiveGameScaling } from '../../../hooks/useResponsiveGameScaling';
import { useTheme } from '../../../store/theme.store';

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
  // Track which card is being hovered for magnification
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  
  // Get responsive scaling configuration
  const scaling = useResponsiveGameScaling();
  
  // Get theme for conditional styling
  const theme = useTheme();
  
  // Get optimized infrastructure data
  const optimizedInfrastructureData = useMemo(() => ({
    cards: G?.infrastructure || [],
    length: G?.infrastructure?.length || 0,
    states: G?.infrastructure?.map(infra => ({ id: infra.id, state: infra.state })) || []
  }), [G?.infrastructure]);
  
  // Calculate infrastructure card dimensions (slightly larger than player cards)
  const infraWidth = scaling.breakpoint === 'lg' || scaling.breakpoint === 'xl' || scaling.breakpoint === '2xl'
    ? scaling.cardWidthLg * 1.6
    : scaling.cardWidth * 1.7;
  const infraHeight = scaling.breakpoint === 'lg' || scaling.breakpoint === 'xl' || scaling.breakpoint === '2xl'
    ? scaling.cardHeightLg * 1.4
    : scaling.cardHeight * 1.4;
  
  // Expanded infrastructure card dimensions
  const expandedInfraWidth = scaling.expandedCardWidth * 0.80;
  const expandedInfraHeight = scaling.expandedCardHeight * 0.80;

  // Helper function to get infrastructure type icon
  const getInfraTypeIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <Globe className="w-5 h-5" />;
      case 'data':
        return <Database className="w-5 h-5" />;
      case 'web':
        return <Monitor className="w-5 h-5" />;
      case 'user':
        return <UserIcon className="w-5 h-5" />;
      case 'critical':
        return <Wrench className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  // Helper function to get infrastructure state icon
  const getInfraStateIcon = (state: string) => {
    switch (state) {
      case 'secure':
        return <CheckCircle className="w-4 h-4" />;
      case 'vulnerable':
        return <AlertTriangle className="w-4 h-4" />;
      case 'compromised':
        return <Flame className="w-4 h-4" />;
      case 'fortified':
        return <Lock className="w-4 h-4" />;
      case 'shielded':
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  // Helper function to get infrastructure state classes
  const getInfraStateClasses = (state: string) => {
    const isLight = theme === 'cyberpunk';
    
    switch (state) {
      case 'secure':
        return isLight 
          ? 'bg-green-100/90 border-green-600 text-green-900 shadow-green-600/50'
          : 'bg-green-900/70 border-green-500 text-base-content shadow-green-500/30';
      case 'vulnerable':
        return isLight
          ? 'bg-amber-100/90 border-amber-600 text-amber-900 shadow-amber-600/60 animate-pulse'
          : 'bg-amber-900/70 border-amber-500 text-base-content shadow-amber-500/40 animate-pulse';
      case 'compromised':
        return isLight
          ? 'bg-red-100/90 border-red-600 text-red-900 shadow-red-600/70 animate-pulse'
          : 'bg-red-900/80 border-red-500 text-base-content shadow-red-500/50 animate-pulse';
      case 'fortified':
        return isLight
          ? 'bg-blue-100/90 border-blue-600 text-blue-900 shadow-blue-600/60'
          : 'bg-blue-900/70 border-blue-500 text-base-content shadow-blue-500/40';
      case 'shielded':
        return isLight
          ? 'bg-purple-100/90 border-purple-600 text-purple-900 shadow-purple-600/60'
          : 'bg-purple-900/70 border-purple-500 text-base-content shadow-purple-500/40';
      default:
        return isLight
          ? isAttacker 
            ? 'bg-red-50/90 border-red-600 text-red-900' 
            : 'bg-blue-50/90 border-blue-600 text-blue-900'
          : isAttacker 
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
    <div 
      className="relative flex flex-wrap justify-center items-center max-w-full"
      style={{ gap: `${scaling.cardGap}px` }}
    >
      {infrastructure.map((infra, index) => {
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
            data-infra-id={infra.id}
            className={`
              group relative border-2 rounded-xl
              flex flex-col justify-center items-center transition-all duration-500 cursor-pointer
              font-mono overflow-visible
              ${getInfraStateClasses(infra.state).replace(' animate-pulse', '')}
              ${isTargetable 
                ? theme === 'cyberpunk'
                  ? 'border-warning shadow-lg shadow-warning/80 scale-105 animate-pulse z-40 ring-2 ring-warning/50'
                  : 'border-warning shadow-lg shadow-warning/50 scale-105 animate-pulse z-40'
                : ''
              }
              ${isSelected 
                ? theme === 'cyberpunk'
                  ? 'border-accent shadow-xl shadow-accent/90 scale-110 z-50 ring-2 ring-accent/60'
                  : 'border-accent shadow-xl shadow-accent/70 scale-110 z-50'
                : ''
              }
              ${targetMode && !isTargetable ? 'opacity-50 cursor-not-allowed' : ''}
              ${!targetMode ? 'hover:z-[9999] hover:shadow-2xl transform-gpu' : ''}
              ${hasMonitoringEffects 
                ? theme === 'cyberpunk'
                  ? 'ring-2 ring-orange-600/70 ring-offset-2 ring-offset-base-100'
                  : 'ring-2 ring-orange-500/60 ring-offset-2 ring-offset-base-100'
                : ''
              }
            `}
            style={{
              width: `${infraWidth}px`,
              height: `${infraHeight}px`,
              padding: `${scaling.containerPadding}px`,
              fontSize: scaling.breakpoint === 'lg' || scaling.breakpoint === 'xl' || scaling.breakpoint === '2xl' ? '16px' : '14px'
            }}
            onClick={() => {
              if (targetMode && isTargetable) {
                onInfrastructureTarget(infra.id);
              }
            }}
            onMouseEnter={() => setHoveredCardId(infra.id)}
            onMouseLeave={() => setHoveredCardId(null)}
          >

            {/* Compact Infrastructure Card View */}
            <div className={`group-hover:opacity-0 group-hover:invisible transition-all duration-300 flex flex-col justify-between h-full text-center p-1 ${(infra.state === 'vulnerable' || infra.state === 'compromised') ? 'animate-pulse' : ''}`}>
              {/* Top section - ID and Type Icon */}
              <div className="flex items-center justify-between w-full mb-1">
                <div className="lg:text-xs text-[10px] bg-base-300 text-base-content rounded px-1.5 py-1 font-semibold font-mono">
                  {infra.id}
                </div>
                <div className={`
                  lg:w-10 lg:h-10 w-8 h-8 rounded-lg flex items-center justify-center
                  ${infra.state === 'secure' ? 'bg-success/20 text-success border border-success/30' :
                    infra.state === 'vulnerable' ? 'bg-warning/20 text-warning border border-warning/30' :
                    infra.state === 'compromised' ? 'bg-error/20 text-error border border-error/30' :
                    infra.state === 'fortified' ? 'bg-info/20 text-info border border-info/30' :
                    infra.state === 'shielded' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-base-300/50 text-base-content/50 border border-base-content/20'
                  }
                `}>
                  {getInfraTypeIcon(infra.type)}
                </div>
              </div>
              
              {/* Middle section - Infrastructure name */}
              <div className="flex-1 flex items-center justify-center mb-2">
                <div className="font-bold lg:text-sm text-xs leading-tight px-1 text-center break-words">
                  {infra.name}
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
                        inline-block lg:text-[10px] text-[9px] rounded-full px-2 py-1 font-bold uppercase tracking-wide text-white
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
                  flex items-center justify-center gap-1.5 lg:text-[10px] text-[9px] font-bold px-2 py-1.5 rounded-lg uppercase text-center text-white
                  ${infra.state === 'compromised' ? 'bg-error/90 border border-error' :
                    infra.state === 'fortified' ? 'bg-info/90 border border-info' :
                    infra.state === 'vulnerable' ? 'bg-warning/90 border border-warning' :
                    infra.state === 'shielded' ? 'bg-purple-600/90 border border-purple-500' :
                    'bg-success/90 border border-success'}
                `}>
                  <div className="lg:w-3 lg:h-3 w-2.5 h-2.5">
                    {getInfraStateIcon(infra.state)}
                  </div>
                  <span>{infra.state}</span>
                </div>
              </div>
            </div>

            {/* Expanded Infrastructure Card View (on hover) - Scaled for readability */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-base-200/95 backdrop-blur-sm rounded-lg border-2 border-base-content/20 z-[99999] shadow-2xl flex flex-col pointer-events-none transform scale-125 origin-center"
              style={{
                width: `${expandedInfraWidth}px`,
                height: `${expandedInfraHeight}px`,
                padding: `${scaling.containerPadding}px`
              }}
            >
              {/* Infrastructure Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`
                    w-6 h-6 rounded-lg flex items-center justify-center text-white
                    ${infra.state === 'compromised' ? 'bg-error/90 border border-error' :
                      infra.state === 'fortified' ? 'bg-info/90 border border-info' :
                      infra.state === 'vulnerable' ? 'bg-warning/90 border border-warning' :
                      infra.state === 'shielded' ? 'bg-purple-600/90 border border-purple-500' :
                      'bg-success/90 border border-success'}
                  `}>
                    <div className="w-3.5 h-3.5">
                      {getInfraStateIcon(infra.state)}
                    </div>
                  </div>
                  <div className="text-xs bg-base-300 text-base-content rounded px-1.5 py-0.5 font-semibold font-mono uppercase">
                    {infra.id}
                  </div>
                </div>
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${infra.state === 'secure' ? 'bg-success/20 text-success border border-success/30' :
                    infra.state === 'vulnerable' ? 'bg-warning/20 text-warning border border-warning/30' :
                    infra.state === 'compromised' ? 'bg-error/20 text-error border border-error/30' :
                    infra.state === 'fortified' ? 'bg-info/20 text-info border border-info/30' :
                    infra.state === 'shielded' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-base-300/50 text-base-content/50 border border-base-content/20'
                  }
                `}>
                  {getInfraTypeIcon(infra.type)}
                </div>
              </div>

              {/* Infrastructure Name and Type */}
              <div className="text-center mb-1.5 border-b border-current/30 pb-1.5">
                <div className="font-bold text-sm text-base-content leading-tight mb-0.5">
                  {infra.name}
                </div>
                <div className="text-[11px] opacity-70 uppercase text-base-content/70 font-semibold">
                  {infra.type} Infrastructure
                </div>
                <div className={`
                  mt-0.5 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded uppercase text-white
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
              <div className="flex-1 mb-1.5">
                <div className="text-[11px] text-base-content/70 leading-tight mb-1.5">
                  {infra.description}
                </div>
                
                {/* Attack Vectors Section */}
                {(infra as any).vulnerableVectors && (infra as any).vulnerableVectors.length > 0 && (
                  <div className="mb-1.5">
                    <div className="text-[10px] font-bold text-base-content/70 mb-0.5 uppercase">Attack Vectors:</div>
                    <div className="flex flex-wrap gap-0.5">
                      {(infra as any).vulnerableVectors.map((vector: string, idx: number) => (
                        <div key={idx} className={`
                          inline-block text-[10px] rounded-full px-2 py-0.5 font-bold uppercase tracking-wide text-white
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
                    </div>
                  </div>
                )}

                {/* Flavor Text */}
                {(infra as any).flavor && (
                  <div className="border-t border-current/20 pt-1">
                    <div className="text-[10px] italic text-warning leading-tight">
                      "{(infra as any).flavor}"
                    </div>
                  </div>
                )}
              </div>

              {/* Infrastructure Footer - Additional Info */}
              <div className="text-center">
                {/* Security Level Indicator */}
                <div className={`
                  text-[10px] font-bold py-0.5 px-1.5 rounded text-white
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
            </div>
          </div>
        );
      })}
      
      {/* Effects Overlay Layer - Completely separate from card hover zones */}
      {infrastructure.map((infra, index) => {
        // Filter effects that apply to this specific infrastructure card
        const infraEffects = temporaryEffects.filter((effect: any) => effect.targetId === infra.id);
        
        // Filter persistent effects that apply to this infrastructure
        const infraPersistentEffects = persistentEffects.filter((effect: any) =>
          effect.targetId === infra.id
        );
        
        // Check if this infrastructure has any monitoring effects
        const hasMonitoringEffects = infraPersistentEffects.length > 0;
        const hasActiveEffects = infraEffects.length > 0;
        
        if (!hasMonitoringEffects && !hasActiveEffects) {
          return null;
        }
        
        // Calculate position based on card index and grid layout using actual responsive dimensions
        const cardsPerRow = Math.floor((window.innerWidth || 1200) / (infraWidth + scaling.cardGap));
        const row = Math.floor(index / cardsPerRow);
        const col = index % cardsPerRow;
        
        const left = col * (infraWidth + scaling.cardGap) + infraWidth / 2;
        const top = row * (infraHeight + scaling.cardGap) - 48; // -48px for -top-12
        
        return (
          <div
            key={`effects-${infra.id}`}
            className={`absolute z-[9999] group/effects flex gap-1 pointer-events-none transition-opacity duration-300 ${
              hoveredCardId === infra.id ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              left: `${left}px`,
              top: `${top}px`,
              transform: 'translateX(-50%)'
            }}
          >
            {/* Monitoring Indicator */}
            {hasMonitoringEffects && (
              <div className="lg:text-xs text-[10px] bg-warning/90 text-warning-content rounded-full px-3 py-1.5 font-bold uppercase animate-pulse shadow-lg border border-warning cursor-help pointer-events-auto flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                <span className="hidden lg:inline">MONITORED</span>
              </div>
            )}
            
            {/* Active Effects Indicator */}
            {hasActiveEffects && (
              <div className="lg:text-xs text-[10px] bg-info/90 text-info-content rounded-full px-3 py-1.5 font-bold uppercase animate-pulse shadow-lg border border-info cursor-help pointer-events-auto flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                <span className="hidden lg:inline">AFFECTED</span>
              </div>
            )}
            
            {/* Effects Magnification on Hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 group-hover/effects:opacity-100 transition-all duration-300 bg-base-200/95 backdrop-blur-sm rounded-xl border-2 border-base-content/20 z-[99999] transform scale-110 origin-top shadow-2xl w-72 p-3 pointer-events-none">
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
        );
      })}
    </div>
  );
};

export default React.memo(InfrastructureGrid);
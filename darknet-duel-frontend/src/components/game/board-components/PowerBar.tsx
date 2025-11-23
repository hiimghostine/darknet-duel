import React from 'react';
import { Sword, Shield, Zap } from 'lucide-react';

interface PowerBarProps {
  attackerScore: number;
  defenderScore: number;
  totalInfrastructure: number;
}

/**
 * Cyberpunk-themed PowerBar component displays the balance of power between attacker and defender
 * It visualizes which player is currently leading based on infrastructure control
 */
const PowerBar: React.FC<PowerBarProps> = ({ 
  attackerScore, 
  defenderScore,
  totalInfrastructure 
}) => {
  // Calculate percentages for the bar
  const attackerPercent = Math.round((attackerScore / totalInfrastructure) * 100) || 0;
  const defenderPercent = Math.round((defenderScore / totalInfrastructure) * 100) || 0;
  const neutralPercent = 100 - attackerPercent - defenderPercent;
  
  // Determine who's leading
  const attackerLeading = attackerScore > defenderScore;
  const defenderLeading = defenderScore > attackerScore;
  const tied = attackerScore === defenderScore;
  
  return (
    <div className="w-full space-y-3">
      {/* Score Display */}
      <div className="flex items-center justify-between">
        {/* Attacker Score */}
        <div className={`flex items-center gap-2 ${attackerLeading ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${attackerLeading 
              ? 'bg-red-500/30 border-2 border-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
              : 'bg-red-500/10 border border-red-500/30'
            }
          `}>
            <Sword className={`w-5 h-5 ${attackerLeading ? 'text-red-400' : 'text-red-500/60'}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-red-400/70 font-mono uppercase tracking-wider">ATK</span>
            <span className={`
              text-2xl font-bold font-mono
              ${attackerLeading ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-red-500/70'}
            `}>
              {attackerScore}
            </span>
          </div>
        </div>

        {/* Center Icon */}
        <div className="flex flex-col items-center">
          <Zap className={`w-5 h-5 ${tied ? 'text-warning animate-pulse' : 'text-base-content/40'}`} />
          <span className="text-[9px] text-base-content/50 font-mono mt-0.5">
            {tied ? 'TIED' : attackerLeading ? 'ATK LEAD' : 'DEF LEAD'}
          </span>
        </div>

        {/* Defender Score */}
        <div className={`flex items-center gap-2 ${defenderLeading ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-blue-400/70 font-mono uppercase tracking-wider">DEF</span>
            <span className={`
              text-2xl font-bold font-mono
              ${defenderLeading ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-blue-500/70'}
            `}>
              {defenderScore}
            </span>
          </div>
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${defenderLeading 
              ? 'bg-blue-500/30 border-2 border-blue-500 shadow-lg shadow-blue-500/50 animate-pulse' 
              : 'bg-blue-500/10 border border-blue-500/30'
            }
          `}>
            <Shield className={`w-5 h-5 ${defenderLeading ? 'text-blue-400' : 'text-blue-500/60'}`} />
          </div>
        </div>
      </div>

      {/* Cyberpunk Power Bar */}
      <div className="relative">
        {/* Background with scan lines effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-base-300/50 via-base-200/50 to-base-300/50 rounded-full overflow-hidden">
          {/* Animated scan line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse" />
        </div>

        {/* Main Power Bar */}
        <div className="relative h-8 rounded-full overflow-hidden border-2 border-base-content/20 shadow-inner">
          {/* Attacker segment */}
          <div 
            className={`
              absolute left-0 top-0 h-full transition-all duration-500 ease-out
              bg-gradient-to-r from-red-600 via-red-500 to-red-600
              ${attackerPercent > 0 ? 'shadow-[0_0_15px_rgba(239,68,68,0.6)]' : ''}
              ${attackerLeading ? 'animate-pulse' : ''}
            `}
            style={{ width: `${attackerPercent}%` }}
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-red-300/30 to-transparent" />
            {/* Scan line animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </div>

          {/* Defender segment */}
          <div 
            className={`
              absolute right-0 top-0 h-full transition-all duration-500 ease-out
              bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600
              ${defenderPercent > 0 ? 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' : ''}
              ${defenderLeading ? 'animate-pulse' : ''}
            `}
            style={{ width: `${defenderPercent}%` }}
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-300/30 to-transparent" />
            {/* Scan line animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </div>

          {/* Center neutral zone indicator */}
          {neutralPercent > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="h-full bg-base-300/80 border-x border-base-content/10"
                style={{ 
                  width: `${neutralPercent}%`,
                  marginLeft: `${attackerPercent}%`
                }}
              >
                <div className="h-full w-full bg-gradient-to-b from-transparent via-base-content/5 to-transparent" />
              </div>
            </div>
          )}

          {/* Percentage labels on the bar */}
          {attackerPercent > 15 && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-white/90 drop-shadow-lg pointer-events-none">
              {attackerPercent}%
            </div>
          )}
          {defenderPercent > 15 && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-white/90 drop-shadow-lg pointer-events-none">
              {defenderPercent}%
            </div>
          )}
        </div>

        {/* Grid overlay for cyberpunk effect */}
        <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }} />
        </div>
      </div>

      {/* Territory Count */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-base-content/60 font-mono">
        <span className="text-red-400">{attackerScore}</span>
        <span>/</span>
        <span className="text-base-content/40">{totalInfrastructure}</span>
        <span>/</span>
        <span className="text-blue-400">{defenderScore}</span>
        <span className="ml-1 text-base-content/40">NODES</span>
      </div>
    </div>
  );
};

export default PowerBar;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerInfoProps } from './types';

const PlayerInfo: React.FC<PlayerInfoProps> = ({
  player,
  G,
  isOpponent = false,
}) => {
  if (!player || !G) {
    return (
      <div className={`player-info ${isOpponent ? 'opponent-info' : ''}`}>
        <div className="player-name">
          <strong>{isOpponent ? 'Opponent' : 'You'}:</strong> Waiting...
        </div>
        <div className="player-role">
          Role: <span className="role-badge">Loading...</span>
        </div>
      </div>
    );
  }

  // Calculate maintenance costs for display using new formula
  const calculateMaintenanceCosts = () => {
    if (!G?.infrastructure) return null;
    
    const vulnerableCount = G.infrastructure.filter(infra => infra.state === 'vulnerable').length;
    const shieldedCount = G.infrastructure.filter(infra => infra.state === 'shielded').length;
    
    const isAttacker = player.id === G?.attacker?.id;
    const isDefender = player.id === G?.defender?.id;
    
    // Calculate maintenance cost based on new formula (3=1, 4=2, 5=3)
    const calculateMaintenanceCost = (count: number): number => {
      if (count < 3) return 0;
      return count - 2; // 3->1, 4->2, 5->3
    };
    
    let maintenanceCost = 0;
    let costType = '';
    let count = 0;
    
    if (isAttacker && vulnerableCount >= 3) {
      maintenanceCost = calculateMaintenanceCost(vulnerableCount);
      costType = 'vulnerable';
      count = vulnerableCount;
    } else if (isDefender && shieldedCount >= 3) {
      maintenanceCost = calculateMaintenanceCost(shieldedCount);
      costType = 'shielded';
      count = shieldedCount;
    }
    
    return maintenanceCost > 0 ? { cost: maintenanceCost, type: costType, count } : null;
  };

  // Render resource display for the player (only action points as per requirement)
  const renderResources = () => {
    // Get current AP and max AP (10)
    const currentAP = (player as any).actionPoints || 0;
    const maxAP = G?.gameConfig?.maxActionPoints || 10;
    const maintenanceCosts = calculateMaintenanceCosts();
    
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="font-mono font-bold text-primary">
            {currentAP}/{maxAP}
          </span>
        </div>
        {maintenanceCosts && <MaintenanceCostIndicator maintenanceCosts={maintenanceCosts} />}
      </div>
    );
  };

  return (
    <div className={`player-info ${isOpponent ? 'opponent-info' : ''}`}>
      <div className="player-name">
        <strong>{isOpponent ? 'Opponent' : 'You'}:</strong> {player.name || player.id}
      </div>
      <div className="player-role">
        Role: <span className={`role-badge ${player.id === G?.attacker?.id ? 'attacker' : 'defender'}`}>
          {player.id === G?.attacker?.id ? '🎯 Attacker' : '🛡️ Defender'}
        </span>
      </div>
      {renderResources()}
    </div>
  );
};

// Separate component for the maintenance cost indicator with cyberpunk tooltip
const MaintenanceCostIndicator: React.FC<{ maintenanceCosts: { cost: number; type: string; count: number } }> = ({ maintenanceCosts }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.div
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-error/30 to-warning/30 border-2 border-error/60 rounded-lg shadow-lg shadow-error/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: 1,
          boxShadow: [
            "0 0 20px rgba(239, 68, 68, 0.3)",
            "0 0 30px rgba(239, 68, 68, 0.6)",
            "0 0 20px rgba(239, 68, 68, 0.3)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <span className="text-warning text-lg animate-bounce">⚠️</span>
        <span className="text-error font-mono font-bold text-sm">-{maintenanceCosts.cost} AP</span>
        <span className="text-sm opacity-90">{maintenanceCosts.type === 'vulnerable' ? '🎯' : '🛡️'}</span>
        
        {/* Cyberpunk Question Mark Button */}
        <motion.button
          className="btn btn-xs btn-circle btn-ghost text-info hover:bg-info/20 border border-info/40"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xs font-bold">?</span>
        </motion.button>
      </motion.div>

      {/* Cyberpunk Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-full left-0 mb-2 z-50"
          >
            <div className="card bg-base-100 border-2 border-info/60 shadow-2xl shadow-info/30 w-80">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-info text-lg">⚡</span>
                  <h3 className="card-title text-sm text-info uppercase tracking-wider">
                    MAINTENANCE COST PROTOCOL
                  </h3>
                </div>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-warning text-base">🎯</span>
                    <div>
                      <p className="font-bold text-warning">ATTACKER PENALTY:</p>
                      <p className="text-base-content/80">
                        <span className="text-error font-bold">3 vulnerable = 1 AP</span>,
                        <span className="text-error font-bold">4 vulnerable = 2 AP</span>,
                        <span className="text-error font-bold">5 vulnerable = 3 AP</span>
                      </p>
                      <p className="text-warning/80 text-xs mt-1">
                        💥 Can't pay OR left with 0 AP? Random vulnerable infrastructure is lost next round!
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-info text-base">🛡️</span>
                    <div>
                      <p className="font-bold text-info">DEFENDER PENALTY:</p>
                      <p className="text-base-content/80">
                        <span className="text-info font-bold">3 shielded = 1 AP</span>,
                        <span className="text-info font-bold">4 shielded = 2 AP</span>,
                        <span className="text-info font-bold">5 shielded = 3 AP</span>
                      </p>
                      <p className="text-info/80 text-xs mt-1">
                        💥 Can't pay OR left with 0 AP? Random shielded infrastructure is lost next round!
                      </p>
                    </div>
                  </div>

                  <div className="divider my-2"></div>
                  
                  <div className="flex items-center gap-2 p-2 bg-error/10 rounded border border-error/30">
                    <span className="text-error text-base">⚠️</span>
                    <div>
                      <p className="font-bold text-error">CURRENT STATUS:</p>
                      <p className="text-base-content">
                        Paying <span className="font-bold text-error">{maintenanceCosts.cost} AP per round</span> for{" "}
                        <span className="font-bold">{maintenanceCosts.count} {maintenanceCosts.type}</span> infrastructure
                      </p>
                      <p className="text-xs text-base-content/60 mt-1">
                        Formula: {maintenanceCosts.count} infrastructure - 2 = {maintenanceCosts.cost} AP cost per round
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cyberpunk corner decorations */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-info"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-info"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-info"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-info"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerInfo;

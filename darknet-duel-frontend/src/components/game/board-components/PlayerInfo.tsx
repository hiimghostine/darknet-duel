import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerInfoProps } from './types';
import accountService, { type AccountData } from '../../../services/account.service';
import storeService from '../../../services/store.service';
import logo from '../../../assets/logo.png';

const PlayerInfo: React.FC<PlayerInfoProps> = ({
  player,
  G,
  isOpponent = false,
}) => {
  // State for fetched account data
  const [account, setAccount] = useState<Partial<AccountData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIXED: Get UUID from G.playerUuidMap (real UUID, not boardgame.io ID)
  useEffect(() => {
    let isMounted = true;
    const fetchAccount = async () => {
      // ✅ FIXED: Use G.playerUuidMap to get real UUID, fallback to player.id for development
      const realUuid = player?.id && G?.playerUuidMap?.[player.id];
      const userId = realUuid || (player as any)?.uuid || (player as any)?.realUserId || player?.id;
      if (!userId) return;
      
      // Skip API calls for BoardGame.io IDs (development mode)
      if (userId === '0' || userId === '1') {
        console.log(`PlayerInfo: Skipping API call for BoardGame.io ID: ${userId}`);
        if (isMounted) {
          setAccount({
            username: userId === '0' ? 'Player 0' : 'Player 1',
            bio: 'Development mode player'
          });
        }
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        console.log(`PlayerInfo: Fetching account for UUID: ${userId}`);
        const data = await accountService.getAccountByUuid(userId);
        if (isMounted) setAccount(data);
      } catch (e: any) {
        console.warn(`PlayerInfo: Failed to fetch account for ${userId}:`, e);
        if (isMounted) setError('Profile unavailable');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAccount();
    return () => { isMounted = false; };
  }, [player?.id, G?.playerUuidMap, (player as any)?.uuid, (player as any)?.realUserId]);

  // Calculate maintenance costs for display using new formula
  const calculateMaintenanceCosts = () => {
    if (!G?.infrastructure) return null;
    const vulnerableCount = G.infrastructure.filter(infra => infra.state === 'vulnerable').length;
    const shieldedCount = G.infrastructure.filter(infra => infra.state === 'shielded').length;
    
    // ✅ FIXED: Use BoardGame.io ID for game logic comparisons
    const isAttacker = player?.id === '0' || player?.id === G?.attacker?.id;
    const isDefender = player?.id === '1' || player?.id === G?.defender?.id;
    
    const calculateMaintenanceCost = (count: number): number => {
      if (count < 3) return 0;
      return count - 2;
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
    const currentAP = (player as any)?.actionPoints || 0;
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

  // ✅ FIXED: Get avatar URL using correct ID from playerUuidMap
  const getAvatarUrl = () => {
    const realUuid = player?.id && G?.playerUuidMap?.[player.id];
    const userId = realUuid || (player as any)?.uuid || (player as any)?.realUserId;
    // For real users, use their UUID for avatar
    if (userId && userId !== '0' && userId !== '1') {
      return accountService.getAvatarUrl(userId);
    }
    // For development/BoardGame.io IDs, use default logo
    return logo;
  };

  // ✅ FIXED: Determine role using BoardGame.io ID
  const getPlayerRole = () => {
    const isAttacker = player?.id === '0' || player?.id === G?.attacker?.id;
    return isAttacker ? 'attacker' : 'defender';
  };

  // ✅ FIXED: Get display name with better fallbacks
  const getDisplayName = () => {
    if (account?.username) {
      return account.username;
    }
    
    // Use real name from game state if available
    if (player?.name && player.name !== `Player ${player.id}`) {
      return player.name;
    }
    
    // Fallback based on opponent status
    if (isOpponent) {
      return 'Opponent';
    } else {
      return 'You';
    }
  };

  const playerRole = getPlayerRole();

  // Compact cyberpunk profile card (dashboard style, but smaller)
  return (
    <div className={`player-info profile-card-cyber ${isOpponent ? 'opponent-info' : ''} bg-base-200 border border-primary/20 rounded-lg p-2 flex items-center gap-3 relative min-w-0`}>
      {/* Avatar + Decoration */}
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 bg-base-300/50 flex-shrink-0">
        <img
          src={getAvatarUrl()}
          alt={`${getDisplayName()}'s avatar`}
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = logo; }}
        />
        {/* Decoration overlay */}
        {account?.decoration && (
          <img
            src={storeService.getDecorationUrl(account.decoration)}
            alt="Decoration"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-primary font-bold truncate max-w-[8rem]">
            {getDisplayName()}
          </span>
        </div>
        
        {/* ✅ UPDATED: Role below username, only for yourself (not opponent) */}
        {!isOpponent && (
          <div className="text-xs text-base-content/80 font-mono mb-1">
            <span className="text-base-content/60">Role: </span>
            <span className={`font-bold ${
              playerRole === 'attacker' ? 'text-red-300' : 'text-blue-300'
            }`}>
              {playerRole === 'attacker' ? '🎯 Attacker' : '🛡️ Defender'}
            </span>
          </div>
        )}
        
        <div className="text-xs text-base-content/70 font-mono truncate max-w-[12rem]">
          {loading ? (
            'Loading profile...'
          ) : error ? (
            <span className="text-error">{error}</span>
          ) : account?.bio ? (
            <span className="italic">"{account.bio.length > 48 ? account.bio.slice(0, 48) + '…' : account.bio}"</span>
          ) : (
            <span className="opacity-50">No bio</span>
          )}
        </div>
        <div className="mt-1">{renderResources()}</div>
      </div>
    </div>
  );
};

// Separate component for the maintenance cost indicator with cyberpunk tooltip
const MaintenanceCostIndicator: React.FC<{ maintenanceCosts: { cost: number; type: string; count: number } }> = ({ maintenanceCosts }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="relative">
      <motion.div
        className="flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-error/30 to-warning/30 border border-error/60 rounded shadow shadow-error/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.05, 1], opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
      >
        <span className="text-warning text-base animate-bounce">⚠️</span>
        <span className="text-error font-mono font-bold text-xs">-{maintenanceCosts.cost} AP</span>
        <span className="text-xs opacity-90">{maintenanceCosts.type === 'vulnerable' ? '🎯' : '🛡️'}</span>
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
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute bottom-full left-0 mb-2 z-50"
          >
            <div className="card bg-base-100 border-2 border-info/60 shadow-2xl shadow-info/30 w-72">
              <div className="card-body p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-info text-base">⚡</span>
                  <h3 className="card-title text-xs text-info uppercase tracking-wider">MAINTENANCE COST PROTOCOL</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-warning text-base">🎯</span>
                    <div>
                      <p className="font-bold text-warning">ATTACKER PENALTY:</p>
                      <p className="text-base-content/80">
                        <span className="text-error font-bold">3 vulnerable = 1 AP</span>, <span className="text-error font-bold">4 vulnerable = 2 AP</span>, <span className="text-error font-bold">5 vulnerable = 3 AP</span>
                      </p>
                      <p className="text-warning/80 text-xs mt-1">💥 Can't pay OR left with 0 AP? Random vulnerable infrastructure is lost next round!</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-info text-base">🛡️</span>
                    <div>
                      <p className="font-bold text-info">DEFENDER PENALTY:</p>
                      <p className="text-base-content/80">
                        <span className="text-info font-bold">3 shielded = 1 AP</span>, <span className="text-info font-bold">4 shielded = 2 AP</span>, <span className="text-info font-bold">5 shielded = 3 AP</span>
                      </p>
                      <p className="text-info/80 text-xs mt-1">💥 Can't pay OR left with 0 AP? Random shielded infrastructure is lost next round!</p>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex items-center gap-2 p-2 bg-error/10 rounded border border-error/30">
                    <span className="text-error text-base">⚠️</span>
                    <div>
                      <p className="font-bold text-error">CURRENT STATUS:</p>
                      <p className="text-base-content">
                        Paying <span className="font-bold text-error">{maintenanceCosts.cost} AP per round</span> for <span className="font-bold">{maintenanceCosts.count} {maintenanceCosts.type}</span> infrastructure
                      </p>
                      <p className="text-xs text-base-content/60 mt-1">Formula: {maintenanceCosts.count} infrastructure - 2 = {maintenanceCosts.cost} AP cost per round</p>
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

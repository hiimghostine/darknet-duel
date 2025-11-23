import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Shield, Sword, Zap, User } from 'lucide-react';
import UserProfilePopup from '../../UserProfilePopup';
import FullProfileModal from '../FullProfileModal';
import accountService from '../../../services/account.service';

// Import types
import type { GameComponentProps } from './types';

// Import hooks
import { useResponsiveGameScaling } from '../../../hooks/useResponsiveGameScaling';
import { useTheme } from '../../../store/theme.store';
import type { ConnectionStatus } from '../../../hooks/useHeartbeat';

// Define props interface extending GameComponentProps
export interface OpponentHandAreaProps extends GameComponentProps {
  // Opponent player object
  opponent: any;
  
  // Connection status
  opponentStatus?: ConnectionStatus;
}

const OpponentHandArea: React.FC<OpponentHandAreaProps> = ({
  opponent,
  isAttacker,
  isActive,
  opponentStatus,
  G
}) => {
  // Get responsive scaling configuration
  const scaling = useResponsiveGameScaling();
  
  // Get theme for conditional styling
  const theme = useTheme();
  
  // Profile popup state
  const [profilePopup, setProfilePopup] = useState({
    isVisible: false,
    userId: '',
    username: '',
    position: { x: 0, y: 0 }
  });

  // Full profile modal state
  const [fullProfileModal, setFullProfileModal] = useState({
    isVisible: false,
    userId: '',
    username: ''
  });

  // Fetched username state
  const [fetchedUsername, setFetchedUsername] = useState<string>('');

  // Fetch username from account service
  useEffect(() => {
    let isMounted = true;
    const fetchUsername = async () => {
      // Get real UUID from playerUuidMap
      const opponentId = opponent?.id;
      const realUuid = opponentId && G?.playerUuidMap?.[opponentId];
      const userId = realUuid || (opponent as any)?.uuid || (opponent as any)?.realUserId || opponentId;
      
      if (!userId || userId === '0' || userId === '1' || userId === 'attacker' || userId === 'defender') {
        // Development mode, tutorial mode, or no valid UUID
        if (isMounted) setFetchedUsername(opponent?.username || 'OPPONENT');
        return;
      }

      try {
        const accountData = await accountService.getAccountByUuid(userId);
        if (isMounted && accountData.username) {
          setFetchedUsername(accountData.username);
        }
      } catch (err) {
        console.warn('Failed to fetch opponent username:', err);
        if (isMounted) setFetchedUsername(opponent?.username || 'OPPONENT');
      }
    };

    fetchUsername();
    return () => { isMounted = false; };
  }, [opponent?.id, G?.playerUuidMap, opponent]);
  
  // Helper functions for connection status
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

  // Handle username click to show profile popup
  const handleUsernameClick = (event: React.MouseEvent) => {
    event.preventDefault();
    
    // ✅ Get real UUID from playerUuidMap (same logic as PlayerInfo)
    const opponentId = opponent?.id;
    const realUuid = opponentId && G?.playerUuidMap?.[opponentId];
    const userId = realUuid || (opponent as any)?.uuid || (opponent as any)?.realUserId || opponentId;
    const username = fetchedUsername || opponent?.username || 'OPPONENT';
    
    if (!userId) return;
    
    // Skip for BoardGame.io IDs and tutorial mock IDs
    if (userId === '0' || userId === '1' || userId === 'attacker' || userId === 'defender') {
      console.log('OpponentHandArea: Skipping profile popup for mock/tutorial ID:', userId);
      return;
    }

    console.log('OpponentHandArea: Opening profile for UUID:', userId);
    setProfilePopup({
      isVisible: true,
      userId,
      username,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  const closeProfilePopup = () => {
    setProfilePopup(prev => ({ ...prev, isVisible: false }));
  };

  const openFullProfileModal = () => {
    setFullProfileModal({
      isVisible: true,
      userId: profilePopup.userId,
      username: profilePopup.username
    });
  };

  const closeFullProfileModal = () => {
    setFullProfileModal(prev => ({ ...prev, isVisible: false }));
  };
  
  // Render opponent hand (card backs)
  const renderOpponentHand = () => {
    const handSize = opponent?.hand?.length || 0;
    // Color coding logic based on opponent's actual role:
    // If current player is attacker (isAttacker = true), opponent is defender (should be blue)
    // If current player is defender (isAttacker = false), opponent is attacker (should be red)
    const opponentIsDefender = isAttacker; // If I'm attacker, opponent is defender
    const cardColor = opponentIsDefender 
      ? 'border-2 border-blue-500/50 hover:border-blue-500 hover:shadow-blue-500/30 bg-gradient-to-br from-blue-950/80 to-blue-900/60' 
      : 'border-2 border-red-500/50 hover:border-red-500 hover:shadow-red-500/30 bg-gradient-to-br from-red-950/80 to-red-900/60';
    
    const cards = Array.from({ length: handSize }, (_, i) => {
      // Calculate card dimensions (smaller than player cards)
      const cardWidth = scaling.breakpoint === 'lg' || scaling.breakpoint === 'xl' || scaling.breakpoint === '2xl' 
        ? scaling.cardWidthLg * 0.5 
        : scaling.cardWidth * 0.45;
      const cardHeight = scaling.breakpoint === 'lg' || scaling.breakpoint === 'xl' || scaling.breakpoint === '2xl'
        ? scaling.cardHeightLg * 0.5
        : scaling.cardHeight * 0.45;
      
      return (
        <div 
          key={i} 
          className={`
            relative ${cardColor} rounded-lg 
            flex flex-col items-center justify-center shadow-md backdrop-blur-sm
            transition-all duration-300 hover:transform hover:-translate-y-2 hover:z-10
            hover:shadow-xl
          `}
          style={{ 
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            zIndex: handSize - i,
            marginLeft: i > 0 ? `-${cardWidth * 0.3}px` : '0'
          }}
        >
        {/* Card back pattern */}
        <div className="absolute inset-0 rounded-lg overflow-hidden opacity-20">
          <div className={`absolute inset-0 ${opponentIsDefender ? 'bg-blue-500' : 'bg-red-500'}`} 
               style={{
                 backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)`
               }} 
          />
        </div>
        
        {/* Center icon */}
        <div className={`${opponentIsDefender ? 'text-blue-400' : 'text-red-400'} z-10`}>
          {opponentIsDefender ? <Shield className="w-6 h-6" /> : <Sword className="w-6 h-6" />}
        </div>
        
        {/* Card back glow */}
        <div className={`absolute inset-0 rounded-lg ${opponentIsDefender ? 'bg-blue-500/5' : 'bg-red-500/5'}`} />
      </div>
      );
    });
    
    return (
      <div className="flex items-center justify-center">
        {cards}
      </div>
    );
  };

  return (
    <div 
      className={`
        flex justify-between items-center gap-4 rounded-lg relative
        border backdrop-blur-sm shadow-lg
        ${theme === 'cyberpunk'
          ? isAttacker
            ? 'bg-gradient-to-br from-blue-100/80 to-blue-50/60 border-blue-600/60'
            : 'bg-gradient-to-br from-red-100/80 to-red-50/60 border-red-600/60'
          : isAttacker 
            ? 'bg-gradient-to-br from-blue-950/40 to-blue-900/20 border-blue-500/20' 
            : 'bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-500/20'
        }
        ${!isActive 
          ? theme === 'cyberpunk'
            ? isAttacker
              ? 'ring-4 ring-blue-500/80 shadow-2xl shadow-blue-500/60'
              : 'ring-4 ring-red-500/80 shadow-2xl shadow-red-500/60'
            : isAttacker
              ? 'ring-4 ring-blue-400/70 shadow-2xl shadow-blue-400/50'
              : 'ring-4 ring-red-400/70 shadow-2xl shadow-red-400/50'
          : ''
        }
      `}
      style={{
        height: scaling.opponentHandHeight,
        padding: `${scaling.containerPadding}px`
      }}
    >
      {/* Info panel */}
      <div className={`
        flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300
        ${!isActive
          ? theme === 'cyberpunk'
            ? isAttacker
              ? 'bg-blue-500/20 ring-2 ring-blue-500 shadow-lg shadow-blue-500/50'
              : 'bg-red-500/20 ring-2 ring-red-500 shadow-lg shadow-red-500/50'
            : isAttacker
              ? 'bg-blue-500/10 ring-2 ring-blue-500/70 shadow-lg shadow-blue-500/30'
              : 'bg-red-500/10 ring-2 ring-red-500/70 shadow-lg shadow-red-500/30'
          : 'bg-transparent'
        }
      `}>
        {/* Opponent avatar/icon */}
        <div className={`
          w-14 h-14 rounded-lg flex items-center justify-center
          ${theme === 'cyberpunk'
            ? isAttacker
              ? 'bg-gradient-to-br from-blue-200/70 to-blue-300/50 border-2 border-blue-600/60'
              : 'bg-gradient-to-br from-red-200/70 to-red-300/50 border-2 border-red-600/60'
            : isAttacker 
              ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30' 
              : 'bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/30'
          }
        `}>
          {isAttacker 
            ? <Shield className={`w-7 h-7 ${theme === 'cyberpunk' ? 'text-blue-700' : 'text-blue-300'}`} /> 
            : <Sword className={`w-7 h-7 ${theme === 'cyberpunk' ? 'text-red-700' : 'text-red-300'}`} />
          }
        </div>
        
        {/* Opponent info */}
        <div>
          <div className="flex items-center gap-2">
            {!isActive && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`w-2.5 h-2.5 rounded-full ${
                  isAttacker ? 'bg-blue-500' : 'bg-red-500'
                }`}
              />
            )}
            <User className="w-3.5 h-3.5 text-base-content/60" />
            <span 
              className="font-bold text-sm font-mono uppercase tracking-wide cursor-pointer hover:text-primary transition-colors"
              onClick={handleUsernameClick}
              title="View profile"
            >
              {fetchedUsername || opponent?.username || 'OPPONENT'}
            </span>
            {!isActive && (
              <span className={`
                px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider
                ${theme === 'cyberpunk'
                  ? isAttacker
                    ? 'bg-blue-500 text-white'
                    : 'bg-red-500 text-white'
                  : isAttacker
                    ? 'bg-blue-600 text-blue-100'
                    : 'bg-red-600 text-red-100'
                }
              `}>
                OPPONENT'S TURN
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs mt-0.5">
            <span className="text-base-content/60">{isAttacker ? 'DEFENDER' : 'ATTACKER'}</span>
            {opponentStatus && (
              <>
                <span className="text-base-content/40">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">{getConnectionIcon(opponentStatus.isConnected, 0)}</span>
                  <span className="text-base-content/70 font-mono">
                    {formatLatency(opponentStatus.latency)}
                  </span>
                </div>
              </>
            )}
            <span className="text-base-content/40">•</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent font-bold font-mono">
                {(opponent as any)?.actionPoints || 0}/10 AP
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hand display */}
      <div className="flex-1 flex items-center justify-center -ml-48">
        {renderOpponentHand()}
      </div>
      
      {/* Hand count badge */}
      <div className={`
        px-3 py-1.5 rounded-lg font-mono text-xs font-bold border
        ${theme === 'cyberpunk'
          ? isAttacker
            ? 'bg-blue-200/60 border-blue-600/60 text-blue-900'
            : 'bg-red-200/60 border-red-600/60 text-red-900'
          : isAttacker 
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }
      `}>
        {opponent?.hand?.length || 0} CARDS
      </div>
      
      {/* Profile Popup - Rendered via Portal to escape z-index stacking */}
      {profilePopup.isVisible && createPortal(
        <UserProfilePopup
          userId={profilePopup.userId}
          username={profilePopup.username}
          isVisible={profilePopup.isVisible}
          position={profilePopup.position}
          onClose={closeProfilePopup}
          useModal={true}
          onOpenFullProfile={openFullProfileModal}
        />,
        document.body
      )}

      {/* Full Profile Modal */}
      <FullProfileModal
        userId={fullProfileModal.userId}
        username={fullProfileModal.username}
        isVisible={fullProfileModal.isVisible}
        onClose={closeFullProfileModal}
      />
    </div>
  );
};

export default React.memo(OpponentHandArea);
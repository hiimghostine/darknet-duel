import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../../../types/card.types';

interface RecentCardDisplayProps {
  recentCard: Card | null;
  playerName: string;
  isOpponent: boolean;
  onDismiss?: () => void;
}

const RecentCardDisplay: React.FC<RecentCardDisplayProps> = ({
  recentCard,
  playerName,
  isOpponent,
  onDismiss
}) => {
  if (!recentCard) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          fixed top-20 z-40 max-w-sm
          ${isOpponent ? 'left-4' : 'right-4'}
        `}
      >
        <div className="bg-base-200/95 backdrop-blur-sm border border-primary/30 rounded-lg p-4 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg">
                {isOpponent ? '👤' : '🎯'}
              </span>
              <div>
                <div className="font-bold font-mono text-primary text-sm">
                  {isOpponent ? 'OPPONENT_PLAYED' : 'YOU_PLAYED'}
                </div>
                <div className="text-xs text-base-content/70">
                  {playerName}
                </div>
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="btn btn-ghost btn-xs opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>

          {/* Card Display */}
          <div className="flex items-center gap-3">
            {/* Card Icon/Type */}
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center text-xl
              ${recentCard.type === 'attack' ? 'bg-red-500/20 text-red-400' :
                recentCard.type === 'exploit' ? 'bg-orange-500/20 text-orange-400' :
                recentCard.type === 'shield' ? 'bg-blue-500/20 text-blue-400' :
                recentCard.type === 'counter-attack' ? 'bg-purple-500/20 text-purple-400' :
                recentCard.type === 'fortify' ? 'bg-green-500/20 text-green-400' :
                recentCard.type === 'response' ? 'bg-cyan-500/20 text-cyan-400' :
                recentCard.type === 'reaction' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'}
            `}>
              {recentCard.type === 'attack' ? '⚔️' :
               recentCard.type === 'exploit' ? '🔓' :
               recentCard.type === 'shield' ? '🛡️' :
               recentCard.type === 'counter-attack' ? '🔄' :
               recentCard.type === 'fortify' ? '🏰' :
               recentCard.type === 'response' ? '⚡' :
               recentCard.type === 'reaction' ? '🔀' :
               '🃏'}
            </div>

            {/* Card Info */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-primary truncate">
                {recentCard.name}
              </div>
              <div className="text-xs text-base-content/70 capitalize">
                {recentCard.type.replace('-', ' ')} Card
              </div>
              <div className="text-xs text-base-content/60 mt-1 line-clamp-2">
                {recentCard.description}
              </div>
            </div>
          </div>

          {/* Auto-dismiss timer */}
          <div className="mt-3">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-1 bg-primary/30 rounded-full"
              onAnimationComplete={onDismiss}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(RecentCardDisplay);

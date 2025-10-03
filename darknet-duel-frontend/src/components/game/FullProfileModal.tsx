import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Target, TrendingUp, Calendar, Mail, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import accountService, { type AccountData } from '../../services/account.service';
import infoService, { type RecentActivityItem } from '../../services/info.service';
import UserTypeTag from '../UserTypeTag';
import logo from '../../assets/logo.png';
import { useThemeStore } from '../../store/theme.store';

interface FullProfileModalProps {
  userId: string;
  username: string;
  isVisible: boolean;
  onClose: () => void;
}

const FullProfileModal: React.FC<FullProfileModalProps> = ({
  userId,
  username,
  isVisible,
  onClose
}) => {
  const [userData, setUserData] = useState<Partial<AccountData> | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useThemeStore();

  // Fetch user data
  useEffect(() => {
    if (isVisible && userId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // Skip for development BoardGame.io IDs
          if (userId === '0' || userId === '1') {
            setError('Profile not available in development mode');
            setIsLoading(false);
            return;
          }

          const accountData = await accountService.getAccountByUuid(userId);
          setUserData(accountData);
          
          // Fetch recent activity for this user
          try {
            const profileInfo = await infoService.getProfileByUserId(userId, 10);
            setRecentActivity(profileInfo.recentActivity || []);
          } catch (err) {
            console.error('Failed to fetch recent activity:', err);
            setRecentActivity([]);
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          setError('Failed to load profile');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [isVisible, userId]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getAvatarUrl = () => {
    if (userId && userId !== '0' && userId !== '1') {
      return accountService.getAvatarUrl(userId);
    }
    return logo;
  };

  const calculateStats = () => {
    const gamesPlayed = userData?.gamesPlayed || 0;
    const gamesWon = userData?.gamesWon || 0;
    const gamesLost = userData?.gamesLost || 0;
    const winRate = gamesPlayed > 0 
      ? ((gamesWon / gamesPlayed) * 100).toFixed(1) 
      : '0.0';

    return { gamesPlayed, gamesWon, gamesLost, winRate };
  };

  const stats = calculateStats();

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-base-200 border-2 border-primary/30 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-20">
              <p className="text-error mb-4">{error}</p>
              <button onClick={onClose} className="btn btn-primary btn-sm">
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Header with avatar and basic info */}
              <div className="relative">
                {/* Decorative background */}
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 border-b border-primary/20"></div>
                
                {/* Avatar and decoration */}
                <div className="absolute left-8 -bottom-16 flex items-end gap-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/50 bg-base-300 shadow-xl">
                    <img
                      src={getAvatarUrl()}
                      alt={username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = logo;
                      }}
                    />
                    {/* Decoration Overlay */}
                    {userData?.decoration && (
                      <div className="absolute inset-0">
                        <img
                          src={`${accountService.getApiBaseUrl()}/files/decorations/${userData.decoration}.png`}
                          alt="Avatar decoration"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile content */}
              <div className="pt-20 px-8 pb-8">
                {/* Username and type */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-3xl font-bold font-mono text-primary">
                    {username}
                  </h2>
                  {userData?.type && <UserTypeTag userType={userData.type} />}
                </div>

                {/* Bio */}
                {userData?.bio && (
                  <p className="text-base-content/80 mb-6 text-sm">
                    {userData.bio}
                  </p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Rating */}
                  <div className="bg-base-300 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-xs text-base-content/60 font-mono uppercase">Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-primary font-mono">
                      {userData?.rating || 1000}
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="bg-base-300 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-xs text-base-content/60 font-mono uppercase">Win Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-success font-mono">
                      {stats.winRate}%
                    </div>
                  </div>

                  {/* Wins */}
                  <div className="bg-base-300 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-warning" />
                      <span className="text-xs text-base-content/60 font-mono uppercase">Wins</span>
                    </div>
                    <div className="text-2xl font-bold text-warning font-mono">
                      {stats.gamesWon}
                    </div>
                  </div>

                  {/* Losses */}
                  <div className="bg-base-300 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-error" />
                      <span className="text-xs text-base-content/60 font-mono uppercase">Losses</span>
                    </div>
                    <div className="text-2xl font-bold text-error font-mono">
                      {stats.gamesLost}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Total Games */}
                  <div className="bg-base-300 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-sm text-base-content/60 font-mono uppercase">Total Games</span>
                      </div>
                      <span className="text-lg font-bold text-primary font-mono">
                        {stats.gamesPlayed}
                      </span>
                    </div>
                  </div>

                  {/* Member Since */}
                  {userData?.createdAt && (
                    <div className="bg-base-300 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-sm text-base-content/60 font-mono uppercase">Member Since</span>
                        </div>
                        <span className="text-lg font-bold text-primary font-mono">
                          {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Details */}
                {userData?.email && (
                  <div className="bg-base-300 border border-primary/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-xs text-base-content/60 font-mono uppercase">Email</span>
                    </div>
                    <div className="text-sm text-base-content font-mono">
                      {userData.email}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-bold font-mono text-primary">RECENT_ACTIVITY.log</h3>
                  </div>
                  
                  <div className="bg-base-300/50 border border-primary/20 rounded-lg overflow-hidden">
                    <div className="bg-primary/10 border-b border-primary/20 p-3">
                      <div className="text-primary font-mono text-sm">[READ_ONLY] COMBAT_LOGS</div>
                    </div>
                    
                    <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-base-200/50 border border-primary/10 rounded font-mono text-sm">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 text-xs font-bold rounded ${
                                activity.type === 'WIN' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                              } border border-current/30`}>
                                {activity.type}
                              </span>
                              <span className="text-base-content/70">vs</span>
                              <span className="text-primary">{activity.opponent}</span>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-bold ${
                                activity.pointsChange.startsWith('+') ? 'text-success' : 'text-error'
                              }`}>
                                {activity.pointsChange}
                              </div>
                              <div className="text-xs text-base-content/50">{activity.time}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-base-content/50 py-8">
                          <div className="font-mono text-sm">NO RECENT ACTIVITY</div>
                          <div className="font-mono text-xs mt-1">No combat history available</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default FullProfileModal;


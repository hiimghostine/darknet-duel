import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService, { type AccountData } from '../services/account.service';
import { type ProfileStats } from '../services/info.service';
import logo from '../assets/logo.png';

interface UserProfilePopupProps {
  userId: string;
  username: string;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({
  userId,
  username,
  isVisible,
  position,
  onClose
}) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<Partial<AccountData> | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  // Fetch user data when popup becomes visible
  useEffect(() => {
    if (isVisible && userId) {
      const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // Fetch user account data (contains all the stats we need)
          const accountData = await accountService.getAccountByUuid(userId);
          setUserData(accountData);
          
          // Calculate win rate from account data
          const gamesPlayed = accountData.gamesPlayed || 0;
          const gamesWon = accountData.gamesWon || 0;
          const gamesLost = accountData.gamesLost || 0;
          
          const winRate = gamesPlayed > 0 
            ? ((gamesWon / gamesPlayed) * 100).toFixed(1) + '%'
            : '0.0%';
            
          setProfileStats({
            wins: gamesWon,
            losses: gamesLost,
            totalGames: gamesPlayed,
            winRate: winRate,
            rating: accountData.rating || 1200,
            level: 1 // Default level since we don't have this data
          });
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          setError('Failed to load user profile');
          setUserData(null);
          setProfileStats(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }
  }, [isVisible, userId]);

  // Calculate popup position to keep it within viewport
  const getPopupStyle = () => {
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
    };

    // Check if popup would go off-screen and adjust
    const popupWidth = 320;
    const popupHeight = 400; // Increased to account for actual content height
    const padding = 15;
    const cursorOffset = 15;

    let left = position.x + cursorOffset;
    let top = position.y + cursorOffset;

    // Adjust horizontal position
    if (left + popupWidth > window.innerWidth - padding) {
      // Try positioning to the left of cursor instead
      left = position.x - popupWidth - cursorOffset;
      // If still doesn't fit, align to right edge of viewport
      if (left < padding) {
        left = window.innerWidth - popupWidth - padding;
      }
    }
    // Ensure minimum left position
    if (left < padding) {
      left = padding;
    }

    // Adjust vertical position
    if (top + popupHeight > window.innerHeight - padding) {
      // Try positioning above cursor instead
      top = position.y - popupHeight - cursorOffset;
      // If still doesn't fit, align to bottom edge of viewport
      if (top < padding) {
        top = window.innerHeight - popupHeight - padding;
      }
    }
    // Ensure minimum top position
    if (top < padding) {
      top = padding;
    }

    style.left = `${left}px`;
    style.top = `${top}px`;

    return style;
  };

  const handleViewFullProfile = () => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={popupRef}
      style={getPopupStyle()}
      className="w-80 max-h-96 bg-base-200 border border-primary/30 backdrop-blur-sm shadow-lg shadow-primary/20 rounded-lg overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-primary/10 border-b border-primary/20 p-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-primary text-sm">USER_PROFILE.dat</h4>
          <button
            onClick={onClose}
            className="text-base-content/70 hover:text-primary transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-primary font-mono text-sm">LOADING...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-error font-mono text-sm mb-2">⚠️ {error}</div>
            <button
              onClick={onClose}
              className="btn btn-sm btn-outline btn-error font-mono"
            >
              CLOSE
            </button>
          </div>
        ) : userData ? (
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 border border-primary/50 rounded-full overflow-hidden">
                <img
                  src={accountService.getAvatarUrl(userId)}
                  alt={`${username}'s avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = logo;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono">
                  <div className="text-lg font-bold text-primary truncate">
                    {userData.username || username}
                  </div>
                  <div className="text-xs text-base-content/70">
                    RATING: {userData.rating || 1200}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${userData.isActive ? 'bg-success' : 'bg-error'}`}></div>
                    <span className={`text-xs font-mono ${userData.isActive ? 'text-success' : 'text-error'}`}>
                      {userData.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {userData.bio && (
              <div>
                <div className="text-xs text-primary mb-1 font-mono">BIO:</div>
                <div className="bg-base-300/30 border border-primary/20 p-2 text-sm font-mono text-base-content">
                  {userData.bio}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            {profileStats && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm font-bold text-success">{profileStats.wins}</div>
                  <div className="text-xs text-base-content/70 font-mono">WINS</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-error">{profileStats.losses}</div>
                  <div className="text-xs text-base-content/70 font-mono">LOSSES</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-primary">{profileStats.winRate}</div>
                  <div className="text-xs text-base-content/70 font-mono">WIN RATE</div>
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="pt-2 border-t border-primary/20">
              <div className="text-xs font-mono text-base-content/70 mb-2">
                JOINED: {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
              <div className="text-xs font-mono text-base-content/70">
                GAMES: {userData.gamesPlayed || 0} played
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                onClick={handleViewFullProfile}
                className="btn btn-sm btn-primary w-full font-mono"
              >
                VIEW_FULL_PROFILE
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-base-content/50 font-mono text-sm">No user data available</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePopup; 
 
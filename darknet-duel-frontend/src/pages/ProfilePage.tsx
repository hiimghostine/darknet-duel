import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import { useAudioManager } from '../hooks/useAudioManager';
import logo from '../assets/logo.png';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import EditProfileModal from '../components/EditProfileModal';
import ReportModal from '../components/ReportModal';
import UserTypeTag from '../components/UserTypeTag';
import accountService, { type AccountData } from '../services/account.service';
import infoService, { type ProfileStats, type RecentActivityItem } from '../services/info.service';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { id: profileId } = useParams<{ id: string }>();
  const { theme, toggleTheme } = useThemeStore();
  const { triggerClick, triggerPositiveClick, triggerNegativeClick } = useAudioManager();

  // If no profile ID is provided, redirect to current user's profile
  useEffect(() => {
    if (!profileId && user?.id) {
      navigate(`/profile/${user.id}`, { replace: true });
      return;
    }
  }, [profileId, user?.id, navigate]);

  // Determine if we're viewing own profile or someone else's
  const isOwnProfile = profileId === user?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutScreen, setShowLogoutScreen] = useState(false);
  const [userData, setUserData] = useState<Partial<AccountData> | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Load profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (profileId) {
          // Fetch user account data using the account service
          console.log('Fetching account data for user:', profileId);
          const accountData = isOwnProfile 
            ? await accountService.getMyAccount()
            : await accountService.getAccountByUuid(profileId);
          
          console.log('Account data received:', accountData);
          console.log('isActive:', accountData.isActive, typeof accountData.isActive);
          console.log('bio:', accountData.bio, typeof accountData.bio);
          console.log('createdAt:', accountData.createdAt, typeof accountData.createdAt);
          
          setUserData(accountData);

          // Fetch stats and recent activity in parallel
          const [stats, activity] = await Promise.all([
            infoService.getProfileStats().catch(() => null), // Get stats (only works for own profile)
            infoService.getRecentActivity(15).catch(() => []) // Get recent activity (only works for own profile)
          ]);
          
          setProfileStats(stats);
          setRecentActivity(activity);
        }

        setErrorMessage(null);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setErrorMessage('Failed to load profile data');
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    fetchProfileData();
  }, [isOwnProfile, profileId]);

  const handleLogout = () => {
    setShowLogoutScreen(true);
    setTimeout(() => {
      logout();
      navigate('/auth');
    }, 3000);
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
  };

  const handleEditModalSave = () => {
    setShowEditModal(false);
    // Refresh profile data after edit
    window.location.reload();
  };

  const handleReportUser = () => {
    setShowReportModal(true);
  };

  const handleReportModalClose = () => {
    setShowReportModal(false);
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen text="ACCESSING NEURAL PROFILE" />;
  }

  // Show logout screen
  if (showLogoutScreen) {
    return <LogoutScreen />;
  }

  // Get user data for display
  const displayUser = userData;
  const stats = profileStats;

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error mb-4">User Not Found</h1>
          <p className="text-base-content/70 mb-4">The requested profile could not be found.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg"></div>
      <div className="absolute inset-0 scanline"></div>
      
      <div className="relative z-10">
        <header className="bg-base-200/90 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    triggerClick();
                    navigate('/dashboard');
                  }}
                  className="btn btn-ghost text-primary font-mono text-lg"
                >
                  ← BACK
                </button>
                <h1 className="text-xl font-bold font-mono text-primary">
                  {isOwnProfile ? 'YOUR_PROFILE.dat' : `${displayUser.username}_PROFILE.dat`}
                </h1>
              </div>
              
              <div className="flex items-center space-x-2">
                {isOwnProfile && (
                  <button 
                    onClick={() => {
                      triggerClick();
                      handleEditProfile();
                    }}
                    className="btn btn-sm bg-primary/20 border-primary/50 hover:border-primary text-primary btn-cyberpunk"
                    aria-label="Edit Profile"
                  >
                    <span className="mr-1">✏️</span>
                    <span className="hidden sm:inline">EDIT</span>
                  </button>
                )}
                
                {!isOwnProfile && (
                  <button 
                    onClick={() => {
                      triggerClick();
                      handleReportUser();
                    }}
                    className="btn btn-sm bg-error/20 border-error/50 hover:border-error text-error btn-cyberpunk"
                    aria-label="Report User"
                  >
                    <span className="mr-1">⚠️</span>
                    <span className="hidden sm:inline">REPORT</span>
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    triggerClick();
                    toggleTheme();
                  }} 
                  className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                  aria-label="Toggle theme"
                >
                  {theme === 'cyberpunk' ? '🌙' : '☀️'}
                </button>
                
                <button 
                  onClick={handleLogout} 
                  className="btn btn-sm btn-error"
                >
                  <span className="mr-1">🚪</span>
                  <span className="hidden sm:inline">LOGOUT</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="alert alert-error mb-6 font-mono text-sm">
              <span>⚠️ ERROR: {errorMessage}</span>
            </div>
          )}

          {/* Profile Header */}
          <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm mb-8">
            <div className="bg-base-200 border border-primary/20 p-6 relative">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <div className="flex flex-col lg:flex-row items-start gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/50 mb-4">
                    <img
                      src={accountService.getAvatarUrl(displayUser.id || '')}
                      alt={`${displayUser.username}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = logo;
                      }}
                    />
                    {/* Decoration Overlay */}
                    {displayUser.decoration && (
                      <div className="absolute inset-0">
                        <img
                          src={`${accountService.getApiBaseUrl()}/files/decorations/${displayUser.decoration}.png`}
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

                {/* User Info */}
                <div className="flex-1">
                  <div className="font-mono">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                      <span className="text-primary data-corrupt" data-text={displayUser.username}>
                        {displayUser.username}
                      </span>
                      {displayUser.type && <UserTypeTag userType={displayUser.type} />}
                      {isOwnProfile && <span className="text-base-content/50 ml-2">(YOU)</span>}
                    </h2>
                    
                    {/* Status */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full pulse-glow ${displayUser?.isActive ? 'bg-success' : 'bg-error'}`}></div>
                        <span className={`font-mono text-sm ${displayUser?.isActive ? 'text-success' : 'text-error'}`}>
                          STATUS: {displayUser?.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <div className="text-base-content/70 text-sm">
                        ID: {(displayUser.id || '').slice(0, 8)}...
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-4">
                      <div className="text-xs text-primary mb-1">BIO.txt</div>
                      <div className="bg-base-300/30 border border-primary/20 p-3 font-mono text-sm text-base-content">
                        {displayUser?.bio || 'No bio available...'}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    {stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{stats.rating}</div>
                          <div className="text-xs text-base-content/70">RATING</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success">{stats.wins}</div>
                          <div className="text-xs text-base-content/70">WINS</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-error">{stats.losses}</div>
                          <div className="text-xs text-base-content/70">LOSSES</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{stats.winRate}</div>
                          <div className="text-xs text-base-content/70">WIN RATE</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity and Stats Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
                <h3 className="text-lg font-bold font-mono text-primary">RECENT_ACTIVITY.log</h3>
              </div>
              
              <div className="bg-base-200/50 border border-primary/20 backdrop-blur-sm">
                <div className="bg-primary/10 border-b border-primary/20 p-3">
                  <div className="text-primary font-mono text-sm">[READ_ONLY] COMBAT_LOGS</div>
                </div>
                
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-base-300/30 border border-primary/10 font-mono text-sm">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs font-bold ${
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
                      <div className="font-mono text-xs mt-1">Play some games to see your combat history</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Player Stats */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-secondary rounded-full pulse-glow"></div>
                <h3 className="text-lg font-bold font-mono text-secondary">PLAYER_STATS.dat</h3>
              </div>
              
              <div className="bg-base-200/50 border border-secondary/20 backdrop-blur-sm">
                <div className="bg-secondary/10 border-b border-secondary/20 p-3">
                  <div className="text-secondary font-mono text-sm">[READ_ONLY] STATISTICAL_ANALYSIS</div>
                </div>

                <div className="p-6 space-y-6">
                  {stats ? (
                    <>
                      {/* Combat Stats */}
                      <div>
                        <h4 className="font-mono text-sm text-primary mb-3">COMBAT STATISTICS</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="stat bg-base-300/30 border border-primary/20 p-4">
                            <div className="stat-title text-xs font-mono">Total Games</div>
                            <div className="stat-value text-lg text-primary">{stats.totalGames}</div>
                          </div>
                          <div className="stat bg-base-300/30 border border-primary/20 p-4">
                            <div className="stat-title text-xs font-mono">Player Level</div>
                            <div className="stat-value text-lg text-secondary">{stats.level}</div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div>
                        <h4 className="font-mono text-sm text-primary mb-3">PERFORMANCE METRICS</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-sm text-base-content">Victory Rate:</span>
                            <span className="font-mono text-sm text-success">{stats.winRate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-sm text-base-content">Current Rating:</span>
                            <span className="font-mono text-sm text-primary">{stats.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Account Info */}
                      <div>
                        <h4 className="font-mono text-sm text-primary mb-3">ACCOUNT DATA</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-xs text-base-content/70">Joined:</span>
                            <span className="font-mono text-xs">
                              {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-xs text-base-content/70">Status:</span>
                            <span className={`font-mono text-xs ${displayUser?.isActive ? 'text-success' : 'text-error'}`}>
                              {displayUser?.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-base-content/50 py-8">
                      <div className="font-mono text-sm">NO STATS AVAILABLE</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        onSave={handleEditModalSave}
      />

      {/* Report Modal */}
      {!isOwnProfile && displayUser && (
        <ReportModal
          isOpen={showReportModal}
          onClose={handleReportModalClose}
          reporteeId={displayUser.id || ''}
          reporteeUsername={displayUser.username || ''}
          reportType="profile"
        />
      )}
    </div>
  );
};

export default ProfilePage; 
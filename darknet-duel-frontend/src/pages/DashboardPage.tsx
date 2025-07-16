import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import logo from '../assets/logo.png';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import infoService, { type RecentActivityItem, type ProfileStats } from '../services/info.service';
import accountService from '../services/account.service';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, logout, loadUser } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState<'cyberpunk' | 'cyberpunk-dark'>('cyberpunk');
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [userBio, setUserBio] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Refresh user data on dashboard load
        await loadUser();
        
        // Fetch profile information from our new API
        const profileInfo = await infoService.getProfile(3); // Get last 3 activities
        setRecentActivity(profileInfo.recentActivity);
        setProfileStats(profileInfo.profileStats);
        
        // Fetch account details to get bio
        try {
          const accountData = await accountService.getMyAccount();
          setUserBio(accountData.bio);
        } catch (error) {
          console.error('Failed to fetch account bio:', error);
          setUserBio(null);
        }
        
        setDataError(null);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setDataError('Failed to load profile data');
        // Fallback to empty arrays if API fails
        setRecentActivity([]);
        setProfileStats(null);
      } finally {
        // Simulate loading for aesthetic purposes but reduce delay
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    fetchData();
  }, [loadUser]);
  
  // Get theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'cyberpunk' | 'cyberpunk-dark' || 'cyberpunk';
    setTheme(savedTheme);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'cyberpunk' ? 'cyberpunk-dark' : 'cyberpunk';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Handle logout process with animation
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Delay actual logout to show the animation
    setTimeout(() => {
      logout();
      navigate('/auth');
    }, 3000);
  };
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  // Stats data - now using profileStats from API instead of user object
  const statsData = profileStats ? [
    { label: 'WINS', value: profileStats.wins.toString() },
    { label: 'LOSSES', value: profileStats.losses.toString() },
    { label: 'RATIO', value: profileStats.winRate },
    { label: 'ELO', value: profileStats.rating.toString() }
  ] : [
    { label: 'WINS', value: '0' },
    { label: 'LOSSES', value: '0' },
    { label: 'RATIO', value: '0%' },
    { label: 'ELO', value: '0' }
  ];
  
  // Use real activities data from API or show placeholder if empty (limit to 3 activities)
  const activitiesData = recentActivity.length > 0 ? recentActivity.slice(0, 3) : [
    { type: 'WIN' as const, opponent: 'No recent games', time: 'Play a game to see activity', pointsChange: '+0 PTS' },
  ];

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden text-base-content">
      {/* Wrapper to completely hide all content during logout */}
      <div className={`${isLoggingOut ? 'hidden' : 'block'}`}>
      {/* Show loading screen when isLoading is true */}
      {isLoading && <LoadingScreen text="INITIALIZING DARKNET" />}
      
      {/* Background grid and decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid lines */}
        <div className="absolute inset-0 grid-bg"></div>
        
        {/* Decorative lines */}
        <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-primary to-transparent"></div>
        
        {/* Tech-inspired typography */}
        <div className="absolute top-20 left-10 opacity-5 text-9xl font-mono text-primary">101</div>
        <div className="absolute bottom-20 right-10 opacity-5 text-9xl font-mono text-primary">010</div>
      </div>

      {/* Main content - hide immediately when logging out */}
      <div className={`relative z-10 transition-opacity duration-500 ${isLoading || isLoggingOut ? 'opacity-0' : 'opacity-100'} scanline`}>
        <header className="p-4 border-b border-primary/20 backdrop-blur-sm bg-base-100/80">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200" onClick={() => navigate('/dashboard')}>
              <img src={logo} alt="Darknet Duel Logo" className="h-8" />
              <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
                DARKNET_DUEL
              </h1>
            </div>
        
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/lobbies')} 
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
              >
                <span className="mr-1">🎮</span> 
                <span className="hidden sm:inline">LOBBY</span>
              </button>
              
              <button 
                onClick={() => navigate(`/profile/${user?.id}`)} 
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                aria-label="Profile"
              >
                <span className="mr-1">👤</span>
                <span className="hidden sm:inline">PROFILE</span>
              </button>
              
              <button 
                onClick={() => navigate('/topup')} 
                className="btn btn-sm bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 hover:border-yellow-300 text-black font-bold btn-cyberpunk pulse-glow relative overflow-hidden group"
                aria-label="Top Up"
              >
                <span className="mr-1">💎</span>
                <span className="hidden sm:inline text-flicker">TOP-UP</span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                aria-label="Toggle Theme"
              >
                {theme === 'cyberpunk' ? '🌙' : '☀️'}
              </button>
              
              <button
                onClick={handleLogout}
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                aria-label="Logout"
              >
                <span className="mr-1">🚪</span>
                <span className="hidden sm:inline">EXIT</span>
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4">
          {/* Welcome banner */}
          <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm mb-8">
            <div className="bg-base-200 border border-primary/20 p-4 relative">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <div className="font-mono">
                <div className="flex items-baseline gap-2 mb-1">
                  <h2 className="text-2xl font-bold mb-2 font-mono">
                    WELCOME_BACK, <span className="text-primary data-corrupt" data-text={user?.username}>{user?.username}</span>
                  </h2>
                </div>
                <div className="text-base-content text-sm">
                  SYSTEM_STATUS: ONLINE | SECURITY_LEVEL: HIGH
                </div>
                <div className="text-xs text-primary mt-3">⚠️ NEURAL LINK ESTABLISHED • PROCEED WITH CAUTION</div>
              </div>
            </div>
          </div>
          
          {/* Two-column layout for desktop, stack on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - Main content */}
            <div className="md:col-span-2 space-y-8">
              {/* System Updates */}
              <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
                <div className="bg-base-200 border border-primary/20 p-4 relative">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-primary text-lg">SYSTEM_UPDATES</h3>
                    <div className="text-xs text-base-content/70 font-mono">SOURCE: ADMIN</div>
                  </div>
                  
                  <div className="font-mono text-sm border border-primary/30 bg-base-300/50 p-3">
                    <div className="flex">
                      <span className="text-primary mr-2">&gt;</span>
                      <span className="typing-animation">Welcome to Darknet Duel v0.0.1. The system is currently in alpha testing.</span>
                    </div>
                    <div className="flex mt-2">
                      <span className="text-primary mr-2">&gt;</span>
                      <span>New features will be deployed soon. Stay connected for updates.</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats panel */}
              <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
                <div className="bg-base-200 border border-primary/20 p-4 relative">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-primary text-lg">HACKER_STATS</h3>
                    <div className="text-xs text-base-content/70 font-mono">LEVEL: {profileStats?.level || 1}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {statsData.map((stat, index) => (
                      <div key={index} className="border border-primary/30 bg-base-300/50 p-3 text-center">
                        <div className="text-xl font-mono mb-1">{stat.value}</div>
                        <div className="text-xs text-primary font-mono">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Action panel */}
              <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
                <div className="bg-base-200 border border-primary/20 p-4 relative">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-primary text-lg">AVAILABLE_OPERATIONS</h3>
                    <div className="text-xs text-base-content/70 font-mono">STATUS: READY</div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/lobbies" className="btn btn-primary font-mono flex items-center justify-center gap-2 relative overflow-hidden group">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span className="relative z-10">BROWSE_LOBBIES</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Link>
                    
                    <Link to="/lobbies/create" className="btn btn-outline btn-primary font-mono flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                      CREATE_NEW_GAME
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Profile & Activity */}
            <div className="space-y-8">
              {/* User Profile */}
              <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
                <div className="bg-base-200 border border-primary/20 p-4 relative">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-primary text-lg">USER_PROFILE</h3>
                    <Link
                      to="/profile"
                      className="text-xs text-base-content/70 font-mono hover:text-primary transition-colors cursor-pointer"
                    >
                      [EDIT]
                    </Link>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Profile Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 border-2 border-primary/50 bg-base-300/50 rounded-full overflow-hidden relative">
                        <img
                          src={user?.id ? accountService.getAvatarUrl(user.id) : logo}
                          alt={`${user?.username}'s avatar`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to logo if avatar fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = logo;
                          }}
                        />
                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-success border-2 border-base-200 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono">
                        <div className="text-lg font-bold text-primary truncate">
                          {user?.username}
                        </div>
                        <div className="text-xs text-base-content/70 mb-2">
                          RATING: {profileStats?.rating || 1000}
                        </div>
                        <div className="text-sm text-base-content/90 mb-3">
                          {userBio ? (
                            <div className="italic border-l-2 border-primary/30 pl-2">
                              "{userBio}"
                            </div>
                          ) : (
                            <div className="text-base-content/50 italic">
                              Click [EDIT] to add your bio
                            </div>
                          )}
                        </div>
                        
                        {/* Currency Display */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">💰</span>
                            <span className="text-yellow-400 font-bold">CREDS:</span>
                            <span className="text-yellow-300 font-mono">{user?.creds || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-purple-400">💎</span>
                            <span className="text-purple-400 font-bold">CRYPTS:</span>
                            <span className="text-purple-300 font-mono">{user?.crypts || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
                <div className="bg-base-200 border border-primary/20 p-4 relative">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-primary text-lg">RECENT_ACTIVITY</h3>
                    <div className="text-xs text-base-content/70 font-mono">LAST_UPDATE: NOW</div>
                  </div>
                  
                  {dataError && (
                    <div className="border border-error/50 bg-error/10 p-3 rounded mb-3">
                      <div className="text-error font-mono text-sm">⚠️ {dataError}</div>
                      <div className="text-error/70 font-mono text-xs mt-1">Check your connection and try refreshing</div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {activitiesData.map((activity, index) => (
                      <div key={index} className="border border-primary/30 bg-base-300/50 p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${activity.type === 'WIN' ? 'bg-success pulse-glow' : 'bg-error'}`}></div>
                          <div className="font-mono">
                            <div className="text-sm font-bold">
                              {activity.type} vs {activity.opponent}
                            </div>
                            <div className="text-xs text-base-content/70">{activity.time}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-primary">
                          {activity.pointsChange || (activity.type === 'WIN' ? '+125 PTS' : '-75 PTS')}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => navigate('/history')}
                    className="btn btn-sm btn-outline btn-primary w-full mt-4 font-mono btn-cyberpunk"
                  >
                    VIEW_FULL_HISTORY
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="p-4 border-t border-primary/20 text-center mt-8">
          <div className="text-base-content/60 text-xs font-mono">
            DARKNET_DUEL v0.0.1 • {new Date().toISOString().split('T')[0]} • 
            <span className="text-primary ml-1 text-flicker">NETWORK: SECURE</span>
          </div>
        </footer>
      </div>
      </div>
      
      {/* Show specialized logout animation when logging out */}
      {isLoggingOut && <LogoutScreen text="TERMINATING SESSION" />}
    </div>
  );
};

export default DashboardPage;

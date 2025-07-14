import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LobbyBrowser from '../components/lobby/LobbyBrowser';
import CreateLobby from '../components/lobby/CreateLobby';
import LobbyDetail from '../components/lobby/LobbyDetail';
import { useAuthStore } from '../store/auth.store';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import logo from '../assets/logo.png';

const LobbyPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState<'cyberpunk' | 'cyberpunk-dark'>('cyberpunk');
  
  // Add loading animation only for initial login transition
  useEffect(() => {
    // Check if this is first visit after login
    const isFirstVisit = sessionStorage.getItem('lobbies_visited') !== 'true';
    
    if (isFirstVisit && isAuthenticated) {
      // Set loading state to true only on first visit
      setIsLoading(true);
      // Mark that user has visited lobbies
      sessionStorage.setItem('lobbies_visited', 'true');
      // Clear loading after animation
      const timer = setTimeout(() => setIsLoading(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Get theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'cyberpunk' | 'cyberpunk-dark' || 'cyberpunk';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'cyberpunk' ? 'cyberpunk-dark' : 'cyberpunk';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/auth', { replace: true });
    }, 1500);
  };
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden text-base-content">
      {/* Wrapper to hide content during logout */}
      <div className={`${isLoggingOut ? 'hidden' : 'block'}`}>
        
        {/* Background grid and decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid lines */}
          <div className="absolute inset-0 grid-bg"></div>
          
          {/* Scanline effect overlay */}
          <div className="absolute inset-0 scanlines pointer-events-none"></div>
          
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-primary to-transparent"></div>
          <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-primary to-transparent"></div>
          
          {/* Tech-inspired typography */}
          <div className="absolute top-40 left-10 opacity-5 text-9xl font-mono text-primary">101</div>
          <div className="absolute bottom-40 right-10 opacity-5 text-9xl font-mono text-primary">010</div>
          <div className="absolute top-1/4 right-20 opacity-5 text-7xl font-mono text-primary rotate-12">DUEL</div>
        </div>

        {/* Main content */}
        <div className={`relative z-10 transition-opacity duration-500 ${isLoading || isLoggingOut ? 'opacity-0' : 'opacity-100'} scanline`}>
          <header className="p-4 border-b border-primary/20 backdrop-blur-sm bg-base-100/80">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Darknet Duel Logo" className="h-8" />
                <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
                  DARKNET_DUEL
                </h1>
              </div>
          
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                >
                  <span className="mr-1">🏠</span> 
                  <span className="hidden sm:inline">DASHBOARD</span>
                </button>
                
                <button 
                  onClick={() => navigate('/profile')} 
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
            {/* Lobbies banner */}
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
                      DARKNET_LOBBIES
                    </h2>
                  </div>
                  <div className="text-base-content text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 pulse-glow"></div>
                    <span>SECURE CONNECTION ESTABLISHED • {user?.username?.toUpperCase() || 'USER'} AUTHENTICATED</span>
                  </div>
                  <div className="text-xs text-primary mt-3">⚠️ ENCRYPTED COMMUNICATION ACTIVE • PROCEED WITH CAUTION</div>
                </div>
              </div>
            </div>
          
            {/* Content section */}
            <Routes>
              <Route path="/" element={<LobbyBrowser />} />
              <Route path="/create" element={<CreateLobby />} />
              <Route path="/:matchID" element={<LobbyDetail />} />
            </Routes>
          </main>
        </div>
      </div>
      
      {/* Show loading animation */}
      {isLoading && <LoadingScreen text="CONNECTING TO DARKNET SERVERS" />}
      
      {/* Show logout screen */}
      {isLoggingOut && <LogoutScreen />}
    </div>
  );
};

export default LobbyPage;

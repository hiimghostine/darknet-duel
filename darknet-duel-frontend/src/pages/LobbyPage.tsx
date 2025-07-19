import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LobbyBrowser from '../components/lobby/LobbyBrowser';
import CreateLobby from '../components/lobby/CreateLobby';
import LobbyDetail from '../components/lobby/LobbyDetail';
import LobbyChat from '../components/lobby/LobbyChat';
import AppBar from '../components/AppBar';
import { useAuthStore } from '../store/auth.store';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import { useThemeStore } from '../store/theme.store';

const LobbyPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  
  // Loading logic - show loading on every page visit
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
      {/* Show loading screen when isLoading is true */}
      {isLoading && <LoadingScreen text="CONNECTING TO DARKNET SERVERS" />}
      
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
          <AppBar 
            currentPage="lobbies"
            theme={theme}
            onThemeToggle={toggleTheme}
            onLogout={handleLogout}
          />

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
          <div className="space-y-6">
            {/* Main content area */}
            <div>
              <Routes>
                <Route path="/" element={
                  <>
                    <LobbyBrowser />
                    {/* IRC-style chat at bottom - only for main lobby browser */}
                    <div className="mt-8">
                      <LobbyChat chatId="global-lobby" className="" />
                    </div>
                  </>
                } />
                <Route path="/create" element={<CreateLobby />} />
                <Route path="/:matchID" element={<LobbyDetail />} />
              </Routes>
            </div>
          </div>
        </main>
        </div>
      </div>
      
      {/* Show logout screen */}
      {isLoggingOut && <LogoutScreen />}
    </div>
  );
};

export default LobbyPage;

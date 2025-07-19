import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import bossingImage from '../assets/bossing.png';

import { FaUsers, FaGamepad, FaComments, FaCogs, FaShieldAlt, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { useThemeStore } from '../store/theme.store';

const AdminPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check authentication and admin permissions
  useEffect(() => {
    const isFirstVisit = sessionStorage.getItem('admin_visited') !== 'true';
    
    if (isFirstVisit && isAuthenticated && user?.type === 'admin') {
      setIsLoading(true);
      sessionStorage.setItem('admin_visited', 'true');
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Get theme from localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/auth', { replace: true });
    }, 1500);
  };

  // Handle notifications
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };



  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect non-admins to dashboard
  if (user && user.type !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden text-base-content">
      {/* Hide content during logout */}
      <div className={`${isLoggingOut ? 'hidden' : 'block'}`}>
        
        {/* Background grid and decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid lines */}
          <div className="absolute inset-0 grid-bg"></div>
          
          {/* Scanline effect overlay */}
          <div className="absolute inset-0 scanlines pointer-events-none"></div>
          
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-error to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-error to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-error to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-error to-transparent"></div>
          <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-error to-transparent"></div>
          
          {/* Admin-specific typography */}
          <div className="absolute top-40 left-10 opacity-5 text-9xl font-mono text-error">ADM</div>
          <div className="absolute bottom-40 right-10 opacity-5 text-9xl font-mono text-error">BOSS?</div>
          <div className="absolute top-1/4 right-20 opacity-5 text-7xl font-mono text-error rotate-12">ROOT</div>
          
          {/* Bossing image in bottom-right */}
          <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none">
            <img 
              src={bossingImage} 
              alt="Admin Bossing" 
              className="w-48 h-auto"
            />
          </div>
        </div>

        {/* Main content */}
        <div className={`relative z-10 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} scanline`}>
          {/* Header */}
          <header className="border-b border-error/20 bg-base-200/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaShieldAlt className="text-2xl text-error" />
                  <h1 className="text-2xl font-mono font-bold text-error glitch-text">
                    ADMIN_CONTROL_PANEL
                  </h1>
                  <div className="px-2 py-1 bg-error/20 border border-error/40 text-error text-xs font-mono rounded">
                    ROOT_ACCESS
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-sm font-mono text-base-content/70">
                    {user?.username?.toUpperCase() || 'ADMIN'}
                  </div>
                  
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-sm bg-primary/20 border-primary/50 hover:bg-primary/30 text-primary btn-cyberpunk"
                  >
                    <FaGamepad className="mr-1" />
                    PLAY GAME
                  </button>
                  
                  <button
                    onClick={toggleTheme}
                    className="btn btn-sm bg-base-300/80 border-error/30 hover:border-error text-error btn-cyberpunk"
                  >
                    🎨 THEME
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="btn btn-sm bg-error/20 border-error/40 hover:bg-error/30 text-error btn-cyberpunk"
                  >
                    🚪 LOGOUT
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4">
            {/* Notification */}
            {notification && (
              <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} className="btn btn-sm btn-ghost">×</button>
              </div>
            )}

            {/* Admin Dashboard */}
            <div>
                {/* Admin banner */}
                <div className="p-1 bg-gradient-to-br from-error/20 via-error/10 to-transparent backdrop-blur-sm mb-8">
              <div className="bg-base-200 border border-error/20 p-4 relative">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-error"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-error"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-error"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-error"></div>
                
                <div className="font-mono">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h2 className="text-2xl font-bold mb-2 font-mono text-error">
                      DARKNET_ADMIN_SYSTEM
                    </h2>
                  </div>
                  <div className="text-base-content text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-error pulse-glow"></div>
                    <span>PRIVILEGED ACCESS GRANTED • {user?.username?.toUpperCase() || 'ROOT'} SESSION ACTIVE</span>
                  </div>
                  <div className="text-xs text-error mt-3 flex items-center gap-2">
                    <FaExclamationTriangle />
                    <span>WARNING: ADMINISTRATIVE FUNCTIONS ENABLED • USE WITH CAUTION</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin modules grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* User Management */}
              <div 
                className="border border-error/30 bg-base-900/50 rounded-lg p-6 hover:bg-base-900/70 transition-colors cursor-pointer"
                onClick={() => navigate('/admin/user-management')}
              >
                <div className="flex items-center gap-3 mb-4">
                  <FaUsers className="text-2xl text-error" />
                  <h3 className="text-lg font-mono font-bold text-error">USER_MANAGEMENT</h3>
                </div>
                <p className="text-base-content/70 text-sm font-mono mb-4">
                  Manage user accounts, permissions, and access levels
                </p>
                <div className="text-xs text-green-500 font-mono">
                  STATUS: ACTIVE
                </div>
              </div>

              {/* Report Management */}
              <div 
                className="border border-error/30 bg-base-900/50 rounded-lg p-6 hover:bg-base-900/70 transition-colors cursor-pointer"
                onClick={() => navigate('/admin/report-management')}
              >
                <div className="flex items-center gap-3 mb-4">
                  <FaExclamationTriangle className="text-2xl text-error" />
                  <h3 className="text-lg font-mono font-bold text-error">REPORT_MANAGEMENT</h3>
                </div>
                <p className="text-base-content/70 text-sm font-mono mb-4">
                  Review and manage user reports for profiles and chat messages
                </p>
                <div className="text-xs text-green-500 font-mono">
                  STATUS: ACTIVE
                </div>
              </div>

              {/* Security Overview */}
              <div 
                className="border border-error/30 bg-base-900/50 rounded-lg p-6 hover:bg-base-900/70 transition-colors cursor-pointer md:col-span-2"
                onClick={() => navigate('/admin/security-overview')}
              >
                <div className="flex items-center gap-3 mb-4">
                  <FaShieldAlt className="text-2xl text-error" />
                  <h3 className="text-lg font-mono font-bold text-error">SECURITY_OVERVIEW</h3>
                </div>
                <p className="text-base-content/70 text-sm font-mono mb-4">
                  Monitor system security, authentication logs, and access patterns
                </p>
                <div className="text-xs text-green-500 font-mono">
                  STATUS: ACTIVE
                </div>
              </div>

            </div>

            {/* System status */}
            <div className="mt-8 border border-error/20 bg-base-900/30 rounded-lg p-4">
              <h3 className="text-lg font-mono font-bold text-error mb-4">SYSTEM_STATUS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-base-content/70">SERVER:</span>
                  <span className="text-green-500">ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">DATABASE:</span>
                  <span className="text-green-500">CONNECTED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">CHAT_SYSTEM:</span>
                  <span className="text-green-500">ACTIVE</span>
                </div>
              </div>
            </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Show loading animation */}
      {isLoading && <LoadingScreen text="ACCESSING ADMIN SYSTEMS" />}
      
      {/* Show logout screen */}
      {isLoggingOut && <LogoutScreen />}
    </div>
  );
};

export default AdminPage; 
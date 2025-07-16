import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import UserManagement from '../components/admin/UserManagement';
import { FaArrowLeft, FaUsers, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

const UserManagementPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [theme, setTheme] = useState<'cyberpunk' | 'cyberpunk-dark'>('cyberpunk');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check authentication and admin permissions
  if (!isAuthenticated || user?.type !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

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
    }, 1000);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const goBack = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none bg-grid-pattern"></div>
      
      {/* Main content */}
      <div className={`relative z-10 transition-opacity duration-500 ${isLoggingOut ? 'opacity-0' : 'opacity-100'} scanline`}>
        {/* Header */}
        <header className="border-b border-error/20 bg-base-200/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaUsers className="text-2xl text-error" />
                <h1 className="text-2xl font-mono font-bold text-error glitch-text">
                  USER_MANAGEMENT_SYSTEM
                </h1>
                <div className="px-2 py-1 bg-error/20 border border-error/40 text-error text-xs font-mono rounded">
                  ADMIN_ACCESS
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={goBack}
                  className="btn btn-sm bg-base-300/80 border-error/30 hover:border-error text-error btn-cyberpunk"
                >
                  <FaArrowLeft className="mr-1" /> BACK_TO_ADMIN
                </button>

                <div className="text-sm font-mono text-base-content/70">
                  {user?.username?.toUpperCase() || 'ADMIN'}
                </div>
                
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
            <div className={`alert mb-6 ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span className="font-mono">{notification.message}</span>
            </div>
          )}

          {/* User Management Component */}
          <UserManagement
            onError={(message) => showNotification('error', message)}
            onSuccess={(message) => showNotification('success', message)}
          />
        </main>
      </div>
      
      {/* Show logout screen */}
      {isLoggingOut && <LogoutScreen />}
    </div>
  );
};

export default UserManagementPage; 
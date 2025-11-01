import { useEffect } from 'react';
import './App.css';
import './styles/lobby.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { useToastStore } from './store/toast.store';
import ToastContainer from './components/ToastContainer';
import AudioProvider from './components/AudioProvider';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import TopUpPage from './pages/TopUpPage';
import GameHistoryPage from './pages/GameHistoryPage';
import AdminPage from './pages/AdminPage';
import UserManagementPage from './pages/UserManagementPage';
import ReportManagementPage from './pages/ReportManagementPage';
import SecurityOverviewPage from './pages/SecurityOverviewPage';
import StorePage from './pages/StorePage';
import SettingsModal from './components/SettingsModal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useThemeStore } from './store/theme.store';
import { useSettingsStore } from './store/settings.store';
import { useLobbyReconnect } from './hooks/useLobbyReconnect';

function AppContent() {
  const { loadUser } = useAuthStore();
  const { toasts, removeToast } = useToastStore();
  const { theme } = useThemeStore();
  const { isSettingsOpen, closeSettings } = useSettingsStore();
  const { reconnecting } = useLobbyReconnect();
  
  useEffect(() => {
    // Check authentication status when app loads
    loadUser();
    document.documentElement.setAttribute('data-theme', theme);
  }, [loadUser, theme]);

  // Show reconnecting overlay
  if (reconnecting) {
    return (
      <div className="fixed inset-0 bg-base-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-lg font-mono text-primary">Reconnecting to lobby...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/user-management" element={<UserManagementPage />} />
          <Route path="/admin/report-management" element={<ReportManagementPage />} />
          <Route path="/admin/security-overview" element={<SecurityOverviewPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/topup" element={<TopUpPage />} />
          <Route path="/history" element={<GameHistoryPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/lobbies/*" element={<LobbyPage />} />
          <Route path="/game/:matchID" element={<GamePage />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />
      
      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </Router>
  );
}

export default App;

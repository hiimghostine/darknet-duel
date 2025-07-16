import { useEffect } from 'react';
import './App.css';
import './styles/lobby.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { useToastStore } from './store/toast.store';
import ToastContainer from './components/ToastContainer';
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
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { loadUser } = useAuthStore();
  const { toasts, removeToast } = useToastStore();
  
  useEffect(() => {
    // Check authentication status when app loads
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/user-management" element={<UserManagementPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/topup" element={<TopUpPage />} />
          <Route path="/history" element={<GameHistoryPage />} />
          <Route path="/lobbies/*" element={<LobbyPage />} />
          <Route path="/game/:matchID" element={<GamePage />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />
    </Router>
  );
}

export default App;

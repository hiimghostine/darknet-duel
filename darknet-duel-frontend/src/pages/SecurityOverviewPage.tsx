import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaEye, FaArrowLeft, FaSearch, FaFilter, FaGamepad } from 'react-icons/fa';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import { useThemeStore } from '../store/theme.store';
import { logService, type Log, type GetLogsOptions } from '../services/log.service';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';

const SecurityOverviewPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check authentication and admin/moderator permissions
  if (!isAuthenticated || (user?.type !== 'admin' && user?.type !== 'mod')) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/auth', { replace: true });
    }, 1000);
  };

  const goBack = () => {
    navigate('/admin');
  };

  // State for logs and pagination
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Filter state
  const [filters, setFilters] = useState<GetLogsOptions>({
    page: 1,
    limit: 50
  });

  // Load logs
  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const result = await logService.getLogs(filters);
      setLogs(result.logs);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load logs:', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to load logs' });
    } finally {
      setIsLoading(false);
    }
  };

  // Load logs on component mount and when filters change
  useEffect(() => {
    loadLogs();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof GetLogsOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle search
  const handleSearch = () => {
    loadLogs();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };



  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
                <FaShieldAlt className="text-2xl text-error" />
                <h1 className="text-2xl font-mono font-bold text-error glitch-text">
                  SECURITY_OVERVIEW_SYSTEM
                </h1>
                <div className="px-2 py-1 bg-error/20 border border-error/40 text-error text-xs font-mono rounded">
                  {user?.type === 'admin' ? 'ADMIN_ACCESS' : 'MODERATOR_ACCESS'}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={goBack}
                  className="btn btn-sm bg-base-300/80 border-error/30 hover:border-error text-error btn-cyberpunk"
                >
                  <FaArrowLeft className="mr-1" /> BACK_TO_ADMIN
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-sm bg-primary/20 border-primary/50 hover:bg-primary/30 text-primary btn-cyberpunk"
                >
                  <FaGamepad className="mr-1" />
                  PLAY GAME
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

        {/* Main content */}
        <main className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-mono text-error mb-2">SECURITY_LOGS.exe</h2>
            <p className="text-base-content/70">Monitor system activities and admin actions</p>
          </div>

          {/* Filters */}
          <div className="bg-base-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search by user */}
              <div>
                <label className="block text-sm font-mono text-base-content/70 mb-1">
                  SEARCH_BY_USER
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter user ID..."
                    className="flex-1 px-3 py-2 bg-base-100 border border-base-content/20 rounded font-mono text-sm text-base-content focus:border-error/50 focus:outline-none"
                    value={filters.userId || ''}
                    onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    className="px-3 py-2 bg-error/20 border border-error/50 text-error hover:bg-error/30 transition-colors rounded font-mono text-sm"
                  >
                    <FaSearch />
                  </button>
                </div>
              </div>

              {/* Page size */}
              <div>
                <label className="block text-sm font-mono text-base-content/70 mb-1">
                  LOGS_PER_PAGE
                </label>
                <select
                  value={filters.limit || 50}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-base-100 border border-base-content/20 rounded font-mono text-sm text-base-content focus:border-error/50 focus:outline-none"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Clear filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ page: 1, limit: 50 });
                  }}
                  className="w-full px-4 py-2 bg-base-300/50 border border-base-content/20 text-base-content hover:bg-base-300 transition-colors rounded font-mono text-sm"
                >
                  <FaFilter className="inline mr-2" />
                  CLEAR_FILTERS
                </button>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-base-200 border border-primary/20 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <LoadingScreen text="LOADING_LOGS" />
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center">
                <FaShieldAlt className="text-4xl text-base-content/30 mx-auto mb-4" />
                <p className="text-base-content/70 font-mono">No logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-base-300/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">TIMESTAMP</th>
                      <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">USER</th>
                      <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-base-content/10 hover:bg-base-300/30">
                        <td className="px-4 py-3">
                          <div className="text-xs text-base-content/60 font-mono">
                            {formatDate(log.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm">
                            <div className="text-base-content">{log.user.username}</div>
                            <div className="text-xs text-base-content/60">{log.user.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-md">
                            <p className="text-sm text-base-content/80 font-mono" title={log.text}>
                              {log.text}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 bg-base-200 border border-base-content/20 text-base-content hover:bg-base-300 transition-colors rounded font-mono text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 bg-base-200 border border-base-content/20 text-base-content rounded font-mono text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-2 bg-base-200 border border-base-content/20 text-base-content hover:bg-base-300 transition-colors rounded font-mono text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Show logout screen */}
      {isLoggingOut && <LogoutScreen />}
    </div>
  );
};

export default SecurityOverviewPage; 
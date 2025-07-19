import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaEye, FaTrash, FaCheck, FaTimes, FaSearch, FaFilter, FaBan, FaArrowLeft, FaGamepad } from 'react-icons/fa';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import { useThemeStore } from '../store/theme.store';
import { reportService, type Report, type GetReportsOptions, type ReportStats } from '../services/report.service';
import adminService, { type AdminUser } from '../services/admin.service';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import BanUserModal from '../components/admin/BanUserModal';

const ReportManagementPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check authentication and admin permissions
  if (!isAuthenticated || user?.type !== 'admin') {
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
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [userToBan, setUserToBan] = useState<AdminUser | null>(null);
  const [isBanning, setIsBanning] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filter states
  const [filters, setFilters] = useState<GetReportsOptions>({
    page: 1,
    limit: 20
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Load reports
  const loadReports = async () => {
    try {
      setIsLoading(true);
      const result = await reportService.getReports(filters);
      setReports(result.reports);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading reports:', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to load reports' });
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await reportService.getReportStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadReports();
    loadStats();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof GetReportsOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle search
  const handleSearch = () => {
    handleFilterChange('search', searchTerm);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    handleFilterChange('page', page);
  };

  // Handle report actions
  const handleUpdateStatus = async (reportId: string, status: 'reviewed' | 'resolved' | 'dismissed') => {
    try {
      await reportService.updateReportStatus(reportId, status);
      addToast({ type: 'success', title: 'Success', message: 'Report status updated' });
      loadReports(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating report status:', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to update report status' });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      await reportService.deleteReport(reportId);
      addToast({ type: 'success', title: 'Success', message: 'Report deleted' });
      loadReports(); // Reload to get updated data
    } catch (error) {
      console.error('Error deleting report:', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete report' });
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const report = await reportService.getReportById(reportId);
      setSelectedReport(report);
      setShowReportModal(true);
    } catch (error) {
      console.error('Error loading report details:', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to load report details' });
    }
  };

  const handleBanUser = async (reporteeId: string) => {
    try {
      // Get user details for the ban modal
      const user = await adminService.getUserById(reporteeId);
      setUserToBan(user);
      setShowBanModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to load user details' });
    }
  };

  const handleConfirmBan = async (reason: string) => {
    if (!userToBan) return;

    setIsBanning(true);
    try {
      await adminService.banUser(userToBan.id, reason);
      addToast({ type: 'success', title: 'Success', message: `User ${userToBan.username} has been banned` });
      setShowBanModal(false);
      setUserToBan(null);
      // Reload reports to reflect any changes
      loadReports();
    } catch (error) {
      console.error('Error banning user:', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to ban user' });
    } finally {
      setIsBanning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-warning';
      case 'reviewed': return 'text-info';
      case 'resolved': return 'text-success';
      case 'dismissed': return 'text-error';
      default: return 'text-base-content';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-warning/20 border-warning/50 text-warning',
      reviewed: 'bg-info/20 border-info/50 text-info',
      resolved: 'bg-success/20 border-success/50 text-success',
      dismissed: 'bg-error/20 border-error/50 text-error'
    };

    return `px-2 py-1 rounded text-xs font-mono border ${colors[status as keyof typeof colors] || colors.pending}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user || user.type !== 'admin') {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-mono font-bold text-error mb-4">ACCESS_DENIED</h1>
          <p className="text-base-content/70">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

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
                <FaExclamationTriangle className="text-2xl text-error" />
                <h1 className="text-2xl font-mono font-bold text-error glitch-text">
                  REPORT_MANAGEMENT_SYSTEM
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

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-base-200 border border-primary/20 rounded-lg p-4">
              <div className="text-2xl font-mono font-bold text-primary">{stats.totalReports}</div>
              <div className="text-xs text-base-content/70 font-mono">TOTAL_REPORTS</div>
            </div>
            <div className="bg-base-200 border border-warning/20 rounded-lg p-4">
              <div className="text-2xl font-mono font-bold text-warning">{stats.pendingReports}</div>
              <div className="text-xs text-base-content/70 font-mono">PENDING</div>
            </div>
            <div className="bg-base-200 border border-success/20 rounded-lg p-4">
              <div className="text-2xl font-mono font-bold text-success">{stats.resolvedReports}</div>
              <div className="text-xs text-base-content/70 font-mono">RESOLVED</div>
            </div>
            <div className="bg-base-200 border border-error/20 rounded-lg p-4">
              <div className="text-2xl font-mono font-bold text-error">{stats.dismissedReports}</div>
              <div className="text-xs text-base-content/70 font-mono">DISMISSED</div>
            </div>
            <div className="bg-base-200 border border-info/20 rounded-lg p-4">
              <div className="text-2xl font-mono font-bold text-info">{stats.profileReports}</div>
              <div className="text-xs text-base-content/70 font-mono">PROFILE_REPORTS</div>
            </div>
            <div className="bg-base-200 border border-secondary/20 rounded-lg p-4">
              <div className="text-2xl font-mono font-bold text-secondary">{stats.chatReports}</div>
              <div className="text-xs text-base-content/70 font-mono">CHAT_REPORTS</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="bg-base-200 border border-primary/20 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 bg-base-100 border border-base-content/20 rounded font-mono text-sm focus:border-primary/50 focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors rounded font-mono text-sm"
                >
                  <FaSearch />
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-base-100 border border-base-content/20 rounded font-mono text-sm text-base-content focus:border-primary/50 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.reportType || ''}
                onChange={(e) => handleFilterChange('reportType', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-base-100 border border-base-content/20 rounded font-mono text-sm text-base-content focus:border-primary/50 focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="profile">Profile</option>
                <option value="chat">Chat</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-base-200 border border-primary/20 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <LoadingScreen text="LOADING_REPORTS" />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <FaExclamationTriangle className="text-4xl text-base-content/30 mx-auto mb-4" />
              <p className="text-base-content/70 font-mono">No reports found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-base-300/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">ID</th>
                    <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">REPORTER</th>
                    <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">REPORTEE</th>
                    <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">TYPE</th>
                    <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">REASON</th>
                    <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">STATUS</th>
                    <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">DATE</th>
                    <th className="px-4 py-3 text-left font-mono text-sm text-base-content/70">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-t border-base-content/10 hover:bg-base-300/30">
                      <td className="px-4 py-3 font-mono text-xs text-base-content/60">
                        {report.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm">
                          <div className="text-base-content">{report.reporter.username}</div>
                          <div className="text-xs text-base-content/60">{report.reporter.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm">
                          <div className="text-base-content">{report.reportee.username}</div>
                          <div className="text-xs text-base-content/60">{report.reportee.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-mono border ${
                          report.reportType === 'profile' 
                            ? 'bg-info/20 border-info/50 text-info' 
                            : 'bg-secondary/20 border-secondary/50 text-secondary'
                        }`}>
                          {report.reportType.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm text-base-content/80 font-mono truncate" title={report.reason}>
                            {report.reason}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusBadge(report.status)}>
                          {report.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-base-content/60 font-mono">
                          {formatDate(report.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewReport(report.id)}
                            className="p-1 text-primary hover:text-primary/80 transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                                className="p-1 text-info hover:text-info/80 transition-colors"
                                title="Mark as Reviewed"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                className="p-1 text-error hover:text-error/80 transition-colors"
                                title="Dismiss Report"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1 text-error hover:text-error/80 transition-colors"
                            title="Delete Report"
                          >
                            <FaTrash />
                          </button>
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
      </div>
      
      {/* Show logout screen */}
      {isLoggingOut && <LogoutScreen />}
    </div>

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReportModal(false)} />
          <div className="relative bg-base-100 border border-primary/30 rounded-lg p-6 w-full max-w-2xl mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-mono font-bold text-error">REPORT_DETAILS</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-base-content/60 hover:text-base-content transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-base-content/60 font-mono">REPORTER</label>
                  <p className="text-sm font-mono text-base-content">{selectedReport.reporter.username}</p>
                  <p className="text-xs text-base-content/60">{selectedReport.reporter.email}</p>
                </div>
                <div>
                  <label className="text-xs text-base-content/60 font-mono">REPORTEE</label>
                  <p className="text-sm font-mono text-base-content">{selectedReport.reportee.username}</p>
                  <p className="text-xs text-base-content/60">{selectedReport.reportee.email}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-base-content/60 font-mono">REASON</label>
                <p className="text-sm font-mono bg-base-200 p-3 rounded text-base-content">{selectedReport.reason}</p>
              </div>
              
              {selectedReport.content && (
                <div>
                  <label className="text-xs text-base-content/60 font-mono">CONTENT</label>
                  <p className="text-sm font-mono bg-base-200 p-3 rounded text-base-content">{selectedReport.content}</p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-base-content/60 font-mono">TYPE</label>
                  <p className="text-sm font-mono text-base-content">{selectedReport.reportType}</p>
                </div>
                <div>
                  <label className="text-xs text-base-content/60 font-mono">STATUS</label>
                  <p className="text-sm font-mono text-base-content">{selectedReport.status}</p>
                </div>
                <div>
                  <label className="text-xs text-base-content/60 font-mono">CREATED</label>
                  <p className="text-sm font-mono text-base-content">{formatDate(selectedReport.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              {selectedReport.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedReport.id, 'reviewed');
                      setShowReportModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-info/20 border border-info/50 text-info hover:bg-info/30 transition-colors rounded font-mono text-sm"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedReport.id, 'dismissed');
                      setShowReportModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-error/20 border border-error/50 text-error hover:bg-error/30 transition-colors rounded font-mono text-sm"
                  >
                    Dismiss Report
                  </button>
                </>
              )}
              
              {/* Ban User Button - Only show for mods and admins */}
              {user?.type && ['mod', 'admin'].includes(user.type) && (
                <button
                  onClick={() => {
                    handleBanUser(selectedReport.reportee.id);
                    setShowReportModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-warning/20 border border-warning/50 text-warning hover:bg-warning/30 transition-colors rounded font-mono text-sm"
                >
                  <FaBan className="inline mr-1" />
                  Ban User
                </button>
              )}
              
              <button
                onClick={() => {
                  handleDeleteReport(selectedReport.id);
                  setShowReportModal(false);
                }}
                className="flex-1 px-4 py-2 bg-error/20 border border-error/50 text-error hover:bg-error/30 transition-colors rounded font-mono text-sm"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Ban User Modal */}
      <BanUserModal
        user={userToBan}
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setUserToBan(null);
        }}
        onConfirm={handleConfirmBan}
        isLoading={isBanning}
      />
    </div>
  );
};

export default ReportManagementPage; 
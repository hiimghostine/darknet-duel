import React, { useState, useEffect, useCallback } from 'react';
import adminService, { type AdminUser, type UserFilters, type PaginatedUsersResponse } from '../../services/admin.service';
import UserProfilePopup from '../UserProfilePopup';
import UserEditModal from './UserEditModal';
import BanUserModal from './BanUserModal';

interface UserManagementProps {
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onError, onSuccess }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // Search and filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'user' | 'mod' | 'admin' | ''>('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  // UI state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [banningUser, setBanningUser] = useState<AdminUser | null>(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profilePopupPosition, setProfilePopupPosition] = useState({ x: 0, y: 0 });
  const [showBanModal, setShowBanModal] = useState(false);
  const [banLoading, setBanLoading] = useState(false);

  // Load users
  const loadUsers = useCallback(async (filters: UserFilters = {}) => {
    setLoading(true);
    try {
      const response: PaginatedUsersResponse = await adminService.getUsers({
        page: filters.page || 1,
        limit: filters.limit || 20,
        search: filters.search !== undefined ? filters.search : (search || undefined),
        type: filters.type !== undefined ? filters.type : (typeFilter || undefined),
        isActive: filters.isActive !== undefined ? filters.isActive : statusFilter,
      });
      

      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
      onError?.('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, onError]);

  // Initial load
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle search
  const handleSearch = () => {
    loadUsers({ 
      page: 1,
      limit: 20,
      search: search || undefined,
      type: typeFilter || undefined,
      isActive: statusFilter
    });
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter(undefined);
    loadUsers({ 
      page: 1,
      limit: 20,
      search: undefined, 
      type: undefined, 
      isActive: undefined 
    });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    loadUsers({ 
      page: newPage,
      limit: 20,
      search: search || undefined,
      type: typeFilter || undefined,
      isActive: statusFilter
    });
  };

  // Handle username click to show profile popup
  const handleUsernameClick = (user: AdminUser, event: React.MouseEvent) => {
    setSelectedUser(user);
    setProfilePopupPosition({ x: event.clientX, y: event.clientY });
    setShowProfilePopup(true);
  };

  // Handle edit user
  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
  };

  // Handle ban user
  const handleBanUser = (user: AdminUser) => {
    setBanningUser(user);
    setShowBanModal(true);
  };

  // Handle ban confirmation
  const handleBanConfirm = async (reason: string) => {
    if (!banningUser) return;

    setBanLoading(true);
    try {
      await adminService.banUser(banningUser.id, reason);
      onSuccess?.(`User "${banningUser.username}" banned successfully`);
      setShowBanModal(false);
      setBanningUser(null);
      loadUsers(); // Reload users list
    } catch (error) {
      console.error('Failed to ban user:', error);
      onError?.('Failed to ban user');
    } finally {
      setBanLoading(false);
    }
  };

  // Handle unban user
  const handleUnbanUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to unban user "${user.username}"?`)) {
      return;
    }

    try {
      await adminService.unbanUser(user.id);
      onSuccess?.(`User "${user.username}" unbanned successfully`);
      loadUsers(); // Reload users list
    } catch (error) {
      console.error('Failed to unban user:', error);
      onError?.('Failed to unban user');
    }
  };

  // Handle ban modal close
  const handleBanModalClose = () => {
    setShowBanModal(false);
    setBanningUser(null);
    setBanLoading(false);
  };

  // Handle user update from edit modal
  const handleUserUpdated = () => {
    setEditingUser(null);
    loadUsers(); // Reload users list
    onSuccess?.('User updated successfully');
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Get user type badge color
  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case 'admin':
        return 'badge-error';
      case 'mod':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-mono text-error mb-2">USER_MANAGEMENT.exe</h2>
        <p className="text-base-content/70">Manage system users and access controls</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-base-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-mono text-base-content/70 mb-1">
              SEARCH_QUERY
            </label>
            <input
              type="text"
              placeholder="Search by username or email..."
              className="input input-bordered w-full bg-base-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-mono text-base-content/70 mb-1">
              USER_TYPE
            </label>
            <select
              className="select select-bordered w-full bg-base-100 text-base-content"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="mod">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-mono text-base-content/70 mb-1">
              STATUS
            </label>
            <select
              className="select select-bordered w-full bg-base-100 text-base-content"
              value={statusFilter === undefined ? '' : statusFilter.toString()}
              onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleClearSearch}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-base-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-300">
              <tr>
                <th className="font-mono text-xs text-base-content">AVATAR</th>
                <th className="font-mono text-xs text-base-content">USERNAME</th>
                <th className="font-mono text-xs text-base-content">STATUS</th>
                <th className="font-mono text-xs text-base-content">CREATED</th>
                <th className="font-mono text-xs text-base-content">CREDS</th>
                <th className="font-mono text-xs text-base-content">CRYPTS</th>
                <th className="font-mono text-xs text-base-content">TYPE</th>
                <th className="font-mono text-xs text-base-content">ACTIONS</th>
              </tr>
            </thead>
            <tbody>

              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="loading loading-spinner loading-md"></div>
                    <div className="text-base-content/70 mt-2">Loading users...</div>
                  </td>
                </tr>
              ) : !users || users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="text-base-content/70">No users found</div>
                  </td>
                </tr>
              ) : (
                (users || []).map((user) => (
                  <tr key={user.id} className="hover">
                    {/* Avatar */}
                    <td>
                      <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center overflow-hidden relative">
                        {user.hasAvatar ? (
                          <>
                            <img
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/files/avatar/${user.id}`}
                              alt={`${user.username} avatar`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.classList.remove('hidden');
                                }
                              }}
                            />
                            <span className="text-xs font-mono text-primary hidden absolute inset-0 flex items-center justify-center">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-mono text-primary">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Username */}
                    <td>
                      <button
                        className="text-primary hover:text-primary-focus underline font-mono"
                        onClick={(e) => handleUsernameClick(user, e)}
                      >
                        {user.username}
                      </button>
                    </td>

                    {/* Status */}
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className={`badge ${user.isActive ? 'badge-success' : 'badge-error'} badge-sm`}>
                          {user.isActive ? 'Active' : 'Banned'}
                        </div>
                        {!user.isActive && user.inactiveReason && (
                          <div className="text-xs text-error/70 font-mono max-w-32 truncate" title={user.inactiveReason}>
                            {user.inactiveReason}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="font-mono text-sm text-base-content">{formatDate(user.createdAt)}</td>

                    {/* Creds */}
                    <td className="font-mono text-sm text-base-content">{user.creds.toLocaleString()}</td>

                    {/* Crypts */}
                    <td className="font-mono text-sm text-base-content">{user.crypts.toLocaleString()}</td>

                    {/* Type */}
                    <td>
                      <div className={`badge ${getUserTypeBadge(user.type)} badge-sm`}>
                        {user.type.toUpperCase()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          ✏️
                        </button>
                        {user.isActive ? (
                          <button
                            className="btn btn-warning btn-xs"
                            onClick={() => handleBanUser(user)}
                            title="Ban User"
                          >
                            🚫
                          </button>
                        ) : (
                          <button
                            className="btn btn-success btn-xs"
                            onClick={() => handleUnbanUser(user)}
                            title="Unban User"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center p-4 bg-base-300">
            <div className="text-sm text-base-content/70 font-mono">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                «
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.totalPages || 
                  Math.abs(page - pagination.page) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <button className="join-item btn btn-sm btn-disabled">...</button>
                    )}
                    <button
                      className={`join-item btn btn-sm ${pagination.page === page ? 'btn-active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Popup */}
      {selectedUser && (
        <UserProfilePopup
          userId={selectedUser.id}
          username={selectedUser.username}
          isVisible={showProfilePopup}
          position={profilePopupPosition}
          onClose={() => setShowProfilePopup(false)}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUserUpdated}
          onError={onError}
        />
      )}

      {/* Ban User Modal */}
      <BanUserModal
        user={banningUser}
        isOpen={showBanModal}
        onClose={handleBanModalClose}
        onConfirm={handleBanConfirm}
        isLoading={banLoading}
      />
    </div>
  );
};

export default UserManagement; 
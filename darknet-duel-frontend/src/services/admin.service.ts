import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  type: 'user' | 'mod' | 'admin';
  isActive: boolean;
  lastLogin: string | null;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  rating: number;
  bio: string | null;
  creds: number;
  crypts: number;
  createdAt: string;
  updatedAt: string;
  hasAvatar: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'user' | 'mod' | 'admin';
  isActive?: boolean;
}

export interface PaginatedUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  type?: 'user' | 'mod' | 'admin';
  isActive?: boolean;
  bio?: string;
  creds?: number;
  crypts?: number;
  password?: string;
}

class AdminService {
  /**
   * Get paginated list of users with search and filtering
   */
  async getUsers(filters: UserFilters = {}): Promise<PaginatedUsersResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const queryString = params.toString();
    const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    // Extract the data from the API response structure: { success: true, data: { users: [...], pagination: {...} } }
    return response.data.data;
  }

  /**
   * Get detailed user information by ID
   */
  async getUserById(id: string): Promise<AdminUser> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  }

  /**
   * Update user details
   */
  async updateUser(id: string, updateData: UpdateUserData): Promise<AdminUser> {
    const response = await api.put(`/admin/users/${id}`, updateData);
    return response.data.data;
  }

  /**
   * Delete user account
   */
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }

  /**
   * Get user statistics for admin dashboard
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    modUsers: number;
    regularUsers: number;
  }> {
    const response = await api.get('/admin/stats');
    return response.data.data;
  }
}

export default new AdminService(); 
import api from './api';

export interface RecentActivityItem {
  type: 'WIN' | 'LOSS';
  opponent: string;
  time: string;
  timestamp: string; // ISO timestamp string from backend
  pointsChange: string;
  gameId: string;
  gameMode: string;
}

export interface ProfileStats {
  wins: number;
  losses: number;
  totalGames: number;
  winRate: string;
  rating: number;
  level: number;
}

export interface ProfileInfo {
  recentActivity: RecentActivityItem[];
  profileStats: ProfileStats;
  user: {
    id: string;
    username: string;
    email?: string; // Only available for own profile
    isActive: boolean;
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    rating: number;
    bio: string | null;
    createdAt: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileInfo;
  message?: string;
  error?: string;
}

export interface ActivityResponse {
  success: boolean;
  data: {
    recentActivity: RecentActivityItem[];
  };
  message?: string;
  error?: string;
}

export interface StatsResponse {
  success: boolean;
  data: {
    profileStats: ProfileStats;
  };
  message?: string;
  error?: string;
}

class InfoService {
  /**
   * Get complete profile information including recent activity and stats
   * @param limit - Optional limit for number of recent activities (default: 10)
   */
  async getProfile(limit?: number): Promise<ProfileInfo> {
    const params = limit ? { limit: limit.toString() } : {};
    const response = await api.get<ProfileResponse>('/info/profile', { params });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch profile information');
    }
    
    return response.data.data;
  }

  /**
   * Get only recent activity for the user
   * @param limit - Optional limit for number of activities (default: 10)
   */
  async getRecentActivity(limit?: number): Promise<RecentActivityItem[]> {
    const params = limit ? { limit: limit.toString() } : {};
    const response = await api.get<ActivityResponse>('/info/activity', { params });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch recent activity');
    }
    
    return response.data.data.recentActivity;
  }

  /**
   * Get only profile statistics for the user
   */
  async getProfileStats(): Promise<ProfileStats> {
    const response = await api.get<StatsResponse>('/info/stats');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch profile statistics');
    }
    
    return response.data.data.profileStats;
  }

  /**
   * Get profile information for any user by their ID
   * @param userId - The user's ID
   * @param limit - Optional limit for number of recent activities (default: 10)
   */
  async getProfileByUserId(userId: string, limit?: number): Promise<ProfileInfo> {
    const params = limit ? { limit: limit.toString() } : {};
    const response = await api.get<ProfileResponse>(`/info/profile/${userId}`, { params });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch profile information');
    }
    
    return response.data.data;
  }
}

export default new InfoService(); 
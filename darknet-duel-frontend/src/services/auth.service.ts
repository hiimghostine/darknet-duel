import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  type: 'user' | 'mod' | 'admin';
  isActive: boolean;
  lastLogin: string | null;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  level: number;
  creds: number;
  crypts: number;
  decoration: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }
  
  /**
   * Login a user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store token and user in local storage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }
  
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.data.user;
  }
  
  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  
  /**
   * Get current user from local storage
   */
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export default new AuthService();

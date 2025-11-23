import { create } from 'zustand';
import authService from '../services/auth.service';
import type { User, LoginCredentials, RegisterData } from '../services/auth.service';
import { showToast } from './toast.store';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isLoggedIn(),
  isLoading: false,
  error: null,
  
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login(credentials);
      set({ 
        isAuthenticated: true, 
        user: response.user, 
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status;
      
      // Handle inactive account with toast notification
      if (errorData?.isInactive) {
        const inactiveMessage = `Reason: ${errorData.inactiveReason}\n\nFor any help, please contact a mod or admin.`;
        
        // Show toast notification for inactive account
        showToast.error(
          'Account Inactive',
          inactiveMessage,
          10000 // Show for 10 seconds
        );
        
        set({ isLoading: false, error: null });
        return; // Don't throw error, just show toast
      }
      
      // Show toast notification for all non-200 responses
      if (status && status !== 200) {
        const errorMessage = errorData?.message || `Login failed (HTTP ${status}). Please try again.`;
        showToast.error(
          'Authentication Error',
          errorMessage,
          5000 // Show for 5 seconds
        );
      }
      
      const errorMessage = errorData?.message || 'Login failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
  
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    
    try {
      await authService.register(data);
      set({ isLoading: false });
      
      // Auto-login after successful registration
      await get().login({ email: data.email, password: data.password });
      // Show success toast after successful registration and login
      showToast.success(
        'Registration Successful',
        'Account created successfully! You are now logged in.',
        5000
      );
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status;
      
      // Show toast notification for all non-200 responses
      if (status && status !== 200) {
        const errorMessage = errorData?.message || `Registration failed (HTTP ${status}). Please try again.`;
        showToast.error(
          'Registration Error',
          errorMessage,
          5000 // Show for 5 seconds
        );
      }
      
      const errorMessage = errorData?.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
  
  logout: async () => {
    await authService.logout();
    set({ 
      user: null, 
      isAuthenticated: false,
      error: null
    });
  },
  
  loadUser: async () => {
    if (!authService.isLoggedIn()) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const user = await authService.getProfile();
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      authService.logout();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));

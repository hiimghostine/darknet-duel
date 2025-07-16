import { create } from 'zustand';
import { type ToastProps } from '../components/Toast';

interface ToastState {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toastData) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast: ToastProps = {
      ...toastData,
      id,
      onClose: () => {} // Will be handled by the store
    };

    set((state) => ({
      toasts: [...state.toasts, toast]
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  }
}));

// Convenience functions for different toast types
export const showToast = {
  success: (title: string, message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'success', title, message, duration });
  },
  
  error: (title: string, message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'error', title, message, duration });
  },
  
  warning: (title: string, message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'warning', title, message, duration });
  },
  
  info: (title: string, message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'info', title, message, duration });
  }
}; 
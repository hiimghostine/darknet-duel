import { create } from 'zustand';

export type Theme = 'cyberpunk' | 'cyberpunk-dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('theme');
  if (saved === 'cyberpunk' || saved === 'cyberpunk-dark') return saved;
  
  // Detect browser's preferred color scheme
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'cyberpunk-dark' : 'cyberpunk';
};

// Helper function to update theme with View Transition API
const updateThemeWithTransition = (newTheme: Theme) => {
  const doc = document as any;
  
  // Check if View Transition API is supported
  if (doc.startViewTransition) {
    doc.startViewTransition(() => {
      document.documentElement.setAttribute('data-theme', newTheme);
    });
  } else {
    // Fallback for browsers that don't support View Transition API
    document.documentElement.setAttribute('data-theme', newTheme);
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    updateThemeWithTransition(theme);
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'cyberpunk' ? 'cyberpunk-dark' : 'cyberpunk';
    set({ theme: newTheme });
    localStorage.setItem('theme', newTheme);
    updateThemeWithTransition(newTheme);
  },
}));

// Optimized selectors to prevent unnecessary re-renders
export const useTheme = () => useThemeStore((state) => state.theme);
export const useToggleTheme = () => useThemeStore((state) => state.toggleTheme);

// Listen for storage events to sync theme across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme' && (e.newValue === 'cyberpunk' || e.newValue === 'cyberpunk-dark')) {
      useThemeStore.getState().setTheme(e.newValue as Theme);
    }
  });
} 
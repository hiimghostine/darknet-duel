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
  return 'cyberpunk';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'cyberpunk' ? 'cyberpunk-dark' : 'cyberpunk';
    set({ theme: newTheme });
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  },
}));

// Listen for storage events to sync theme across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme' && (e.newValue === 'cyberpunk' || e.newValue === 'cyberpunk-dark')) {
      useThemeStore.getState().setTheme(e.newValue as Theme);
    }
  });
} 
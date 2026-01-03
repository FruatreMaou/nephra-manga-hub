import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'slate' | 'void' | 'ember' | 'flora';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { id: Theme; name: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'nephra-theme';

const themes = [
  { 
    id: 'slate' as Theme, 
    name: 'Slate', 
    description: 'Deep slate and charcoal, professional and neutral' 
  },
  { 
    id: 'void' as Theme, 
    name: 'Void', 
    description: 'Ultra-dark immersive mode for low-light reading' 
  },
  { 
    id: 'ember' as Theme, 
    name: 'Ember', 
    description: 'Warm amber accents for a cozy, elegant feel' 
  },
  { 
    id: 'flora' as Theme, 
    name: 'Flora', 
    description: 'Elegant light theme with fresh green accents' 
  },
];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && ['slate', 'void', 'ember', 'flora'].includes(stored)) {
        return stored as Theme;
      }
    }
    return 'slate';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-slate', 'theme-void', 'theme-ember', 'theme-flora');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Store preference
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

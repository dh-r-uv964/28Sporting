import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system');
  const [actualTheme, setActualTheme] = useState('light');

  const applyTheme = useCallback((currentTheme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let targetTheme = currentTheme;
    if (currentTheme === 'system') {
      targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(targetTheme);
    setActualTheme(targetTheme);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('28sporting-theme') || 'system';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const changeTheme = async (newTheme) => {
    localStorage.setItem('28sporting-theme', newTheme);
    setTheme(newTheme);
    
    try {
        const { AppSettings } = await import('@/api/entities');
        const { User } = await import('@/api/entities');
        const user = await User.me();
        const existingSettings = await AppSettings.filter({ user_email: user.email });
        if (existingSettings.length > 0) {
            await AppSettings.update(existingSettings[0].id, { theme: newTheme });
        } else {
            await AppSettings.create({ user_email: user.email, theme: newTheme });
        }
    } catch (error) {
        console.info("User not logged in, theme preference saved locally.");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
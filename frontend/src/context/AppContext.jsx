import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('welcome');
  const [theme, setTheme] = useState('dark'); // 'dark' (midnight purple/indigo) or 'light' (aurora gold/pink)
  const [snowActive, setSnowActive] = useState(true); // Snow is active by default
  const [fireworksActive, setFireworksActive] = useState(false);
  const [lanternsActive, setLanternsActive] = useState(false);

  // Apply theme class to HTML element for Tailwind CSS variables
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        theme,
        setTheme,
        toggleTheme,
        snowActive,
        setSnowActive,
        fireworksActive,
        setFireworksActive,
        lanternsActive,
        setLanternsActive
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

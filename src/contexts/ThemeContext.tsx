"use client";

import React, { createContext, useState, useEffect } from "react";

type ThemeContextValue = {
  isDarkTheme: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  isDarkTheme: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("app:theme:dark");
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("app:theme:dark", JSON.stringify(isDarkTheme));
    } catch {}
  }, [isDarkTheme]);

  const toggleTheme = () => setIsDarkTheme((v) => !v);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

'use client'

/**
 * Theme Context and Provider
 * Manages application theme (light/dark mode) with system preference detection and localStorage persistence
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'catatduit-theme'

/**
 * Detects system theme preference
 * @returns 'dark' if system prefers dark mode, 'light' otherwise
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  
  try {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  } catch (error) {
    console.warn('Failed to detect system theme preference:', error)
    return 'light'
  }
}

/**
 * Gets stored theme preference from localStorage
 * @returns Stored theme or null if not found
 */
function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
    return null
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error)
    return null
  }
}

/**
 * Stores theme preference to localStorage
 * @param theme Theme to store
 */
function storeTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (error) {
    console.warn('Failed to store theme to localStorage:', error)
  }
}

/**
 * Applies theme to document root
 * @param theme Theme to apply
 */
function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  
  // Remove both classes first
  root.classList.remove('light', 'dark')
  
  // Add the new theme class
  root.classList.add(theme)
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      theme === 'dark' ? '#0F172A' : '#F8FAFC'
    )
  }
}

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * ThemeProvider Component
 * Provides theme context to all child components
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from localStorage or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = getStoredTheme()
    if (stored) return stored
    return getSystemTheme()
  })

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      const stored = getStoredTheme()
      if (!stored) {
        const newTheme = e.matches ? 'dark' : 'light'
        setThemeState(newTheme)
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    storeTheme(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * useTheme Hook
 * Custom hook to access theme context
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

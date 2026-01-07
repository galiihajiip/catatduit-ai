'use client'

/**
 * Language Context and Provider
 * Manages application language (id/en) with browser detection and localStorage persistence
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Locale = 'id' | 'en'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, any>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LOCALE_STORAGE_KEY = 'catatduit-locale'

/**
 * Detects browser language preference
 * @returns 'id' for Indonesian-related languages, 'en' otherwise
 */
function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'id'
  
  try {
    const browserLang = navigator.language.toLowerCase()
    
    // Check for Indonesian
    if (browserLang.startsWith('id')) {
      return 'id'
    }
    
    // Default to English for all other languages
    return 'en'
  } catch (error) {
    console.warn('Failed to detect browser language:', error)
    return 'id'
  }
}

/**
 * Gets stored locale preference from localStorage
 * @returns Stored locale or null if not found
 */
function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'id' || stored === 'en') {
      return stored
    }
    return null
  } catch (error) {
    console.warn('Failed to read locale from localStorage:', error)
    return null
  }
}

/**
 * Stores locale preference to localStorage
 * @param locale Locale to store
 */
function storeLocale(locale: Locale): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch (error) {
    console.warn('Failed to store locale to localStorage:', error)
  }
}

/**
 * Gets nested value from object using dot notation
 * @param obj Object to search
 * @param path Dot-separated path (e.g., 'dashboard.title')
 * @returns Value at path or undefined
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Interpolates variables in translation string
 * @param str Translation string with {{variable}} placeholders
 * @param params Object with variable values
 * @returns Interpolated string
 */
function interpolate(str: string, params?: Record<string, any>): string {
  if (!params) return str
  
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

interface LanguageProviderProps {
  children: React.ReactNode
  translations: Record<Locale, any>
}

/**
 * LanguageProvider Component
 * Provides language context to all child components
 */
export function LanguageProvider({ children, translations }: LanguageProviderProps) {
  // Initialize locale from localStorage or browser preference
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = getStoredLocale()
    if (stored) return stored
    return getBrowserLocale()
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    storeLocale(newLocale)
  }, [])

  /**
   * Translation function
   * @param key Translation key (supports nested keys with dot notation)
   * @param params Optional parameters for interpolation
   * @returns Translated string
   */
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    const currentTranslations = translations[locale]
    
    if (!currentTranslations) {
      console.warn(`Translations not found for locale: ${locale}`)
      return key
    }
    
    const value = getNestedValue(currentTranslations, key)
    
    if (value === undefined) {
      console.warn(`Translation key not found: ${key} (locale: ${locale})`)
      
      // Fallback to Indonesian if current locale is English
      if (locale === 'en') {
        const fallbackValue = getNestedValue(translations.id, key)
        if (fallbackValue !== undefined) {
          return interpolate(fallbackValue, params)
        }
      }
      
      return key
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`)
      return key
    }
    
    return interpolate(value, params)
  }, [locale, translations])

  const value: LanguageContextType = {
    locale,
    setLocale,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/**
 * useLanguage Hook
 * Custom hook to access language context
 * @returns Language context value
 * @throws Error if used outside LanguageProvider
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  
  return context
}

/**
 * useTranslation Hook
 * Convenience hook that returns just the translation function
 * @returns Translation function
 */
export function useTranslation() {
  const { t } = useLanguage()
  return { t }
}

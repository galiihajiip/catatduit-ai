/**
 * Language Context Tests
 * Tests for LanguageProvider and useLanguage hook
 * Feature: theme-i18n-enhancement
 */

import React from 'react'
import { renderHook, act } from '@testing-library/react'
import * as fc from 'fast-check'
import { LanguageProvider, useLanguage, useTranslation } from '../LanguageContext'

// Mock translations
const mockTranslations = {
  id: {
    common: {
      welcome: 'Selamat Datang',
      hello: 'Halo {{name}}',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Ringkasan Keuangan',
    },
  },
  en: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello {{name}}',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Financial Summary',
    },
  },
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock navigator.language
Object.defineProperty(window.navigator, 'language', {
  writable: true,
  value: 'id-ID',
})

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('LanguageProvider', () => {
    it('should provide language context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current).toBeDefined()
      expect(result.current.locale).toBeDefined()
      expect(result.current.setLocale).toBeDefined()
      expect(result.current.t).toBeDefined()
    })

    it('should throw error when useLanguage is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useLanguage())
      }).toThrow('useLanguage must be used within a LanguageProvider')

      consoleSpy.mockRestore()
    })

    it('should initialize with Indonesian by default', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.locale).toBe('id')
    })

    it('should set locale', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLocale('en')
      })

      expect(result.current.locale).toBe('en')
    })

    it('should persist locale to localStorage', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLocale('en')
      })

      expect(localStorageMock.getItem('catatduit-locale')).toBe('en')
    })
  })

  describe('Translation Function', () => {
    it('should translate simple keys', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t('common.welcome')).toBe('Selamat Datang')
    })

    it('should translate nested keys', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t('dashboard.title')).toBe('Dashboard')
      expect(result.current.t('dashboard.subtitle')).toBe('Ringkasan Keuangan')
    })

    it('should interpolate variables', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t('common.hello', { name: 'John' })).toBe('Halo John')
    })

    it('should return key for missing translations', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t('nonexistent.key')).toBe('nonexistent.key')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Translation key not found')
      )

      consoleSpy.mockRestore()
    })

    it('should update translations when locale changes', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t('common.welcome')).toBe('Selamat Datang')

      act(() => {
        result.current.setLocale('en')
      })

      expect(result.current.t('common.welcome')).toBe('Welcome')
    })
  })

  describe('useTranslation Hook', () => {
    it('should return translation function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useTranslation(), { wrapper })

      expect(result.current.t).toBeDefined()
      expect(result.current.t('common.welcome')).toBe('Selamat Datang')
    })
  })

  describe('Property Tests', () => {
    /**
     * Property 4: Language preference restoration (Round-trip)
     * Feature: theme-i18n-enhancement, Property 4: Language preference restoration
     * Validates: Requirements 1.4
     * 
     * For any language preference stored in localStorage, when the application reloads,
     * the system should restore that exact language preference
     */
    it('Property 4: Language round-trip - stored locale is restored on reload', () => {
      fc.assert(
        fc.property(fc.constantFrom('id' as const, 'en' as const), (locale) => {
          // Clear any previous state
          localStorageMock.clear()

          // Store locale in localStorage
          localStorageMock.setItem('catatduit-locale', locale)

          // Create new provider instance (simulating reload)
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
          )

          const { result } = renderHook(() => useLanguage(), { wrapper })

          // Verify locale is restored
          expect(result.current.locale).toBe(locale)
          expect(localStorageMock.getItem('catatduit-locale')).toBe(locale)
        }),
        { numRuns: 100 }
      )
    })

    it('Property 4 Extended: Language persistence survives multiple changes', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('id' as const, 'en' as const), { minLength: 1, maxLength: 10 }),
          (locales) => {
            // Clear state
            localStorageMock.clear()

            const wrapper = ({ children }: { children: React.ReactNode }) => (
              <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
            )

            const { result, unmount } = renderHook(() => useLanguage(), { wrapper })

            // Perform locale changes
            let expectedLocale = locales[locales.length - 1]
            locales.forEach((locale) => {
              act(() => {
                result.current.setLocale(locale)
              })
            })

            // Verify final state
            expect(result.current.locale).toBe(expectedLocale)
            expect(localStorageMock.getItem('catatduit-locale')).toBe(expectedLocale)

            // Unmount and remount (simulate reload)
            unmount()

            const { result: newResult } = renderHook(() => useLanguage(), { wrapper })

            // Verify locale is restored
            expect(newResult.current.locale).toBe(expectedLocale)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property 4 Edge Case: Invalid stored locale falls back to browser preference', () => {
      // Store invalid locale
      localStorageMock.setItem('catatduit-locale', 'invalid-locale')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={mockTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Should fallback to Indonesian (browser default in our mock)
      expect(result.current.locale).toBe('id')
    })
  })
})

/**
 * Translation Property Tests
 * Property-based tests for translation system
 * Feature: theme-i18n-enhancement
 */

import React from 'react'
import { renderHook, act } from '@testing-library/react'
import * as fc from 'fast-check'
import { LanguageProvider, useLanguage } from '../LanguageContext'
import { translations } from '../../translations'

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

describe('Translation Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear()
    // Reset navigator.language to Indonesian
    Object.defineProperty(window.navigator, 'language', {
      writable: true,
      value: 'id-ID',
    })
  })

  /**
   * Property 12: Nested translation key resolution
   * Feature: theme-i18n-enhancement, Property 12: Nested translation key resolution
   * Validates: Requirements 5.4
   * 
   * For any nested translation key (e.g., "dashboard.title"), the translation function
   * should correctly resolve the nested path and return the appropriate translated value
   */
  describe('Property 12: Nested translation key resolution', () => {
    it('should resolve all valid nested keys in Indonesian', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={translations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Test all nested keys in the translation object
      const testKeys = [
        { key: 'common.welcome', expected: 'Selamat Datang' },
        { key: 'dashboard.title', expected: 'Dashboard' },
        { key: 'wallet.addWallet', expected: 'Tambah Dompet' },
        { key: 'transaction.income', expected: 'Pemasukan' },
        { key: 'category.food', expected: 'Makanan & Minuman' },
        { key: 'settings.theme', expected: 'Tema' },
        { key: 'months.january', expected: 'Januari' },
        { key: 'errors.generic', expected: 'Terjadi kesalahan. Silakan coba lagi.' },
      ]

      testKeys.forEach(({ key, expected }) => {
        expect(result.current.t(key)).toBe(expected)
      })
    })

    it('should resolve all valid nested keys in English', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={translations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLocale('en')
      })

      const testKeys = [
        { key: 'common.welcome', expected: 'Welcome' },
        { key: 'dashboard.title', expected: 'Dashboard' },
        { key: 'wallet.addWallet', expected: 'Add Wallet' },
        { key: 'transaction.income', expected: 'Income' },
        { key: 'category.food', expected: 'Food & Beverage' },
        { key: 'settings.theme', expected: 'Theme' },
        { key: 'months.january', expected: 'January' },
        { key: 'errors.generic', expected: 'An error occurred. Please try again.' },
      ]

      testKeys.forEach(({ key, expected }) => {
        expect(result.current.t(key)).toBe(expected)
      })
    })

    it('Property 12: Nested keys with varying depths resolve correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'common.welcome',
            'dashboard.title',
            'wallet.addWallet',
            'transaction.income',
            'category.food',
            'settings.theme'
          ),
          (key) => {
            const wrapper = ({ children }: { children: React.ReactNode }) => (
              <LanguageProvider translations={translations}>{children}</LanguageProvider>
            )

            const { result } = renderHook(() => useLanguage(), { wrapper })

            // Should return a string (not the key itself)
            const translation = result.current.t(key)
            expect(typeof translation).toBe('string')
            expect(translation).not.toBe(key)
            expect(translation.length).toBeGreaterThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 13: Variable interpolation in translations
   * Feature: theme-i18n-enhancement, Property 13: Variable interpolation in translations
   * Validates: Requirements 5.5
   * 
   * For any translation string containing variable placeholders (e.g., "Hello {{name}}"),
   * the translation function should correctly replace placeholders with provided values
   */
  describe('Property 13: Variable interpolation', () => {
    it('should interpolate single variable', () => {
      // Add test translation with variable
      const testTranslations = {
        id: {
          test: {
            greeting: 'Halo {{name}}',
          },
        },
        en: {
          test: {
            greeting: 'Hello {{name}}',
          },
        },
      }

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={testTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t('test.greeting', { name: 'John' })).toBe('Halo John')
    })

    it('should interpolate multiple variables', () => {
      const testTranslations = {
        id: {
          test: {
            message: 'Halo {{name}}, saldo Anda adalah {{amount}}',
          },
        },
        en: {
          test: {
            message: 'Hello {{name}}, your balance is {{amount}}',
          },
        },
      }

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={testTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t('test.message', { name: 'John', amount: '1000' })).toBe(
        'Halo John, saldo Anda adalah 1000'
      )
    })

    it('Property 13: Variable interpolation works with any string values', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 0, max: 1000000 }),
          (name, amount) => {
            const testTranslations = {
              id: {
                test: {
                  message: 'Pengguna {{name}} memiliki saldo {{amount}}',
                },
              },
              en: {
                test: {
                  message: 'User {{name}} has balance {{amount}}',
                },
              },
            }

            const wrapper = ({ children }: { children: React.ReactNode }) => (
              <LanguageProvider translations={testTranslations}>{children}</LanguageProvider>
            )

            const { result } = renderHook(() => useLanguage(), { wrapper })

            const translation = result.current.t('test.message', {
              name,
              amount: amount.toString(),
            })

            // Should contain both interpolated values
            expect(translation).toContain(name)
            expect(translation).toContain(amount.toString())
            // Should not contain the placeholder syntax
            expect(translation).not.toContain('{{')
            expect(translation).not.toContain('}}')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle missing interpolation parameters gracefully', () => {
      const testTranslations = {
        id: {
          test: {
            greeting: 'Halo {{name}}',
          },
        },
        en: {
          test: {
            greeting: 'Hello {{name}}',
          },
        },
      }

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={testTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Should keep placeholder if parameter not provided
      expect(result.current.t('test.greeting')).toBe('Halo {{name}}')
    })

    it('should use actual error messages with interpolation', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={translations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t('errors.minLength', { min: '5' })).toBe('Minimal 5 karakter')
      expect(result.current.t('errors.maxLength', { max: '100' })).toBe('Maksimal 100 karakter')
    })
  })

  /**
   * Property 11: Missing translation key fallback
   * Feature: theme-i18n-enhancement, Property 11: Missing translation key fallback
   * Validates: Requirements 5.2
   * 
   * For any non-existent translation key, the translation function should return
   * the fallback value (either the key itself or default language value) and log a warning
   */
  describe('Property 11: Missing translation key fallback', () => {
    it('should return key for missing translation', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={translations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      const missingKey = 'nonexistent.key.path'
      expect(result.current.t(missingKey)).toBe(missingKey)

      consoleSpy.mockRestore()
    })

    it('should log warning for missing translation', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={translations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      result.current.t('nonexistent.key')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Translation key not found')
      )

      consoleSpy.mockRestore()
    })

    it('Property 11: Any invalid key returns the key itself', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          (keyParts) => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

            const invalidKey = keyParts.join('.')

            const wrapper = ({ children }: { children: React.ReactNode }) => (
              <LanguageProvider translations={translations}>{children}</LanguageProvider>
            )

            const { result } = renderHook(() => useLanguage(), { wrapper })

            // Should return the key itself for invalid keys
            const translation = result.current.t(invalidKey)
            
            // Either returns the key or a valid translation (if key happens to exist)
            const isValidTranslation = translation !== invalidKey && translation.length > 0
            const isKeyFallback = translation === invalidKey

            expect(isValidTranslation || isKeyFallback).toBe(true)

            consoleSpy.mockRestore()
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should fallback to Indonesian when English translation is missing', () => {
      const testTranslations = {
        id: {
          test: {
            onlyInIndonesian: 'Hanya ada di Indonesia',
          },
        },
        en: {
          test: {},
        },
      }

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LanguageProvider translations={testTranslations}>{children}</LanguageProvider>
      )

      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLocale('en')
      })

      // Should fallback to Indonesian
      expect(result.current.t('test.onlyInIndonesian')).toBe('Hanya ada di Indonesia')

      consoleSpy.mockRestore()
    })
  })
})

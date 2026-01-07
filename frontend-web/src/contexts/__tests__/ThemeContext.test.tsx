/**
 * Theme Context Tests
 * Tests for ThemeProvider and useTheme hook
 * Feature: theme-i18n-enhancement
 */

import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import * as fc from 'fast-check'
import { ThemeProvider, useTheme } from '../ThemeContext'

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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    document.documentElement.className = ''
  })

  describe('ThemeProvider', () => {
    it('should provide theme context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current).toBeDefined()
      expect(result.current.theme).toBeDefined()
      expect(result.current.setTheme).toBeDefined()
      expect(result.current.toggleTheme).toBeDefined()
    })

    it('should throw error when useTheme is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useTheme())
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleSpy.mockRestore()
    })

    it('should initialize with light theme by default', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('light')
    })

    it('should apply theme class to document root', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      renderHook(() => useTheme(), { wrapper })

      expect(document.documentElement.classList.contains('light')).toBe(true)
    })

    it('should toggle theme', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })

    it('should set theme directly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('dark')
      })

      expect(result.current.theme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should persist theme to localStorage', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('dark')
      })

      expect(localStorageMock.getItem('catatduit-theme')).toBe('dark')
    })
  })

  describe('Property Tests', () => {
    /**
     * Property 8: Theme preference restoration (Round-trip)
     * Feature: theme-i18n-enhancement, Property 8: Theme preference restoration
     * Validates: Requirements 2.4
     * 
     * For any theme preference stored in localStorage, when the application reloads,
     * the system should restore that exact theme preference
     */
    it('Property 8: Theme round-trip - stored theme is restored on reload', () => {
      fc.assert(
        fc.property(fc.constantFrom('light' as const, 'dark' as const), (theme) => {
          // Clear any previous state
          localStorageMock.clear()
          document.documentElement.className = ''

          // Store theme in localStorage
          localStorageMock.setItem('catatduit-theme', theme)

          // Create new provider instance (simulating reload)
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
          )

          const { result } = renderHook(() => useTheme(), { wrapper })

          // Verify theme is restored
          expect(result.current.theme).toBe(theme)
          expect(document.documentElement.classList.contains(theme)).toBe(true)
          expect(localStorageMock.getItem('catatduit-theme')).toBe(theme)
        }),
        { numRuns: 100 }
      )
    })

    it('Property 8 Extended: Theme persistence survives multiple toggles', () => {
      fc.assert(
        fc.property(
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
          (toggles) => {
            // Clear state
            localStorageMock.clear()
            document.documentElement.className = ''

            const wrapper = ({ children }: { children: React.ReactNode }) => (
              <ThemeProvider>{children}</ThemeProvider>
            )

            const { result, unmount } = renderHook(() => useTheme(), { wrapper })

            // Perform toggles
            let expectedTheme: 'light' | 'dark' = 'light'
            toggles.forEach(() => {
              act(() => {
                result.current.toggleTheme()
              })
              expectedTheme = expectedTheme === 'light' ? 'dark' : 'light'
            })

            // Verify final state
            expect(result.current.theme).toBe(expectedTheme)
            expect(localStorageMock.getItem('catatduit-theme')).toBe(expectedTheme)

            // Unmount and remount (simulate reload)
            unmount()

            const { result: newResult } = renderHook(() => useTheme(), { wrapper })

            // Verify theme is restored
            expect(newResult.current.theme).toBe(expectedTheme)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property 8 Edge Case: Invalid stored theme falls back to system preference', () => {
      // Store invalid theme
      localStorageMock.setItem('catatduit-theme', 'invalid-theme')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      // Should fallback to light (system default in our mock)
      expect(result.current.theme).toBe('light')
    })
  })
})

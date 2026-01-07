/**
 * ThemeToggle Component Tests
 * Tests for ThemeToggle component
 * Feature: theme-i18n-enhancement
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../ThemeToggle'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { translations } from '@/translations'

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

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider translations={translations}>{children}</LanguageProvider>
  </ThemeProvider>
)

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorageMock.clear()
    document.documentElement.className = ''
  })

  it('should render theme toggle button', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')
    expect(button).toBeInTheDocument()
  })

  it('should render with correct icon based on theme', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')
    
    // Should show sun icon in light mode (default)
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('should toggle theme on click', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Initial state: light mode
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(document.documentElement.classList.contains('light')).toBe(true)

    // Click to toggle to dark mode
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // Click again to toggle back to light mode
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('should toggle theme on Enter key press', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Initial state: light mode
    expect(button).toHaveAttribute('aria-pressed', 'false')

    // Press Enter to toggle
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should toggle theme on Space key press', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Initial state: light mode
    expect(button).toHaveAttribute('aria-pressed', 'false')

    // Press Space to toggle
    fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should show tooltip on hover', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Hover over button
    fireEvent.mouseEnter(button)

    // Tooltip should appear
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    // Should show either Indonesian or English
    expect(tooltip.textContent).toMatch(/Mode Gelap|Dark Mode/)
  })

  it('should hide tooltip on mouse leave', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Hover over button
    fireEvent.mouseEnter(button)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // Mouse leave
    fireEvent.mouseLeave(button)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('should show tooltip on focus', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Focus button
    fireEvent.focus(button)

    // Tooltip should appear
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
  })

  it('should have proper ARIA labels', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Should have aria-label
    expect(button).toHaveAttribute('aria-label')
    
    // Should have aria-pressed
    expect(button).toHaveAttribute('aria-pressed')
  })

  it('should update aria-label when theme changes', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Initial: light mode, label should be "Dark Mode" or "Mode Gelap"
    const initialLabel = button.getAttribute('aria-label')
    expect(initialLabel).toMatch(/Mode Gelap|Dark Mode/)

    // Toggle to dark mode
    fireEvent.click(button)

    // Label should change to "Light Mode" or "Mode Terang"
    const newLabel = button.getAttribute('aria-label')
    expect(newLabel).toMatch(/Mode Terang|Light Mode/)
    expect(newLabel).not.toBe(initialLabel)
  })

  it('should have minimum touch target size', () => {
    render(<ThemeToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Button should have w-11 h-11 classes (44x44px)
    expect(button).toHaveClass('w-11', 'h-11')
  })
})

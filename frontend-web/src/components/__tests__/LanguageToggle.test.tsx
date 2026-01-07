/**
 * LanguageToggle Component Tests
 * Tests for LanguageToggle component
 * Feature: theme-i18n-enhancement
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageToggle } from '../LanguageToggle'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
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

// Mock navigator.language
Object.defineProperty(window.navigator, 'language', {
  writable: true,
  value: 'id-ID',
})

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider translations={translations}>{children}</LanguageProvider>
  </ThemeProvider>
)

describe('LanguageToggle Component', () => {
  beforeEach(() => {
    localStorageMock.clear()
    Object.defineProperty(window.navigator, 'language', {
      writable: true,
      value: 'id-ID',
    })
  })

  it('should render language toggle button', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')
    expect(button).toBeInTheDocument()
  })

  it('should render with correct language indicator', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')
    
    // Should show ID in Indonesian mode (default)
    expect(button).toHaveTextContent('ID')
  })

  it('should toggle language on click', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Initial state: Indonesian
    expect(button).toHaveTextContent('ID')
    expect(localStorageMock.getItem('catatduit-locale')).toBeNull()

    // Click to toggle to English
    fireEvent.click(button)
    expect(button).toHaveTextContent('EN')
    expect(localStorageMock.getItem('catatduit-locale')).toBe('en')

    // Click again to toggle back to Indonesian
    fireEvent.click(button)
    expect(button).toHaveTextContent('ID')
    expect(localStorageMock.getItem('catatduit-locale')).toBe('id')
  })

  it('should toggle language on Enter key press', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Initial state: Indonesian
    expect(button).toHaveTextContent('ID')

    // Press Enter to toggle
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(button).toHaveTextContent('EN')
    expect(localStorageMock.getItem('catatduit-locale')).toBe('en')
  })

  it('should toggle language on Space key press', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Initial state: Indonesian
    expect(button).toHaveTextContent('ID')

    // Press Space to toggle
    fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    expect(button).toHaveTextContent('EN')
    expect(localStorageMock.getItem('catatduit-locale')).toBe('en')
  })

  it('should show tooltip on hover', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Hover over button
    fireEvent.mouseEnter(button)

    // Tooltip should appear
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveTextContent('English')
  })

  it('should hide tooltip on mouse leave', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Hover over button
    fireEvent.mouseEnter(button)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // Mouse leave
    fireEvent.mouseLeave(button)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('should show tooltip on focus', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Focus button
    fireEvent.focus(button)

    // Tooltip should appear
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
  })

  it('should have proper ARIA labels', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Should have aria-label
    expect(button).toHaveAttribute('aria-label')
    
    // Should have aria-pressed
    expect(button).toHaveAttribute('aria-pressed')
  })

  it('should update aria-pressed when language changes', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Initial: Indonesian, aria-pressed should be false (not English)
    expect(button).toHaveAttribute('aria-pressed', 'false')

    // Toggle to English
    fireEvent.click(button)

    // aria-pressed should be true (is English)
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('should have minimum touch target size', () => {
    render(<LanguageToggle />, { wrapper: Wrapper })

    const button = screen.getByRole('switch')

    // Button should have w-11 h-11 classes (44x44px)
    expect(button).toHaveClass('w-11', 'h-11')
  })
})

/**
 * Property 2: Language toggle updates all translations
 * Feature: theme-i18n-enhancement, Property 2: Language toggle updates all translations
 * Validates: Requirements 1.2
 * 
 * For any component using translations, when the language is toggled,
 * all translation keys should return values from the newly selected language file
 */
describe('Property 2: Language toggle updates all translations', () => {
  it('should update all translations when language is toggled', () => {
    const { container } = render(
      <ThemeProvider>
        <LanguageProvider translations={translations}>
          <div>
            <LanguageToggle />
            <TestComponent />
          </div>
        </LanguageProvider>
      </ThemeProvider>
    )

    // Initial state: Indonesian
    expect(screen.getByTestId('welcome')).toHaveTextContent('Selamat Datang')
    expect(screen.getByTestId('dashboard')).toHaveTextContent('Dashboard')
    expect(screen.getByTestId('wallet')).toHaveTextContent('Tambah Dompet')

    // Toggle to English
    const button = screen.getByRole('switch')
    fireEvent.click(button)

    // All translations should update
    expect(screen.getByTestId('welcome')).toHaveTextContent('Welcome')
    expect(screen.getByTestId('dashboard')).toHaveTextContent('Dashboard')
    expect(screen.getByTestId('wallet')).toHaveTextContent('Add Wallet')

    // Toggle back to Indonesian
    fireEvent.click(button)

    // All translations should revert
    expect(screen.getByTestId('welcome')).toHaveTextContent('Selamat Datang')
    expect(screen.getByTestId('dashboard')).toHaveTextContent('Dashboard')
    expect(screen.getByTestId('wallet')).toHaveTextContent('Tambah Dompet')
  })
})

// Test component that uses translations
function TestComponent() {
  const { t } = useLanguage()
  
  return (
    <div>
      <div data-testid="welcome">{t('common.welcome')}</div>
      <div data-testid="dashboard">{t('dashboard.title')}</div>
      <div data-testid="wallet">{t('wallet.addWallet')}</div>
    </div>
  )
}

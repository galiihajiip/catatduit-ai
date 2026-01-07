'use client'

/**
 * ThemeToggle Component
 * Toggle button for switching between light and dark themes
 */

import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from '@/contexts/LanguageContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    toggleTheme()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleTheme()
    }
  }

  const isDark = theme === 'dark'
  const label = isDark ? t('settings.lightMode') : t('settings.darkMode')

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="relative w-11 h-11 rounded-full bg-background-surface border-2 border-border-light hover:border-primary transition-all duration-200 flex items-center justify-center group hover:shadow-md"
        aria-label={label}
        aria-pressed={isDark}
        role="switch"
        type="button"
      >
        {/* Sun Icon (Light Mode) */}
        <svg
          className={`absolute w-5 h-5 text-accent-orange transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Moon Icon (Dark Mode) */}
        <svg
          className={`absolute w-5 h-5 text-primary transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-background-surface border border-border-light rounded-lg shadow-lg text-sm text-text-primary whitespace-nowrap z-50 animate-fade-in"
          role="tooltip"
        >
          {label}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-background-surface border-l border-t border-border-light rotate-45" />
        </div>
      )}
    </div>
  )
}

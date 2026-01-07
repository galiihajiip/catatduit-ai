'use client'

/**
 * LanguageToggle Component
 * Toggle button for switching between Indonesian and English languages
 */

import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    setLocale(locale === 'id' ? 'en' : 'id')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setLocale(locale === 'id' ? 'en' : 'id')
    }
  }

  const isIndonesian = locale === 'id'
  const label = isIndonesian ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'
  const tooltipText = isIndonesian ? 'English' : 'Bahasa Indonesia'

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
        aria-pressed={!isIndonesian}
        role="switch"
        type="button"
      >
        {/* Language indicator */}
        <div className="flex items-center justify-center">
          <span
            className={`absolute font-semibold text-sm transition-all duration-300 ${
              isIndonesian
                ? 'opacity-100 scale-100 rotate-0'
                : 'opacity-0 scale-0 rotate-90'
            }`}
            style={{ color: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            ID
          </span>
          <span
            className={`absolute font-semibold text-sm transition-all duration-300 ${
              !isIndonesian
                ? 'opacity-100 scale-100 rotate-0'
                : 'opacity-0 scale-0 -rotate-90'
            }`}
            style={{ color: 'var(--color-secondary)' }}
            aria-hidden="true"
          >
            EN
          </span>
        </div>

        {/* Active indicator dot */}
        <div
          className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            isIndonesian ? 'bg-primary' : 'bg-secondary'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-background-surface border border-border-light rounded-lg shadow-lg text-sm text-text-primary whitespace-nowrap z-50 animate-fade-in"
          role="tooltip"
        >
          {tooltipText}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-background-surface border-l border-t border-border-light rotate-45" />
        </div>
      )}
    </div>
  )
}

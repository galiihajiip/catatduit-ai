'use client'

import { X, Check, Crown } from 'lucide-react'
import { useState } from 'react'

export function ProBadge({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded ${
        small ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-1 text-[10px]'
      }`}
    >
      <Crown className={small ? 'w-2 h-2' : 'w-3 h-3'} />
      PRO
    </span>
  )
}

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null

  const features = [
    'Unlimited Wallets',
    'Custom Categories',
    'AI Insight Recommendations',
    'Monthly PDF Export',
    'Historical Comparison',
    'Cloud Sync',
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-card p-6 animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-text-secondary/30 rounded-full mx-auto mb-6 sm:hidden" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>
        
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-text-primary text-center mb-2">
          Upgrade ke Pro
        </h2>
        <p className="text-text-secondary text-center text-sm mb-6">
          Dapatkan fitur premium untuk mengelola keuanganmu lebih baik
        </p>
        
        {/* Features */}
        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-text-primary">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <button className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold rounded-button hover:opacity-90 transition-opacity">
          Upgrade Sekarang - Rp 49.000/bulan
        </button>
        
        <button
          onClick={onClose}
          className="w-full py-3 text-text-secondary text-sm mt-2"
        >
          Nanti saja
        </button>
      </div>
    </div>
  )
}

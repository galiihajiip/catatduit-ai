'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { WALLET_TEMPLATES, WalletTemplate } from '@/lib/wallet-templates'

interface AddWalletModalProps {
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddWalletModal({ userId, onClose, onSuccess }: AddWalletModalProps) {
  const [step, setStep] = useState<'select' | 'custom'>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<WalletTemplate | null>(null)
  const [customName, setCustomName] = useState('')
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelectTemplate = (template: WalletTemplate) => {
    setSelectedTemplate(template)
    setStep('custom')
  }

  const handleCustomWallet = () => {
    setSelectedTemplate(null)
    setStep('custom')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const walletName = selectedTemplate ? selectedTemplate.name : customName
      const icon = selectedTemplate ? selectedTemplate.icon : '💰'
      const color = selectedTemplate ? selectedTemplate.color : '#7F8C8D'
      const initialBalance = parseFloat(balance) || 0

      const { error } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          name: walletName,
          balance: initialBalance,
          color_hex: color,
          icon: icon
        })

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating wallet:', error)
      alert('Gagal membuat wallet')
    } finally {
      setLoading(false)
    }
  }

  // Group wallets by type
  const ewallets = WALLET_TEMPLATES.filter(w => w.type === 'ewallet')
  const banks = WALLET_TEMPLATES.filter(w => w.type === 'bank')
  const cards = WALLET_TEMPLATES.filter(w => w.type === 'card')
  const cash = WALLET_TEMPLATES.filter(w => w.type === 'cash')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {step === 'select' ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Tambah Wallet</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {/* E-Wallets */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">E-WALLET</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ewallets.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <div className="font-semibold">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Banks */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">BANK</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {banks.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <div className="font-semibold text-sm">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cards */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">KARTU</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cards.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <div className="font-semibold">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">TUNAI</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cash.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <div className="font-semibold">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom */}
            <button
              onClick={handleCustomWallet}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="text-3xl mb-2">➕</div>
              <div className="font-semibold">Wallet Custom</div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-gray-400 hover:text-gray-600"
              >
                ← Kembali
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {selectedTemplate ? selectedTemplate.icon : '💰'}
              </div>
              <h2 className="text-2xl font-bold">
                {selectedTemplate ? selectedTemplate.name : 'Wallet Custom'}
              </h2>
            </div>

            {!selectedTemplate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Wallet
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Tabungan Liburan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saldo Awal (Opsional)
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Kosongkan jika saldo awal Rp 0
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || (!selectedTemplate && !customName)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Membuat...' : 'Buat Wallet'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

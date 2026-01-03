'use client'

import { useState } from 'react'
import { Icons } from './Icons'

interface LoginPageProps {
  onLogin: (telegramId: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [telegramId, setTelegramId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!telegramId.trim()) {
      setError('Masukkan Telegram ID Anda')
      return
    }
    
    setLoading(true)
    setError('')
    
    setTimeout(() => {
      localStorage.setItem('telegram_id', telegramId)
      localStorage.setItem('user_name', 'User')
      onLogin(telegramId)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent-blue/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-primary/30 mb-4">
            <Icons.dollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="text-primary">Catat</span>
            <span className="text-accent-orange">.in</span>
            <span className="text-text-primary"> Duit</span>
          </h1>
          <p className="text-text-secondary mt-2">AI-Powered Finance Manager</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Icons.user className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Selamat Datang!</h2>
          </div>
          <p className="text-text-secondary text-sm mb-6">
            Masuk dengan Telegram ID untuk melihat data keuangan Anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Telegram ID
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Icons.telegram className="w-5 h-5 text-accent-blue" />
                </div>
                <input
                  type="text"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="Contoh: 123456789"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              {error && (
                <p className="text-accent-red text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Icons.refresh className="w-4 h-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <Icons.logout className="w-4 h-4 rotate-180" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-text-secondary text-sm mb-4">
              Belum punya akun?
            </p>
            <a
              href="https://t.me/caborin_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3 bg-accent-blue/10 text-accent-blue font-medium rounded-xl hover:bg-accent-blue/20 transition-colors"
            >
              <Icons.telegram className="w-5 h-5" />
              Daftar via Telegram Bot
            </a>
          </div>
        </div>

        {/* How to get ID */}
        <div className="mt-6 p-4 bg-card rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Icons.messageCircle className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-text-primary">Cara mendapatkan Telegram ID:</h3>
          </div>
          <ol className="text-sm text-text-secondary space-y-1 ml-6">
            <li>1. Buka <a href="https://t.me/caborin_bot" target="_blank" className="text-primary hover:underline">@caborin_bot</a></li>
            <li>2. Kirim perintah <code className="bg-gray-100 px-2 py-0.5 rounded">/start</code></li>
            <li>3. Bot akan mengirimkan Telegram ID Anda</li>
          </ol>
        </div>

        {/* Footer */}
        <p className="text-center text-text-secondary text-xs mt-6">
          © 2025 Catat.in Duit. Kelola keuangan dengan AI.
        </p>
      </div>
    </div>
  )
}

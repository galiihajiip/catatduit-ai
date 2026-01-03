'use client'

import { useState } from 'react'

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
    
    // Simulate verification
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
            <span className="text-4xl">💵</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">CatatDuit</h1>
          <p className="text-text-secondary mt-2">AI-Powered Finance Manager</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Selamat Datang! 👋</h2>
          <p className="text-text-secondary text-sm mb-6">
            Masuk dengan Telegram ID untuk melihat data keuangan Anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Telegram ID
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">💬</span>
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
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Memverifikasi...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-text-secondary text-sm mb-4">
              Belum punya akun?
            </p>
            <a
              href="https://t.me/catatduitgalih_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3 bg-accent-blue/10 text-accent-blue font-medium rounded-xl hover:bg-accent-blue/20 transition-colors"
            >
              <span className="text-xl">🤖</span>
              Daftar via Telegram Bot
            </a>
          </div>
        </div>

        {/* How to get ID */}
        <div className="mt-6 p-4 bg-card rounded-xl">
          <h3 className="font-medium text-text-primary mb-2">💡 Cara mendapatkan Telegram ID:</h3>
          <ol className="text-sm text-text-secondary space-y-1">
            <li>1. Buka <a href="https://t.me/catatduitgalih_bot" target="_blank" className="text-primary hover:underline">@catatduitgalih_bot</a></li>
            <li>2. Kirim perintah <code className="bg-gray-100 px-2 py-0.5 rounded">/start</code></li>
            <li>3. Bot akan mengirimkan Telegram ID Anda</li>
          </ol>
        </div>

        {/* Footer */}
        <p className="text-center text-text-secondary text-xs mt-6">
          © 2025 CatatDuit. Kelola keuangan dengan AI.
        </p>
      </div>
    </div>
  )
}

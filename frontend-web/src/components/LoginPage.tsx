'use client'

import { useState } from 'react'
import { Icons } from './Icons'
import { DEMO_ACCOUNT, validateDemoLogin } from '@/lib/demo-auth'

interface LoginPageProps {
  onLogin: (userId: string, displayName: string) => void
}

const navItems = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Keunggulan', href: '#keunggulan' },
]

const features = [
  {
    title: 'Local Intelligent OCR',
    description: 'Scan struk instan tanpa API eksternal, sehingga UMKM bisa mencatat bukti transaksi tanpa biaya tambahan.',
    icon: Icons.camera,
  },
  {
    title: 'Automated Rule-Based Categorization',
    description: 'Transaksi otomatis masuk kategori yang mudah dipahami pemilik usaha, bahkan tanpa latar belakang akuntansi.',
    icon: Icons.pieChart,
  },
  {
    title: 'Real-time Financial Statement',
    description: 'Ringkasan pemasukan, pengeluaran, laba rugi, dan arus kas tersaji otomatis untuk pengambilan keputusan.',
    icon: Icons.chart,
  },
]

const statistics = [
  { value: '70%', label: 'Efisiensi Waktu Pembukuan' },
  { value: '0%', label: 'Biaya API Eksternal' },
  { value: '100%', label: 'Privasi Data Finansial Aman' },
]

const workflow = [
  'Foto struk atau tulis transaksi dengan bahasa sehari-hari.',
  'CatatinDuit membaca nominal, dompet, dan kategori secara otomatis.',
  'Dashboard memperbarui laporan keuangan real-time untuk evaluasi bisnis.',
]

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState<string>(DEMO_ACCOUNT.username)
  const [password, setPassword] = useState<string>(DEMO_ACCOUNT.password)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateDemoLogin(username, password)) {
      setError('ID atau password demo salah')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal masuk ke akun demo')
      }

      localStorage.setItem('demo_user_id', DEMO_ACCOUNT.userId)
      localStorage.setItem('demo_user_name', DEMO_ACCOUNT.displayName)
      onLogin(DEMO_ACCOUNT.userId, DEMO_ACCOUNT.displayName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk ke akun demo')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setUsername(DEMO_ACCOUNT.username)
    setPassword(DEMO_ACCOUNT.password)
    setError('')
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 -z-0 h-[560px] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.35),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.3),_transparent_32%)]" />

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3" aria-label="CatatinDuit beranda">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Icons.dollarSign className="h-5 w-5" />
            </span>
            <span className="text-lg font-black tracking-tight">CatatinDuit</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-semibold text-slate-300 transition hover:text-white">
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="#demo"
            className="hidden rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 md:inline-flex"
          >
            Coba Demo Aplikasi
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white md:hidden"
            aria-label="Buka menu navigasi"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <Icons.close className="h-5 w-5" /> : <Icons.menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-slate-950 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#demo"
                onClick={closeMobileMenu}
                className="rounded-xl bg-emerald-400 px-4 py-3 text-center text-sm font-black text-slate-950"
              >
                Coba Demo Aplikasi
              </a>
            </div>
          </div>
        )}
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100">
            <Icons.check className="h-4 w-4" />
            Responsive Web App & Installable PWA untuk UMKM
          </div>

          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Transformasi Pembukuan UMKM: Foto Struknya, Biar AI Lokal yang Catat Keuangannya.
            </h1>
            <p className="max-w-2xl text-base font-medium leading-8 text-slate-300 sm:text-lg">
              Solusi akuntansi cerdas tanpa biaya API, tanpa ribet input manual, dan 100% aman untuk privasi finansial bisnis Kamu.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-base font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300"
            >
              Buka Dashboard Demo
              <Icons.chevronRight className="h-5 w-5" />
            </a>
            <a
              href="#cara-kerja"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-black text-white transition hover:bg-white/10"
            >
              Baca Dokumentasi
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-emerald-950/40 backdrop-blur">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900 p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-300">Dashboard UMKM</p>
                <p className="text-xs font-medium text-slate-400">Laporan otomatis hari ini</p>
              </div>
              <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">Live</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-emerald-400 p-5 text-slate-950">
                <p className="text-sm font-bold opacity-80">Laba Bersih</p>
                <p className="mt-2 text-3xl font-black">Rp 4,8 jt</p>
                <p className="mt-4 text-xs font-bold">+18% dari bulan lalu</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold text-slate-300">Arus Kas</p>
                <p className="mt-2 text-3xl font-black text-white">Sehat</p>
                <p className="mt-4 text-xs font-bold text-blue-300">Cashflow positif</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-black text-white">Catat Cepat</p>
                <Icons.camera className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-300">
                beli bakso 15rb cash
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <span className="rounded-lg bg-emerald-400/10 px-2 py-2 text-emerald-300">Rp 15.000</span>
                <span className="rounded-lg bg-blue-400/10 px-2 py-2 text-blue-300">Makanan</span>
                <span className="rounded-lg bg-white/10 px-2 py-2 text-slate-300">Cash</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">Fitur Utama</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Dibangun untuk pembukuan UMKM yang cepat, hemat, dan mudah diaudit.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article key={feature.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/20">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-300">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="cara-kerja" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-300">Cara Kerja</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Dari bukti transaksi menjadi laporan yang siap dibaca juri akuntansi.
            </h2>
            <p className="mt-4 text-sm font-medium leading-7 text-slate-300">
              CatatinDuit membantu Kamu menjaga alur pencatatan tetap konsisten: transaksi masuk, kategori terbaca, laporan finansial langsung tersusun.
            </p>
          </div>

          <div className="grid gap-4">
            {workflow.map((item, index) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm font-semibold leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="keunggulan" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {statistics.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-xl">
              <p className="text-4xl font-black text-emerald-600 sm:text-5xl">{stat.value}</p>
              <p className="mt-3 text-sm font-black uppercase tracking-wide text-slate-700">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="space-y-5">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">Demo Siap Dicoba</p>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Masuk ke dashboard dan rasakan proses pembukuan yang lebih praktis.
          </h2>
          <p className="max-w-2xl text-sm font-medium leading-7 text-slate-300">
            Credential demo sudah disiapkan agar juri bisa langsung mencoba scan struk, catat transaksi harian, dan melihat laporan keuangan tanpa proses registrasi panjang.
          </p>

          <div className="grid gap-3 text-sm font-bold sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-emerald-100">
              ID: <span className="font-mono text-white">{DEMO_ACCOUNT.username}</span>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-emerald-100">
              Password: <span className="font-mono text-white">{DEMO_ACCOUNT.password}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-emerald-950/30 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-xl shadow-emerald-900/20">
              <Icons.dollarSign className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-black">Buka Dashboard Demo</h2>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Mulai catat gratis dengan credential demo CatatinDuit.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Demo ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder={DEMO_ACCOUNT.username}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder={DEMO_ACCOUNT.password}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 py-3 font-black text-white shadow-lg shadow-emerald-900/20 transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? <Icons.refresh className="h-4 w-4 animate-spin" /> : <Icons.logout className="h-4 w-4 rotate-180" />}
              Mulai Catat Gratis
            </button>

            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 font-bold text-slate-900 transition hover:bg-slate-100"
            >
              Isi Credential Demo
            </button>
          </form>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-semibold text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Tim CatatinDuit. Seluruh hak cipta dilindungi.</p>
          <p>UPN Veteran Jawa Timur · KOIN 2026</p>
        </div>
      </footer>
    </main>
  )
}

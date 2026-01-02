import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CatatDuit AI - Personal Finance Manager',
  description: 'AI-powered personal finance management. Cukup chat, keuangan langsung tercatat & dianalisis.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-background min-h-screen">
        {children}
      </body>
    </html>
  )
}

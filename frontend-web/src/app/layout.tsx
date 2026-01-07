import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { translations } from '@/translations'

export const metadata: Metadata = {
  title: 'CatatDuit AI - AI Finance Manager',
  description: 'AI-powered personal finance management. Track your finances with ease.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#F8FAFC" />
      </head>
      <body className="bg-background-primary min-h-screen">
        <ThemeProvider>
          <LanguageProvider translations={translations}>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { AppProvider } from '@/context/AppContext'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Trainee Control Panel in New Vision',
  description: 'Trainee Progress Management System',
  icons: {
    icon: [
      { url: '/img/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/img/logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/img/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/img/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <AppProvider>
                {children}
                <Toaster />
              </AppProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

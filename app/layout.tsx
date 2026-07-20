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

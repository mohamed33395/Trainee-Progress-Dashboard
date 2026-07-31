'use client'

import { useAuth } from '@/context/AuthContext'
import { Login } from '@/page-components/Login'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Dashboard } from '@/page-components/Dashboard'
import { useApp } from '@/context/AppContext'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const { trainees, reports, isLoading } = useApp()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-72">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Dashboard trainees={trainees} reports={reports} />
          )}
        </main>
        <Footer />
      </div>
    </div>
  )
}

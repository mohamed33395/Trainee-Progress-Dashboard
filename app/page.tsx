'use client'

import { useAuth } from '@/context/AuthContext'
import { Login } from '@/page-components/Login'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/page-components/Dashboard'
import { useApp } from '@/context/AppContext'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const { trainees, reports } = useApp()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-64">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Dashboard trainees={trainees} reports={reports} />
        </main>
      </div>
    </div>
  )
}

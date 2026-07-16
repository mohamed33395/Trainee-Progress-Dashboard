'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Tasks } from '@/page-components/Tasks'

export default function TasksPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-64">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Tasks />
        </main>
      </div>
    </div>
  )
}

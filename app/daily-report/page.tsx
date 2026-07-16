'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { DailyReportForm } from '@/page-components/DailyReport'
import { useApp } from '@/context/AppContext'

export default function DailyReportPage() {
  const { trainees, addReport } = useApp()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-64">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <DailyReportForm trainees={trainees} onSaveReport={addReport} />
        </main>
      </div>
    </div>
  )
}

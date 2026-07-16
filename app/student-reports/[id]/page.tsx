'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { StudentReports } from '@/pages/StudentReports'
import { useApp } from '@/context/AppContext'
import { useParams } from 'next/navigation'

export default function StudentReportDetailPage() {
  const { trainees, reports } = useApp()
  const params = useParams()
  const id = params?.id as string

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-64">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <StudentReports trainees={trainees} reports={reports} />
        </main>
      </div>
    </div>
  )
}

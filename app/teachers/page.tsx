'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Teachers } from '@/pages/Teachers'
import { useApp } from '@/context/AppContext'

export default function TeachersPage() {
  const { teachers, trainees, deleteTeacher, addTeacher, updateTeacher } = useApp()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-64">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Teachers 
            teachers={teachers} 
            trainees={trainees} 
            onTeacherDelete={deleteTeacher} 
            onTeacherAdd={addTeacher} 
            onTeacherUpdate={updateTeacher} 
          />
        </main>
      </div>
    </div>
  )
}

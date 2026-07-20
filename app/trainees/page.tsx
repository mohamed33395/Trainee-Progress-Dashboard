'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Trainees } from '@/page-components/Trainees'
import { useApp } from '@/context/AppContext'

export default function TraineesPage() {
  const { trainees, teachers, deleteTrainee, addTrainee, updateTrainee } = useApp()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-72">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Trainees 
            trainees={trainees} 
            teachers={teachers} 
            onTraineeDelete={deleteTrainee} 
            onTraineeAdd={addTrainee} 
            onTraineeUpdate={updateTrainee} 
          />
        </main>
        <Footer />
      </div>
    </div>
  )
}

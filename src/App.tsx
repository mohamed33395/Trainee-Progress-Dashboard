import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { Dashboard } from './pages/Dashboard'
import { Trainees } from './pages/Trainees'
import { DailyReportForm } from './pages/DailyReport'
import { StudentDetails } from './pages/StudentDetails'
import { StudentReports } from './pages/StudentReports'
import { Teachers } from './pages/Teachers'
import { Tasks } from './pages/Tasks'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { UserManagement } from './pages/UserManagement'
import { Login } from './pages/Login'
import { Toaster } from './components/ui/toaster'
import { useApp } from './context/AppContext'

function AppContent() {
  const { trainees, reports, teachers, tasks, deleteTrainee, addTrainee, updateTrainee, addReport, deleteTeacher, addTeacher, updateTeacher } = useApp()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-64">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard trainees={trainees} reports={reports} />} />
            <Route path="/trainees" element={<Trainees trainees={trainees} teachers={teachers} onTraineeDelete={deleteTrainee} onTraineeAdd={addTrainee} onTraineeUpdate={updateTrainee} />} />
            <Route path="/daily-report" element={<DailyReportForm trainees={trainees} onSaveReport={addReport} />} />
            <Route path="/student-details/:id" element={<StudentDetails trainees={trainees} reports={reports} />} />
            <Route path="/student-reports" element={<StudentReports trainees={trainees} reports={reports} />} />
            <Route path="/student-reports/:id" element={<StudentReports trainees={trainees} reports={reports} />} />
            <Route path="/teachers" element={<Teachers teachers={teachers} trainees={trainees} onTeacherDelete={deleteTeacher} onTeacherAdd={addTeacher} onTeacherUpdate={updateTeacher} />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/analytics" element={<Analytics trainees={trainees} reports={reports} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <AppProvider>
              <AppContent />
              <Toaster />
            </AppProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App

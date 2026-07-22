"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Trainee, DailyReport, Teacher, LanguageLevel, Task, User, Notification } from '../types'
import { storageService } from '../services/storage'
import { firestoreStorageService } from '../services/firestoreStorage'
import { initializeMockData } from '../data/mockData'
import { migrateToSeparateCollections, checkMigrationNeeded } from '../services/migrateToSeparateCollections'

interface AppContextType {
  trainees: Trainee[]
  reports: DailyReport[]
  teachers: Teacher[]
  tasks: Task[]
  users: User[]
  notifications: Notification[]
  addTrainee: (trainee: Trainee) => void
  updateTrainee: (id: string, updates: Partial<Trainee>) => void
  deleteTrainee: (id: string) => void
  addReport: (report: DailyReport) => void
  updateReport: (id: string, updates: Partial<DailyReport>) => void
  deleteReport: (id: string) => void
  addTeacher: (teacher: Teacher) => void
  updateTeacher: (id: string, updates: Partial<Teacher>) => void
  deleteTeacher: (id: string) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void
  deleteNotification: (id: string) => void
  refreshData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [reports, setReports] = useState<DailyReport[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [useFirestore, setUseFirestore] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Force Firebase only - no localStorage fallback
    setUseFirestore(true)

    const initializeData = async () => {
      try {
        // Initialize Firestore
        await firestoreStorageService.initializeData()
        
        // Disable automatic migration to prevent data deletion
        // const migrationNeeded = await checkMigrationNeeded()
        // if (migrationNeeded) {
        //   console.log('Migration needed - running migration script...')
        //   const migrationResult = await migrateToSeparateCollections()
        //   if (migrationResult.success) {
        //     console.log('Migration successful:', migrationResult.message)
        //   } else {
        //     console.error('Migration failed:', migrationResult.message)
        //   }
        // }
        
        // Always load existing data from Firebase - never overwrite
        const data = await firestoreStorageService.getAllData()
        setTrainees(data.trainees || [])
        setReports(data.reports || [])
        setTeachers(data.teachers || [])
        setTasks(data.tasks || [])
        setUsers(data.users || [])
        setNotifications(data.notifications || [])
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing data from Firebase:', error)
        // Show error instead of falling back to localStorage
        setIsInitialized(true)
      }
    }

    initializeData()
  }, [])

  const refreshData = async () => {
    try {
      if (useFirestore) {
        const data = await firestoreStorageService.getAllData()
        setTrainees(data.trainees || [])
        setReports(data.reports || [])
        setTeachers(data.teachers || [])
        setTasks(data.tasks || [])
        setUsers(data.users || [])
        setNotifications(data.notifications || [])
      } else {
        setTrainees(storageService.getTrainees())
        setReports(storageService.getReports())
        setTeachers(storageService.getTeachers())
        setTasks(storageService.getTasks() || [])
        setUsers(storageService.getUsers() || [])
        setNotifications(storageService.getNotifications() || [])
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const calculateLanguageLevel = (evaluationScores: number[]): LanguageLevel => {
    const average = evaluationScores.reduce((sum, score) => sum + score, 0) / evaluationScores.length
    
    if (average <= 20) return 'Beginner'
    if (average <= 40) return 'Elementary'
    if (average <= 60) return 'Intermediate'
    if (average <= 80) return 'Upper-Intermediate'
    if (average <= 90) return 'Advanced'
    return 'Proficient'
  }

  const updateTraineeLanguageLevel = async (traineeId: string) => {
    const currentReports = useFirestore ? await firestoreStorageService.getReports() : storageService.getReports()
    const traineeReports = currentReports.filter(r => r.traineeId === traineeId)
    
    if (traineeReports.length === 0) return
    
    // Get the most recent week's reports
    const latestWeek = Math.max(...traineeReports.map(r => r.week))
    const weekReports = traineeReports.filter(r => r.week === latestWeek)
    
    // Calculate average evaluation scores for the week
    const allEvaluationScores = weekReports.flatMap(report => [
      report.evaluation.understanding,
      report.evaluation.codingSkills,
      report.evaluation.problemSolving,
      report.evaluation.debugging,
      report.evaluation.communication,
      report.evaluation.codeQuality,
      report.evaluation.attendance,
    ])
    
    const newLanguageLevel = calculateLanguageLevel(allEvaluationScores)
    
    // Update trainee's language level
    if (useFirestore) {
      await firestoreStorageService.updateTrainee(traineeId, { languageLevel: newLanguageLevel })
    } else {
      storageService.updateTrainee(traineeId, { languageLevel: newLanguageLevel })
    }
  }

  const addTrainee = async (trainee: Trainee) => {
    if (useFirestore) {
      await firestoreStorageService.addTrainee(trainee)
    } else {
      storageService.addTrainee(trainee)
    }
    await refreshData()
  }

  const updateTrainee = async (id: string, updates: Partial<Trainee>) => {
    const currentTrainees = useFirestore ? await firestoreStorageService.getTrainees() : storageService.getTrainees()
    const currentTrainee = currentTrainees.find(t => t.id === id)
    
    if (currentTrainee && updates.assignedCoach !== undefined) {
      const currentTeachers = useFirestore ? await firestoreStorageService.getTeachers() : storageService.getTeachers()
      
      // Remove trainee from previous teacher's assignedTrainees
      if (currentTrainee.assignedCoach && currentTrainee.assignedCoach !== updates.assignedCoach) {
        const previousTeacher = currentTeachers.find(t => t.id === currentTrainee.assignedCoach)
        if (previousTeacher) {
          if (useFirestore) {
            await firestoreStorageService.updateTeacher(previousTeacher.id, {
              assignedTrainees: previousTeacher.assignedTrainees.filter(tId => tId !== id)
            })
          } else {
            storageService.updateTeacher(previousTeacher.id, {
              assignedTrainees: previousTeacher.assignedTrainees.filter(tId => tId !== id)
            })
          }
        }
      }
      
      // Add trainee to new teacher's assignedTrainees
      if (updates.assignedCoach && updates.assignedCoach !== currentTrainee.assignedCoach) {
        const newTeacher = currentTeachers.find(t => t.id === updates.assignedCoach)
        if (newTeacher) {
          if (useFirestore) {
            await firestoreStorageService.updateTeacher(newTeacher.id, {
              assignedTrainees: [...newTeacher.assignedTrainees, id]
            })
          } else {
            storageService.updateTeacher(newTeacher.id, {
              assignedTrainees: [...newTeacher.assignedTrainees, id]
            })
          }
        }
      }
    }
    
    if (useFirestore) {
      await firestoreStorageService.updateTrainee(id, updates)
    } else {
      storageService.updateTrainee(id, updates)
    }
    await refreshData()
  }

  const deleteTrainee = async (id: string) => {
    if (useFirestore) {
      await firestoreStorageService.deleteTrainee(id)
    } else {
      storageService.deleteTrainee(id)
    }
    await refreshData()
  }

  const addReport = async (report: DailyReport) => {
    if (useFirestore) {
      await firestoreStorageService.addReport(report)
    } else {
      storageService.addReport(report)
    }
    await updateTraineeLanguageLevel(report.traineeId)
    
    // Send notification to team leaders when a daily report is submitted
    const users = useFirestore ? await firestoreStorageService.getUsers() : storageService.getUsers()
    const teamLeaders = users.filter(u => u.role === 'team_leader' || u.role === 'admin')
    const trainee = useFirestore ? await firestoreStorageService.getTraineeById(report.traineeId) : storageService.getTraineeById(report.traineeId)
    
    for (const teamLeader of teamLeaders) {
      const notification: Notification = {
        id: Date.now().toString() + '-' + teamLeader.id,
        type: 'daily_report_submitted',
        recipientId: teamLeader.id,
        recipientRole: teamLeader.role,
        title: 'New Daily Report Submitted',
        message: `${trainee?.name || 'A trainee'} has submitted a daily report for Week ${report.week}, Day ${report.day}`,
        relatedId: report.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      }
      if (useFirestore) {
        await firestoreStorageService.addNotification(notification)
      } else {
        storageService.addNotification(notification)
      }
    }

    // Send weekly report notification when day 5 is submitted (end of week)
    if (report.day === 5) {
      // Send to trainee
      const traineeUser = users.find(u => u.traineeId === report.traineeId)
      if (traineeUser) {
        const weeklyNotification: Notification = {
          id: Date.now().toString() + '-weekly-' + traineeUser.id,
          type: 'weekly_report',
          recipientId: traineeUser.id,
          recipientRole: traineeUser.role,
          title: 'Weekly Report Available',
          message: `Your weekly report for Week ${report.week} is now available. Check your progress and skill shots.`,
          relatedId: report.traineeId,
          isRead: false,
          createdAt: new Date().toISOString(),
        }
        if (useFirestore) {
          await firestoreStorageService.addNotification(weeklyNotification)
        } else {
          storageService.addNotification(weeklyNotification)
        }
      }

      // Also send to team leaders
      for (const teamLeader of teamLeaders) {
        const weeklyNotification: Notification = {
          id: Date.now().toString() + '-weekly-' + teamLeader.id,
          type: 'weekly_report',
          recipientId: teamLeader.id,
          recipientRole: teamLeader.role,
          title: 'Weekly Report Completed',
          message: `${trainee?.name || 'A trainee'} has completed Week ${report.week}. Weekly report is now available.`,
          relatedId: report.traineeId,
          isRead: false,
          createdAt: new Date().toISOString(),
        }
        if (useFirestore) {
          await firestoreStorageService.addNotification(weeklyNotification)
        } else {
          storageService.addNotification(weeklyNotification)
        }
      }
    }
    
    await refreshData()
  }

  const updateReport = async (id: string, updates: Partial<DailyReport>) => {
    if (useFirestore) {
      await firestoreStorageService.updateReport(id, updates)
    } else {
      storageService.updateReport(id, updates)
    }
    await refreshData()
  }

  const deleteReport = async (id: string) => {
    if (useFirestore) {
      await firestoreStorageService.deleteReport(id)
    } else {
      storageService.deleteReport(id)
    }
    await refreshData()
  }

  const addTeacher = async (teacher: Teacher) => {
    if (useFirestore) {
      await firestoreStorageService.addTeacher(teacher)
    } else {
      storageService.addTeacher(teacher)
    }
    // Update trainees to reflect teacher assignment
    const currentTrainees = useFirestore ? await firestoreStorageService.getTrainees() : storageService.getTrainees()
    for (const traineeId of teacher.assignedTrainees) {
      const trainee = currentTrainees.find(t => t.id === traineeId)
      if (trainee) {
        if (useFirestore) {
          await firestoreStorageService.updateTrainee(traineeId, { assignedCoach: teacher.id })
        } else {
          storageService.updateTrainee(traineeId, { assignedCoach: teacher.id })
        }
      }
    }
    await refreshData()
  }

  const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
    const currentTeachers = useFirestore ? await firestoreStorageService.getTeachers() : storageService.getTeachers()
    const currentTeacher = currentTeachers.find(t => t.id === id)
    
    if (currentTeacher && updates.assignedTrainees) {
      const currentTrainees = useFirestore ? await firestoreStorageService.getTrainees() : storageService.getTrainees()
      
      // Remove teacher assignment from trainees that are no longer assigned
      for (const traineeId of currentTeacher.assignedTrainees) {
        if (!updates.assignedTrainees?.includes(traineeId)) {
          const trainee = currentTrainees.find(t => t.id === traineeId)
          if (trainee && trainee.assignedCoach === id) {
            if (useFirestore) {
              await firestoreStorageService.updateTrainee(traineeId, { assignedCoach: undefined })
            } else {
              storageService.updateTrainee(traineeId, { assignedCoach: undefined })
            }
          }
        }
      }
      
      // Add teacher assignment to newly assigned trainees
      for (const traineeId of updates.assignedTrainees) {
        if (!currentTeacher.assignedTrainees.includes(traineeId)) {
          const trainee = currentTrainees.find(t => t.id === traineeId)
          if (trainee) {
            if (useFirestore) {
              await firestoreStorageService.updateTrainee(traineeId, { assignedCoach: id })
            } else {
              storageService.updateTrainee(traineeId, { assignedCoach: id })
            }
          }
        }
      }
    }
    
    if (useFirestore) {
      await firestoreStorageService.updateTeacher(id, updates)
    } else {
      storageService.updateTeacher(id, updates)
    }
    await refreshData()
  }

  const deleteTeacher = async (id: string) => {
    if (useFirestore) {
      await firestoreStorageService.deleteTeacher(id)
    } else {
      storageService.deleteTeacher(id)
    }
    await refreshData()
  }

  const addTask = async (task: Task) => {
    if (useFirestore) {
      await firestoreStorageService.addTask(task)
    } else {
      storageService.addTask(task)
    }
    await refreshData()
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (useFirestore) {
      await firestoreStorageService.updateTask(id, updates)
    } else {
      storageService.updateTask(id, updates)
    }
    await refreshData()
  }

  const deleteTask = async (id: string) => {
    if (useFirestore) {
      await firestoreStorageService.deleteTask(id)
    } else {
      storageService.deleteTask(id)
    }
    await refreshData()
  }

  const addUser = async (user: User) => {
    if (useFirestore) {
      await firestoreStorageService.addUser(user)
    } else {
      storageService.addUser(user)
    }
    await refreshData()
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (useFirestore) {
      await firestoreStorageService.updateUser(id, updates)
    } else {
      storageService.updateUser(id, updates)
    }
    await refreshData()
  }

  const deleteUser = async (id: string) => {
    if (useFirestore) {
      await firestoreStorageService.deleteUser(id)
    } else {
      storageService.deleteUser(id)
    }
    await refreshData()
  }

  const addNotification = async (notification: Notification) => {
    if (useFirestore) {
      await firestoreStorageService.addNotification(notification)
    } else {
      storageService.addNotification(notification)
    }
    await refreshData()
  }

  const markNotificationAsRead = async (id: string) => {
    if (useFirestore) {
      await firestoreStorageService.updateNotification(id, { isRead: true })
    } else {
      storageService.markNotificationAsRead(id)
    }
    await refreshData()
  }

  const deleteNotification = async (id: string) => {
    if (useFirestore) {
      await firestoreStorageService.deleteNotification(id)
    } else {
      storageService.deleteNotification(id)
    }
    await refreshData()
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{
        trainees,
        reports,
        teachers,
        tasks,
        users,
        notifications,
        addTrainee,
        updateTrainee,
        deleteTrainee,
        addReport,
        updateReport,
        deleteReport,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addTask,
        updateTask,
        deleteTask,
        addUser,
        updateUser,
        deleteUser,
        addNotification,
        markNotificationAsRead,
        deleteNotification,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  setDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Trainee, DailyReport, Teacher, Task, User, Notification } from '@/types'

// Convert Firestore Timestamp to ISO string
const timestampToISO = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString()
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString()
  }
  return new Date().toISOString()
}

// Convert ISO string to Firestore Timestamp
const isoToTimestamp = (isoString: string): Timestamp => {
  return Timestamp.fromDate(new Date(isoString))
}

class FirestoreStorageService {
  private collectionName = 'trainee_progress_data'

  // Get document reference
  private getDocRef(docId: string) {
    return doc(db, this.collectionName, docId)
  }

  // Get collection reference
  private getCollectionRef() {
    return collection(db, this.collectionName)
  }

  // Initialize data structure
  async initializeData(): Promise<void> {
    const docRef = this.getDocRef('main_data')
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        trainees: [],
        reports: [],
        teachers: [],
        tasks: [],
        users: [],
        notifications: [],
        settings: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    }
  }

  // Get all data
  async getAllData(): Promise<any> {
    try {
      const docRef = this.getDocRef('main_data')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          trainees: data.trainees || [],
          reports: data.reports || [],
          teachers: data.teachers || [],
          tasks: data.tasks || [],
          users: data.users || [],
          notifications: data.notifications || [],
          settings: data.settings || {}
        }
      }
      
      return {
        trainees: [],
        reports: [],
        teachers: [],
        tasks: [],
        users: [],
        notifications: [],
        settings: {}
      }
    } catch (error) {
      console.error('Error getting all data:', error)
      return {
        trainees: [],
        reports: [],
        teachers: [],
        tasks: [],
        users: [],
        notifications: [],
        settings: {}
      }
    }
  }

  // Update all data
  async updateAllData(data: any): Promise<void> {
    try {
      const docRef = this.getDocRef('main_data')
      await setDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating all data:', error)
      throw error
    }
  }

  // Trainee operations
  async getTrainees(): Promise<Trainee[]> {
    const data = await this.getAllData()
    return data.trainees || []
  }

  async setTrainees(trainees: Trainee[]): Promise<void> {
    const data = await this.getAllData()
    await this.updateAllData({ ...data, trainees })
  }

  async getTraineeById(id: string): Promise<Trainee | null> {
    const trainees = await this.getTrainees()
    return trainees.find(t => t.id === id) || null
  }

  async addTrainee(trainee: Trainee): Promise<void> {
    const trainees = await this.getTrainees()
    trainees.push(trainee)
    await this.setTrainees(trainees)
  }

  async updateTrainee(id: string, updates: Partial<Trainee>): Promise<void> {
    const trainees = await this.getTrainees()
    const index = trainees.findIndex(t => t.id === id)
    if (index !== -1) {
      trainees[index] = { ...trainees[index], ...updates }
      await this.setTrainees(trainees)
    }
  }

  async deleteTrainee(id: string): Promise<void> {
    const trainees = await this.getTrainees()
    const filtered = trainees.filter(t => t.id !== id)
    await this.setTrainees(filtered)
  }

  // Report operations
  async getReports(): Promise<DailyReport[]> {
    const data = await this.getAllData()
    return data.reports || []
  }

  async setReports(reports: DailyReport[]): Promise<void> {
    const data = await this.getAllData()
    await this.updateAllData({ ...data, reports })
  }

  async getReportById(id: string): Promise<DailyReport | null> {
    const reports = await this.getReports()
    return reports.find(r => r.id === id) || null
  }

  async addReport(report: DailyReport): Promise<void> {
    const reports = await this.getReports()
    reports.push(report)
    await this.setReports(reports)
  }

  async updateReport(id: string, updates: Partial<DailyReport>): Promise<void> {
    const reports = await this.getReports()
    const index = reports.findIndex(r => r.id === id)
    if (index !== -1) {
      reports[index] = { ...reports[index], ...updates }
      await this.setReports(reports)
    }
  }

  async deleteReport(id: string): Promise<void> {
    const reports = await this.getReports()
    const filtered = reports.filter(r => r.id !== id)
    await this.setReports(filtered)
  }

  // Teacher operations
  async getTeachers(): Promise<Teacher[]> {
    const data = await this.getAllData()
    return data.teachers || []
  }

  async setTeachers(teachers: Teacher[]): Promise<void> {
    const data = await this.getAllData()
    await this.updateAllData({ ...data, teachers })
  }

  async getTeacherById(id: string): Promise<Teacher | null> {
    const teachers = await this.getTeachers()
    return teachers.find(t => t.id === id) || null
  }

  async addTeacher(teacher: Teacher): Promise<void> {
    const teachers = await this.getTeachers()
    teachers.push(teacher)
    await this.setTeachers(teachers)
  }

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<void> {
    const teachers = await this.getTeachers()
    const index = teachers.findIndex(t => t.id === id)
    if (index !== -1) {
      teachers[index] = { ...teachers[index], ...updates }
      await this.setTeachers(teachers)
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    const teachers = await this.getTeachers()
    const filtered = teachers.filter(t => t.id !== id)
    await this.setTeachers(filtered)
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    const data = await this.getAllData()
    return data.tasks || []
  }

  async setTasks(tasks: Task[]): Promise<void> {
    const data = await this.getAllData()
    await this.updateAllData({ ...data, tasks })
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.getTasks()
    return tasks.find(t => t.id === id) || null
  }

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks()
    tasks.push(task)
    await this.setTasks(tasks)
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks()
    const index = tasks.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates }
      await this.setTasks(tasks)
    }
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks()
    const filtered = tasks.filter(t => t.id !== id)
    await this.setTasks(filtered)
  }

  // User operations
  async getUsers(): Promise<User[]> {
    const data = await this.getAllData()
    return data.users || []
  }

  async setUsers(users: User[]): Promise<void> {
    const data = await this.getAllData()
    await this.updateAllData({ ...data, users })
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find(u => u.id === id) || null
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find(u => u.username === username) || null
  }

  async addUser(user: User): Promise<void> {
    const users = await this.getUsers()
    users.push(user)
    await this.setUsers(users)
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const users = await this.getUsers()
    const index = users.findIndex(u => u.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      await this.setUsers(users)
    }
  }

  async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers()
    const filtered = users.filter(u => u.id !== id)
    await this.setUsers(filtered)
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    const data = await this.getAllData()
    return data.notifications || []
  }

  async setNotifications(notifications: Notification[]): Promise<void> {
    const data = await this.getAllData()
    await this.updateAllData({ ...data, notifications })
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    const notifications = await this.getNotifications()
    return notifications.find(n => n.id === id) || null
  }

  async addNotification(notification: Notification): Promise<void> {
    const notifications = await this.getNotifications()
    notifications.push(notification)
    await this.setNotifications(notifications)
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<void> {
    const notifications = await this.getNotifications()
    const index = notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications[index] = { ...notifications[index], ...updates }
      await this.setNotifications(notifications)
    }
  }

  async deleteNotification(id: string): Promise<void> {
    const notifications = await this.getNotifications()
    const filtered = notifications.filter(n => n.id !== id)
    await this.setNotifications(filtered)
  }

  // Settings operations
  async getSettings(): Promise<Record<string, any>> {
    const data = await this.getAllData()
    return data.settings || {}
  }

  async setSettings(settings: Record<string, any>): Promise<void> {
    const data = await this.getAllData()
    await this.updateAllData({ ...data, settings })
  }

  // Check if data exists
  async isEmpty(): Promise<boolean> {
    const data = await this.getAllData()
    return !data.trainees?.length && !data.reports?.length && !data.teachers?.length
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await this.updateAllData({
      trainees: [],
      reports: [],
      teachers: [],
      tasks: [],
      users: [],
      notifications: [],
      settings: {}
    })
  }

  // Backup operations
  async createBackup(): Promise<void> {
    const data = await this.getAllData()
    const backupRef = doc(db, this.collectionName, 'backup')
    await setDoc(backupRef, {
      ...data,
      timestamp: Timestamp.now()
    })
  }

  async restoreFromBackup(): Promise<boolean> {
    try {
      const backupRef = doc(db, this.collectionName, 'backup')
      const backupSnap = await getDoc(backupRef)
      
      if (backupSnap.exists()) {
        const backupData = backupSnap.data()
        await this.updateAllData(backupData)
        return true
      }
      return false
    } catch (error) {
      console.error('Error restoring from backup:', error)
      return false
    }
  }
}

export const firestoreStorageService = new FirestoreStorageService()

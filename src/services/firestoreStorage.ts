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
  // Collection names for each data type
  private collections = {
    trainees: 'trainees',
    reports: 'reports',
    teachers: 'teachers',
    tasks: 'tasks',
    users: 'users',
    notifications: 'notifications',
    settings: 'settings'
  }

  // Get collection reference
  private getCollectionRef(collectionName: string) {
    return collection(db, collectionName)
  }

  // Get document reference
  private getDocRef(collectionName: string, docId: string) {
    return doc(db, collectionName, docId)
  }

  // Initialize data structure (no longer needed with separate collections)
  async initializeData(): Promise<void> {
    // Collections are created automatically when first document is added
    console.log('Firestore collections initialized automatically')
  }

  // Get all data (for backward compatibility)
  async getAllData(): Promise<any> {
    try {
      const [trainees, reports, teachers, tasks, users, notifications, settings] = await Promise.all([
        this.getTrainees(),
        this.getReports(),
        this.getTeachers(),
        this.getTasks(),
        this.getUsers(),
        this.getNotifications(),
        this.getSettings()
      ])

      return {
        trainees,
        reports,
        teachers,
        tasks,
        users,
        notifications,
        settings
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

  // Update all data (for backward compatibility - not recommended for large datasets)
  async updateAllData(data: any): Promise<void> {
    try {
      await Promise.all([
        this.setTrainees(data.trainees || []),
        this.setReports(data.reports || []),
        this.setTeachers(data.teachers || []),
        this.setTasks(data.tasks || []),
        this.setUsers(data.users || []),
        this.setNotifications(data.notifications || []),
        this.setSettings(data.settings || {})
      ])
    } catch (error) {
      console.error('Error updating all data:', error)
      throw error
    }
  }

  // Trainee operations
  async getTrainees(): Promise<Trainee[]> {
    try {
      const querySnapshot = await getDocs(this.getCollectionRef(this.collections.trainees))
      return querySnapshot.docs.map(doc => doc.data() as Trainee)
    } catch (error) {
      console.error('Error getting trainees:', error)
      return []
    }
  }

  async setTrainees(trainees: Trainee[]): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef(this.collections.trainees)
      // Delete all existing documents
      const existingDocs = await getDocs(collectionRef)
      await Promise.all(existingDocs.docs.map(doc => deleteDoc(doc.ref)))
      
      // Add all trainees as individual documents
      await Promise.all(trainees.map(trainee => 
        setDoc(this.getDocRef(this.collections.trainees, trainee.id), trainee)
      ))
    } catch (error) {
      console.error('Error setting trainees:', error)
      throw error
    }
  }

  async getTraineeById(id: string): Promise<Trainee | null> {
    try {
      const docRef = this.getDocRef(this.collections.trainees, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as Trainee) : null
    } catch (error) {
      console.error('Error getting trainee by id:', error)
      return null
    }
  }

  async addTrainee(trainee: Trainee): Promise<void> {
    try {
      await setDoc(this.getDocRef(this.collections.trainees, trainee.id), trainee)
    } catch (error) {
      console.error('Error adding trainee:', error)
      throw error
    }
  }

  async updateTrainee(id: string, updates: Partial<Trainee>): Promise<void> {
    try {
      const docRef = this.getDocRef(this.collections.trainees, id)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('Error updating trainee:', error)
      throw error
    }
  }

  async deleteTrainee(id: string): Promise<void> {
    try {
      await deleteDoc(this.getDocRef(this.collections.trainees, id))
    } catch (error) {
      console.error('Error deleting trainee:', error)
      throw error
    }
  }

  // Report operations
  async getReports(): Promise<DailyReport[]> {
    try {
      const querySnapshot = await getDocs(this.getCollectionRef(this.collections.reports))
      return querySnapshot.docs.map(doc => doc.data() as DailyReport)
    } catch (error) {
      console.error('Error getting reports:', error)
      return []
    }
  }

  async setReports(reports: DailyReport[]): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef(this.collections.reports)
      const existingDocs = await getDocs(collectionRef)
      await Promise.all(existingDocs.docs.map(doc => deleteDoc(doc.ref)))
      
      await Promise.all(reports.map(report => 
        setDoc(this.getDocRef(this.collections.reports, report.id), report)
      ))
    } catch (error) {
      console.error('Error setting reports:', error)
      throw error
    }
  }

  async getReportById(id: string): Promise<DailyReport | null> {
    try {
      const docRef = this.getDocRef(this.collections.reports, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as DailyReport) : null
    } catch (error) {
      console.error('Error getting report by id:', error)
      return null
    }
  }

  async addReport(report: DailyReport): Promise<void> {
    try {
      await setDoc(this.getDocRef(this.collections.reports, report.id), report)
    } catch (error) {
      console.error('Error adding report:', error)
      throw error
    }
  }

  async updateReport(id: string, updates: Partial<DailyReport>): Promise<void> {
    try {
      const docRef = this.getDocRef(this.collections.reports, id)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('Error updating report:', error)
      throw error
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      await deleteDoc(this.getDocRef(this.collections.reports, id))
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  }

  // Teacher operations
  async getTeachers(): Promise<Teacher[]> {
    try {
      const querySnapshot = await getDocs(this.getCollectionRef(this.collections.teachers))
      return querySnapshot.docs.map(doc => doc.data() as Teacher)
    } catch (error) {
      console.error('Error getting teachers:', error)
      return []
    }
  }

  async setTeachers(teachers: Teacher[]): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef(this.collections.teachers)
      const existingDocs = await getDocs(collectionRef)
      await Promise.all(existingDocs.docs.map(doc => deleteDoc(doc.ref)))
      
      await Promise.all(teachers.map(teacher => 
        setDoc(this.getDocRef(this.collections.teachers, teacher.id), teacher)
      ))
    } catch (error) {
      console.error('Error setting teachers:', error)
      throw error
    }
  }

  async getTeacherById(id: string): Promise<Teacher | null> {
    try {
      const docRef = this.getDocRef(this.collections.teachers, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as Teacher) : null
    } catch (error) {
      console.error('Error getting teacher by id:', error)
      return null
    }
  }

  async addTeacher(teacher: Teacher): Promise<void> {
    try {
      await setDoc(this.getDocRef(this.collections.teachers, teacher.id), teacher)
    } catch (error) {
      console.error('Error adding teacher:', error)
      throw error
    }
  }

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<void> {
    try {
      const docRef = this.getDocRef(this.collections.teachers, id)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('Error updating teacher:', error)
      throw error
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    try {
      await deleteDoc(this.getDocRef(this.collections.teachers, id))
    } catch (error) {
      console.error('Error deleting teacher:', error)
      throw error
    }
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    try {
      const querySnapshot = await getDocs(this.getCollectionRef(this.collections.tasks))
      return querySnapshot.docs.map(doc => doc.data() as Task)
    } catch (error) {
      console.error('Error getting tasks:', error)
      return []
    }
  }

  async setTasks(tasks: Task[]): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef(this.collections.tasks)
      const existingDocs = await getDocs(collectionRef)
      await Promise.all(existingDocs.docs.map(doc => deleteDoc(doc.ref)))
      
      await Promise.all(tasks.map(task => 
        setDoc(this.getDocRef(this.collections.tasks, task.id), task)
      ))
    } catch (error) {
      console.error('Error setting tasks:', error)
      throw error
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      const docRef = this.getDocRef(this.collections.tasks, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as Task) : null
    } catch (error) {
      console.error('Error getting task by id:', error)
      return null
    }
  }

  async addTask(task: Task): Promise<void> {
    try {
      await setDoc(this.getDocRef(this.collections.tasks, task.id), task)
    } catch (error) {
      console.error('Error adding task:', error)
      throw error
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    try {
      const docRef = this.getDocRef(this.collections.tasks, id)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await deleteDoc(this.getDocRef(this.collections.tasks, id))
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  // User operations
  async getUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(this.getCollectionRef(this.collections.users))
      return querySnapshot.docs.map(doc => doc.data() as User)
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  }

  async setUsers(users: User[]): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef(this.collections.users)
      const existingDocs = await getDocs(collectionRef)
      await Promise.all(existingDocs.docs.map(doc => deleteDoc(doc.ref)))
      
      await Promise.all(users.map(user => 
        setDoc(this.getDocRef(this.collections.users, user.id), user)
      ))
    } catch (error) {
      console.error('Error setting users:', error)
      throw error
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = this.getDocRef(this.collections.users, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as User) : null
    } catch (error) {
      console.error('Error getting user by id:', error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find(u => u.username === username) || null
    } catch (error) {
      console.error('Error getting user by username:', error)
      return null
    }
  }

  async addUser(user: User): Promise<void> {
    try {
      await setDoc(this.getDocRef(this.collections.users, user.id), user)
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = this.getDocRef(this.collections.users, id)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await deleteDoc(this.getDocRef(this.collections.users, id))
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    try {
      const querySnapshot = await getDocs(this.getCollectionRef(this.collections.notifications))
      return querySnapshot.docs.map(doc => doc.data() as Notification)
    } catch (error) {
      console.error('Error getting notifications:', error)
      return []
    }
  }

  async setNotifications(notifications: Notification[]): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef(this.collections.notifications)
      const existingDocs = await getDocs(collectionRef)
      await Promise.all(existingDocs.docs.map(doc => deleteDoc(doc.ref)))
      
      await Promise.all(notifications.map(notification => 
        setDoc(this.getDocRef(this.collections.notifications, notification.id), notification)
      ))
    } catch (error) {
      console.error('Error setting notifications:', error)
      throw error
    }
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    try {
      const docRef = this.getDocRef(this.collections.notifications, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as Notification) : null
    } catch (error) {
      console.error('Error getting notification by id:', error)
      return null
    }
  }

  async addNotification(notification: Notification): Promise<void> {
    try {
      await setDoc(this.getDocRef(this.collections.notifications, notification.id), notification)
    } catch (error) {
      console.error('Error adding notification:', error)
      throw error
    }
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<void> {
    try {
      const docRef = this.getDocRef(this.collections.notifications, id)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('Error updating notification:', error)
      throw error
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      await deleteDoc(this.getDocRef(this.collections.notifications, id))
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  // Settings operations
  async getSettings(): Promise<Record<string, any>> {
    try {
      const docRef = this.getDocRef(this.collections.settings, 'main_settings')
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as Record<string, any>) : {}
    } catch (error) {
      console.error('Error getting settings:', error)
      return {}
    }
  }

  async setSettings(settings: Record<string, any>): Promise<void> {
    try {
      await setDoc(this.getDocRef(this.collections.settings, 'main_settings'), settings)
    } catch (error) {
      console.error('Error setting settings:', error)
      throw error
    }
  }

  // Check if data exists
  async isEmpty(): Promise<boolean> {
    const [trainees, reports, teachers] = await Promise.all([
      this.getTrainees(),
      this.getReports(),
      this.getTeachers()
    ])
    return !trainees?.length && !reports?.length && !teachers?.length
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await Promise.all([
      this.setTrainees([]),
      this.setReports([]),
      this.setTeachers([]),
      this.setTasks([]),
      this.setUsers([]),
      this.setNotifications([]),
      this.setSettings({})
    ])
  }

  // Backup operations
  async createBackup(): Promise<void> {
    const data = await this.getAllData()
    const backupRef = doc(db, this.collections.settings, 'backup')
    await setDoc(backupRef, {
      ...data,
      timestamp: Timestamp.now()
    })
  }

  async restoreFromBackup(): Promise<boolean> {
    try {
      const backupRef = doc(db, this.collections.settings, 'backup')
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

  // Export all data to JSON string
  async exportData(): Promise<string> {
    try {
      const data = await this.getAllData()
      const exportData = {
        trainees: data.trainees,
        reports: data.reports,
        teachers: data.teachers,
        tasks: data.tasks,
        users: data.users,
        notifications: data.notifications,
        settings: data.settings,
        exportDate: new Date().toISOString(),
        version: '2.0'
      }
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Error exporting data:', error)
      throw error
    }
  }

  // Import data from JSON string
  async importData(jsonString: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonString)

      // Validate data structure
      if (!importData.version) {
        throw new Error('Invalid data format: missing version')
      }

      // Import all data at once
      await this.updateAllData({
        trainees: importData.trainees || [],
        reports: importData.reports || [],
        teachers: importData.teachers || [],
        tasks: importData.tasks || [],
        users: importData.users || [],
        notifications: importData.notifications || [],
        settings: importData.settings || {}
      })

      console.log('Data imported successfully from:', importData.exportDate)
    } catch (error) {
      console.error('Error importing data:', error)
      throw error
    }
  }

  // Admin profile image operations
  async saveAdminProfileImage(userId: string, imageData: string): Promise<void> {
    try {
      const settings = await this.getSettings()
      if (!settings.adminProfileImages) {
        settings.adminProfileImages = {}
      }
      settings.adminProfileImages[userId] = imageData
      await this.setSettings(settings)
    } catch (error) {
      console.error('Error saving admin profile image:', error)
      throw error
    }
  }

  async getAdminProfileImage(userId: string): Promise<string | null> {
    try {
      const settings = await this.getSettings()
      if (settings?.adminProfileImages?.[userId]) {
        return settings.adminProfileImages[userId]
      }
      return null
    } catch (error) {
      console.error('Error getting admin profile image:', error)
      return null
    }
  }
}

export const firestoreStorageService = new FirestoreStorageService()

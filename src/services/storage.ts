import { Trainee, DailyReport, Teacher, Task, User, Notification } from '../types'

const STORAGE_KEYS = {
  TRAINEES: 'trainee_progress_trainees',
  REPORTS: 'trainee_progress_reports',
  TEACHERS: 'trainee_progress_teachers',
  TASKS: 'trainee_progress_tasks',
  SETTINGS: 'trainee_progress_settings',
  USERS: 'trainee_progress_users',
  NOTIFICATIONS: 'trainee_progress_notifications',
  BACKUP: 'trainee_progress_backup',
  LAST_BACKUP: 'trainee_progress_last_backup',
} as const

class StorageService {
  // Generic get method
  private get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return null
    }
  }

  // Generic set method
  private set<T>(key: string, value: T): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  }

  // Generic delete method
  private delete(key: string): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error deleting from localStorage key "${key}":`, error)
    }
  }

  // Create backup of all data
  createBackup(): void {
    try {
      const backupData = {
        trainees: this.getTrainees(),
        reports: this.getReports(),
        teachers: this.getTeachers(),
        tasks: this.getTasks(),
        users: this.getUsers(),
        notifications: this.getNotifications(),
        settings: this.getSettings(),
        timestamp: new Date().toISOString(),
      }
      this.set(STORAGE_KEYS.BACKUP, backupData)
      this.set(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString())
      console.log('Backup created successfully at:', new Date().toISOString())
    } catch (error) {
      console.error('Error creating backup:', error)
    }
  }

  // Restore from backup
  restoreFromBackup(): boolean {
    try {
      const backup = this.get(STORAGE_KEYS.BACKUP)
      if (!backup) {
        console.log('No backup found')
        return false
      }

      const backupData = backup as any
      if (backupData.trainees) this.setTrainees(backupData.trainees)
      if (backupData.reports) this.setReports(backupData.reports)
      if (backupData.teachers) this.setTeachers(backupData.teachers)
      if (backupData.tasks) this.setTasks(backupData.tasks)
      if (backupData.users) this.setUsers(backupData.users)
      if (backupData.notifications) this.setNotifications(backupData.notifications)
      if (backupData.settings) this.setSettings(backupData.settings)

      console.log('Backup restored successfully from:', backupData.timestamp)
      return true
    } catch (error) {
      console.error('Error restoring from backup:', error)
      return false
    }
  }

  // Get last backup time
  getLastBackupTime(): string | null {
    return this.get<string>(STORAGE_KEYS.LAST_BACKUP)
  }

  // Auto backup before critical operations
  private autoBackup(): void {
    const lastBackup = this.getLastBackupTime()
    const now = new Date()
    const shouldBackup = !lastBackup || 
      (now.getTime() - new Date(lastBackup).getTime() > 5 * 60 * 1000) // 5 minutes

    if (shouldBackup) {
      this.createBackup()
    }
  }

  // Trainee operations
  getTrainees(): Trainee[] {
    return this.get<Trainee[]>(STORAGE_KEYS.TRAINEES) || []
  }

  setTrainees(trainees: Trainee[]): void {
    this.set(STORAGE_KEYS.TRAINEES, trainees)
  }

  getTraineeById(id: string): Trainee | null {
    const trainees = this.getTrainees()
    return trainees.find(t => t.id === id) || null
  }

  addTrainee(trainee: Trainee): void {
    const trainees = this.getTrainees()
    trainees.push(trainee)
    this.setTrainees(trainees)
  }

  updateTrainee(id: string, updates: Partial<Trainee>): void {
    const trainees = this.getTrainees()
    const index = trainees.findIndex(t => t.id === id)
    if (index !== -1) {
      trainees[index] = { ...trainees[index], ...updates }
      this.setTrainees(trainees)
    }
  }

  deleteTrainee(id: string): void {
    this.autoBackup()
    const trainees = this.getTrainees().filter(t => t.id !== id)
    this.setTrainees(trainees)
  }

  // Report operations
  getReports(): DailyReport[] {
    return this.get<DailyReport[]>(STORAGE_KEYS.REPORTS) || []
  }

  setReports(reports: DailyReport[]): void {
    this.set(STORAGE_KEYS.REPORTS, reports)
  }

  getReportById(id: string): DailyReport | null {
    const reports = this.getReports()
    return reports.find(r => r.id === id) || null
  }

  getReportsByTraineeId(traineeId: string): DailyReport[] {
    const reports = this.getReports()
    return reports.filter(r => r.traineeId === traineeId)
  }

  addReport(report: DailyReport): void {
    const reports = this.getReports()
    reports.push(report)
    this.setReports(reports)
  }

  updateReport(id: string, updates: Partial<DailyReport>): void {
    const reports = this.getReports()
    const index = reports.findIndex(r => r.id === id)
    if (index !== -1) {
      reports[index] = { ...reports[index], ...updates }
      this.setReports(reports)
    }
  }

  deleteReport(id: string): void {
    this.autoBackup()
    const reports = this.getReports().filter(r => r.id !== id)
    this.setReports(reports)
  }

  // Settings operations
  getSettings(): Record<string, any> {
    return this.get<Record<string, any>>(STORAGE_KEYS.SETTINGS) || {}
  }

  setSettings(settings: Record<string, any>): void {
    this.set(STORAGE_KEYS.SETTINGS, settings)
  }

  // Clear all data (useful for testing)
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => this.delete(key))
  }

  // Check if storage is empty
  isEmpty(): boolean {
    return !this.get(STORAGE_KEYS.TRAINEES) && !this.get(STORAGE_KEYS.REPORTS) && !this.get(STORAGE_KEYS.TEACHERS)
  }

  // User operations
  getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS) || []
  }

  setUsers(users: User[]): void {
    this.set(STORAGE_KEYS.USERS, users)
  }

  getUserById(id: string): User | null {
    const users = this.getUsers()
    return users.find(u => u.id === id) || null
  }

  getUserByUsername(username: string): User | null {
    const users = this.getUsers()
    return users.find(u => u.username === username) || null
  }

  addUser(user: User): void {
    const users = this.getUsers()
    users.push(user)
    this.setUsers(users)
  }

  updateUser(id: string, updates: Partial<User>): void {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      this.setUsers(users)
    }
  }

  deleteUser(id: string): void {
    this.autoBackup()
    const users = this.getUsers().filter(u => u.id !== id)
    this.setUsers(users)
  }

  // Notification operations
  getNotifications(): Notification[] {
    return this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
  }

  setNotifications(notifications: Notification[]): void {
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
  }

  getNotificationsByRecipientId(recipientId: string): Notification[] {
    const notifications = this.getNotifications()
    return notifications.filter(n => n.recipientId === recipientId)
  }

  addNotification(notification: Notification): void {
    const notifications = this.getNotifications()
    notifications.push(notification)
    this.setNotifications(notifications)
  }

  updateNotification(id: string, updates: Partial<Notification>): void {
    const notifications = this.getNotifications()
    const index = notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications[index] = { ...notifications[index], ...updates }
      this.setNotifications(notifications)
    }
  }

  deleteNotification(id: string): void {
    const notifications = this.getNotifications().filter(n => n.id !== id)
    this.setNotifications(notifications)
  }

  markNotificationAsRead(id: string): void {
    this.updateNotification(id, { isRead: true })
  }

  // Teacher operations
  getTeachers(): Teacher[] {
    return this.get<Teacher[]>(STORAGE_KEYS.TEACHERS) || []
  }

  setTeachers(teachers: Teacher[]): void {
    this.set(STORAGE_KEYS.TEACHERS, teachers)
  }

  getTeacherById(id: string): Teacher | null {
    const teachers = this.getTeachers()
    return teachers.find(t => t.id === id) || null
  }

  addTeacher(teacher: Teacher): void {
    const teachers = this.getTeachers()
    teachers.push(teacher)
    this.setTeachers(teachers)
  }

  updateTeacher(id: string, updates: Partial<Teacher>): void {
    const teachers = this.getTeachers()
    const index = teachers.findIndex(t => t.id === id)
    if (index !== -1) {
      teachers[index] = { ...teachers[index], ...updates }
      this.setTeachers(teachers)
    }
  }

  deleteTeacher(id: string): void {
    this.autoBackup()
    const teachers = this.getTeachers().filter(t => t.id !== id)
    this.setTeachers(teachers)
  }

  // Task operations
  getTasks(): Task[] {
    return this.get<Task[]>(STORAGE_KEYS.TASKS) || []
  }

  setTasks(tasks: Task[]): void {
    this.set(STORAGE_KEYS.TASKS, tasks)
  }

  getTaskById(id: string): Task | null {
    const tasks = this.getTasks()
    return tasks.find(t => t.id === id) || null
  }

  getTasksByTraineeId(traineeId: string): Task[] {
    const tasks = this.getTasks()
    return tasks.filter(t => t.assignedTraineeId === traineeId)
  }

  addTask(task: Task): void {
    const tasks = this.getTasks()
    tasks.push(task)
    this.setTasks(tasks)
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const tasks = this.getTasks()
    const index = tasks.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates }
      this.setTasks(tasks)
    }
  }

  deleteTask(id: string): void {
    this.autoBackup()
    const tasks = this.getTasks().filter(t => t.id !== id)
    this.setTasks(tasks)
  }
}

export const storageService = new StorageService()

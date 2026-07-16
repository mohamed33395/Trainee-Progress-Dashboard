export type UserRole = 'admin' | 'team_leader' | 'trainee'

export type TraineeStatus = 'active' | 'completed' | 'on-hold' | 'dropped'

export type TeacherStatus = 'active' | 'inactive' | 'on-leave'

export type NotificationType = 'daily_report_submitted' | 'task_submitted' | 'task_completed' | 'task_rejected'

export type Topic = 
  | 'HTML'
  | 'CSS'
  | 'JavaScript'
  | 'TypeScript'
  | 'React'
  | 'Next.js'
  | 'Git'
  | 'Tailwind CSS'

export type Subject =
  | 'Web Development'
  | 'Frontend Development'
  | 'Backend Development'
  | 'Full Stack Development'
  | 'Mobile Development'
  | 'Data Science'
  | 'DevOps'
  | 'UI/UX Design'
  | 'Project Management'
  | 'Other'

export interface ReportTask {
  id: string
  description: string
  completed: boolean
}

export interface Evaluation {
  understanding: number
  codingSkills: number
  problemSolving: number
  debugging: number
  communication: number
  codeQuality: number
  attendance: number
}

export interface DailyReport {
  id: string
  traineeId: string
  date: string
  week: number
  day: number
  topics: Topic[]
  tasks: ReportTask[]
  evaluation: Evaluation
  strengths: string
  needsImprovement: string
  dailyNotes: string
  tomorrowPlan: string
  overallProgress: number
  createdAt: string
}

export type LanguageLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced' | 'Proficient'

export interface Trainee {
  id: string
  name: string
  email: string
  avatar: string
  currentWeek: number
  progress: number
  status: TraineeStatus
  startDate: string
  reports: DailyReport[]
  skillsProgress: Record<string, number>
  languageLevel: LanguageLevel
  age?: number
  origin?: string
  assignedCoach?: string
}

export interface WeeklyStats {
  week: number
  totalReports: number
  averageProgress: number
  activeTrainees: number
}

export interface DashboardStats {
  totalTrainees: number
  activeTrainees: number
  averageProgress: number
  completedReports: number
  weeklyStats: WeeklyStats[]
}

export interface Teacher {
  id: string
  name: string
  email: string
  avatar: string
  subject: Subject
  experience: number
  status: TeacherStatus
  startDate: string
  assignedTrainees: string[]
}

export type TaskStatus = 'pending' | 'submitted' | 'completed' | 'rejected'

export interface TaskSubmission {
  codeSnippetImage: string
  projectImage: string
  details: string
  instructorRating: number
  submittedAt: string
  reviewedAt?: string
  instructorFeedback?: string
}

export interface Task {
  id: string
  title: string
  description: string
  imageUrl: string
  assignedTraineeId: string
  status: TaskStatus
  createdAt: string
  dueDate?: string
  submission?: TaskSubmission
}

export interface User {
  id: string
  username: string
  email: string
  password: string
  role: UserRole
  traineeId?: string
  createdAt: string
}

export interface Notification {
  id: string
  type: NotificationType
  recipientId: string
  recipientRole: UserRole
  title: string
  message: string
  relatedId?: string
  isRead: boolean
  createdAt: string
}

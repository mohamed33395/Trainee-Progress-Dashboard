import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DailyReport, Task, Evaluation } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate performance rating based on daily reports and task results
 * This should be called every 5 work days (since work week is 5 days)
 */
export function calculatePerformanceRating(
  dailyReports: DailyReport[],
  tasks: Task[],
  traineeId: string
): {
  overallRating: number
  skillsProgress: Record<string, number>
  strengths: string[]
  areasForImprovement: string[]
} {
  // Filter reports for the specific trainee
  const traineeReports = dailyReports.filter(report => report.traineeId === traineeId)
  
  // Filter completed tasks for the trainee
  const traineeTasks = tasks.filter(task => 
    task.assignedTraineeId === traineeId && 
    task.status === 'completed' &&
    task.submission
  )
  
  if (traineeReports.length === 0 && traineeTasks.length === 0) {
    return {
      overallRating: 0,
      skillsProgress: {},
      strengths: [],
      areasForImprovement: []
    }
  }
  
  // Calculate average evaluation scores from daily reports
  const evaluationSum: Evaluation = {
    understanding: 0,
    codingSkills: 0,
    problemSolving: 0,
    debugging: 0,
    communication: 0,
    codeQuality: 0,
    attendance: 0,
  }
  
  traineeReports.forEach(report => {
    evaluationSum.understanding += report.evaluation.understanding
    evaluationSum.codingSkills += report.evaluation.codingSkills
    evaluationSum.problemSolving += report.evaluation.problemSolving
    evaluationSum.debugging += report.evaluation.debugging
    evaluationSum.communication += report.evaluation.communication
    evaluationSum.codeQuality += report.evaluation.codeQuality
    evaluationSum.attendance += report.evaluation.attendance
  })
  
  const reportCount = traineeReports.length || 1
  const averageEvaluation: Evaluation = {
    understanding: evaluationSum.understanding / reportCount,
    codingSkills: evaluationSum.codingSkills / reportCount,
    problemSolving: evaluationSum.problemSolving / reportCount,
    debugging: evaluationSum.debugging / reportCount,
    communication: evaluationSum.communication / reportCount,
    codeQuality: evaluationSum.codeQuality / reportCount,
    attendance: evaluationSum.attendance / reportCount,
  }
  
  // Calculate task performance (average rating)
  const taskSum = traineeTasks.reduce((sum, task) => 
    sum + (task.submission?.instructorRating || 0), 0
  )
  const taskCount = traineeTasks.length || 1
  const averageTaskRating = taskSum / taskCount
  
  // Calculate overall rating (70% from daily reports, 30% from tasks)
  const overallRating = Math.round(
    (Object.values(averageEvaluation).reduce((a, b) => a + b, 0) / 7 * 0.7) +
    (averageTaskRating * 0.3)
  )
  
  // Calculate skills progress from tasks
  const skillsProgress: Record<string, number> = {}
  traineeTasks.forEach(task => {
    if (task.skills) {
      task.skills.forEach(skill => {
        const currentProgress = skillsProgress[skill] || 0
        const scorePercentage = (task.submission?.instructorRating || 0) / 10 * 100
        skillsProgress[skill] = Math.min(100, currentProgress + scorePercentage * 0.1)
      })
    }
  })
  
  // Identify strengths (areas with rating >= 7)
  const strengths: string[] = []
  if (averageEvaluation.understanding >= 7) strengths.push('Understanding')
  if (averageEvaluation.codingSkills >= 7) strengths.push('Coding Skills')
  if (averageEvaluation.problemSolving >= 7) strengths.push('Problem Solving')
  if (averageEvaluation.debugging >= 7) strengths.push('Debugging')
  if (averageEvaluation.communication >= 7) strengths.push('Communication')
  if (averageEvaluation.codeQuality >= 7) strengths.push('Code Quality')
  if (averageEvaluation.attendance >= 7) strengths.push('Attendance')
  
  // Identify areas for improvement (areas with rating <= 5)
  const areasForImprovement: string[] = []
  if (averageEvaluation.understanding <= 5) areasForImprovement.push('Understanding')
  if (averageEvaluation.codingSkills <= 5) areasForImprovement.push('Coding Skills')
  if (averageEvaluation.problemSolving <= 5) areasForImprovement.push('Problem Solving')
  if (averageEvaluation.debugging <= 5) areasForImprovement.push('Debugging')
  if (averageEvaluation.communication <= 5) areasForImprovement.push('Communication')
  if (averageEvaluation.codeQuality <= 5) areasForImprovement.push('Code Quality')
  if (averageEvaluation.attendance <= 5) areasForImprovement.push('Attendance')
  
  return {
    overallRating,
    skillsProgress,
    strengths,
    areasForImprovement
  }
}

/**
 * Check if it's time to calculate performance (every 5 work days)
 */
export function shouldCalculatePerformance(reports: DailyReport[]): boolean {
  if (reports.length === 0) return false
  
  // Count total work days (each report represents one work day)
  const totalWorkDays = reports.length
  
  // Calculate every 5 work days
  return totalWorkDays % 5 === 0
}

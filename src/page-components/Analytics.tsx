import { Trainee, DailyReport, Task, TaskStatus, User, UserRole } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { TrendingUp, Users, Award, Target, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface AnalyticsProps {
  trainees: Trainee[]
  reports: DailyReport[]
  tasks: Task[]
  users: User[]
}

export function Analytics({ trainees, reports, tasks, users }: AnalyticsProps) {
  const { t } = useLanguage()
  const { user, isTrainee } = useAuth()
  
  // Filter data based on user role
  const currentTrainee = isTrainee() && user?.traineeId 
    ? trainees.find(t => t.id === user.traineeId)
    : null
  
  const displayTrainees = currentTrainee ? [currentTrainee] : trainees
  const displayReports = currentTrainee 
    ? reports.filter(r => r.traineeId === currentTrainee.id)
    : reports
  const displayTasks = currentTrainee
    ? tasks.filter(t => t.assignedTraineeId === currentTrainee.id)
    : tasks
  
  // Skills distribution across all trainees
  const skillsData = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Git', 'Tailwind CSS'].map(skill => {
    const total = displayTrainees.reduce((acc, t) => {
      const progress = t.skillsProgress ? (t.skillsProgress[skill] || 0) : 0
      return acc + progress
    }, 0)
    const average = displayTrainees.length > 0 ? Math.round(total / displayTrainees.length) : 0
    return { skill, average }
  }).filter(item => item.average > 0) // Only show skills with data

  // Progress by status
  const progressByStatus = displayTrainees.reduce((acc, t) => {
    const status = t.status
    if (!acc[status]) {
      acc[status] = { count: 0, totalProgress: 0 }
    }
    acc[status].count += 1
    acc[status].totalProgress += t.progress
    return acc
  }, {} as Record<string, { count: number; totalProgress: number }>)

  const statusProgressData = Object.entries(progressByStatus).map(([status, data]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    averageProgress: Math.round(data.totalProgress / data.count),
    count: data.count,
  }))

  // Weekly report trends
  const weeklyReports = displayReports.reduce((acc, report) => {
    const week = report.week
    if (!acc[week]) {
      acc[week] = { count: 0, totalProgress: 0 }
    }
    acc[week].count += 1
    acc[week].totalProgress += report.overallProgress
    return acc
  }, {} as Record<number, { count: number; totalProgress: number }>)

  const weeklyTrendData = Object.entries(weeklyReports)
    .map(([week, data]) => ({
      week: `Week ${week}`,
      reports: data.count,
      averageProgress: Math.round(data.totalProgress / data.count),
    }))
    .sort((a, b) => parseInt(a.week.replace('Week ', '')) - parseInt(b.week.replace('Week ', '')))

  // Top performing skills
  const topSkills = skillsData.length > 0 
    ? [...skillsData].sort((a, b) => b.average - a.average).slice(0, 5)
    : [{ skill: 'No data', average: 0 }]

  // Trainee performance distribution
  const performanceDistribution = [
    { range: '0-25%', count: trainees.filter(t => t.progress < 25).length },
    { range: '26-50%', count: trainees.filter(t => t.progress >= 25 && t.progress < 50).length },
    { range: '51-75%', count: trainees.filter(t => t.progress >= 50 && t.progress < 75).length },
    { range: '76-100%', count: trainees.filter(t => t.progress >= 75).length },
  ].filter(item => item.count > 0)

  // Task statistics
  const taskStats = {
    total: displayTasks.length,
    completed: displayTasks.filter(t => t.status === 'completed').length,
    pending: displayTasks.filter(t => t.status === 'created' || t.status === 'pending').length,
    rejected: displayTasks.filter(t => t.status === 'rejected').length,
    submitted: displayTasks.filter(t => t.status === 'submitted' || t.status === 'approved').length,
  }

  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0

  // User statistics by role
  const userStats = {
    total: users.length,
    students: users.filter(u => u.role === 'trainee').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    leaders: users.filter(u => u.role === 'team_leader' || u.role === 'admin').length,
  }

  // Task status distribution for chart
  const taskStatusData = [
    { status: 'Completed', count: taskStats.completed, color: '#10b981' },
    { status: 'Submitted', count: taskStats.submitted, color: '#3b82f6' },
    { status: 'Pending', count: taskStats.pending, color: '#f59e0b' },
    { status: 'Rejected', count: taskStats.rejected, color: '#ef4444' },
  ].filter(item => item.count > 0)

  // Evaluation averages
  const evaluationAverages = reports.length > 0 ? {
    understanding: Math.round(reports.reduce((acc, r) => acc + r.evaluation.understanding, 0) / reports.length),
    codingSkills: Math.round(reports.reduce((acc, r) => acc + r.evaluation.codingSkills, 0) / reports.length),
    problemSolving: Math.round(reports.reduce((acc, r) => acc + r.evaluation.problemSolving, 0) / reports.length),
    debugging: Math.round(reports.reduce((acc, r) => acc + r.evaluation.debugging, 0) / reports.length),
    communication: Math.round(reports.reduce((acc, r) => acc + r.evaluation.communication, 0) / reports.length),
    codeQuality: Math.round(reports.reduce((acc, r) => acc + r.evaluation.codeQuality, 0) / reports.length),
    attendance: Math.round(reports.reduce((acc, r) => acc + r.evaluation.attendance, 0) / reports.length),
  } : {}

  const evaluationData = Object.entries(evaluationAverages).map(([key, value]) => ({
    criteria: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    score: value,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.analytics.title}</h1>
        <p className="text-muted-foreground">
          {t.analytics.subtitle}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.submitted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.students}</div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.leaders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.analytics.averageProgress}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainees.length > 0 ? Math.round(trainees.reduce((acc, t) => acc + t.progress, 0) / trainees.length) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.analytics.totalReports}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.analytics.activeTrainees}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainees.filter(t => t.status === 'active').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skills Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.skillsDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            {skillsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3b82f6" name="Average Progress" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No skills data available. Complete tasks to see skill progress.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress by Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.progressByStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            {statusProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageProgress" fill="#10b981" name="Average Progress" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No trainee status data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t.analytics.weeklyTrends}</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="reports" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Reports" />
                  <Area type="monotone" dataKey="averageProgress" stackId="2" stroke="#10b981" fill="#10b981" name="Avg Progress" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No weekly report data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.topSkills}</CardTitle>
          </CardHeader>
          <CardContent>
            {topSkills.length > 0 && topSkills[0].skill !== 'No data' ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSkills} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="skill" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#8b5cf6" name="Average Progress" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No skills data available. Complete tasks to see skill progress.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.performanceDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percent }) => `${range} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No performance data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluation Averages */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t.analytics.evaluationAverages}</CardTitle>
          </CardHeader>
          <CardContent>
            {evaluationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={evaluationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="criteria" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ec4899" name="Average Score" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No evaluation data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, FileText, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Trainee, DailyReport } from '@/types'
import { useLanguage } from '@/context/LanguageContext'

interface DashboardProps {
  trainees: Trainee[]
  reports: DailyReport[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function Dashboard({ trainees, reports }: DashboardProps) {
  const { t } = useLanguage()
  const totalTrainees = trainees.length
  const activeTrainees = trainees.filter(t => t.status === 'active').length
  const averageProgress = trainees.length > 0 
    ? Math.round(trainees.reduce((acc, t) => acc + t.progress, 0) / trainees.length)
    : 0
  const completedReports = reports.length

  // Weekly statistics
  const weeklyData = [
    { week: 'Week 1', reports: 12, progress: 45 },
    { week: 'Week 2', reports: 15, progress: 52 },
    { week: 'Week 3', reports: 18, progress: 58 },
    { week: 'Week 4', reports: 22, progress: 65 },
    { week: 'Week 5', reports: 20, progress: 70 },
    { week: 'Week 6', reports: 25, progress: 75 },
  ]

  // Status distribution
  const statusData = [
    { name: t.common.active, value: trainees.filter(t => t.status === 'active').length },
    { name: t.common.completed, value: trainees.filter(t => t.status === 'completed').length },
    { name: t.common.onHold, value: trainees.filter(t => t.status === 'on-hold').length },
    { name: t.common.dropped, value: trainees.filter(t => t.status === 'dropped').length },
  ].filter(item => item.value > 0)

  // Progress trend
  const progressData = trainees.slice(0, 5).map(t => ({
    name: t.name.split(' ')[0],
    progress: t.progress,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
        <p className="text-muted-foreground">
          {t.dashboard.subtitle}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalTrainees}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrainees}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.activeTrainees}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrainees}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeTrainees / totalTrainees) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.averageProgress}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.completedReports}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedReports}</div>
            <p className="text-xs text-muted-foreground">
              +8 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Reports Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t.dashboard.weeklyStatistics}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reports" fill="#3b82f6" name="Reports" />
                <Bar dataKey="progress" fill="#10b981" name="Avg Progress" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.statusDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress Trend */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t.dashboard.traineeProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.topPerformers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainees
                .sort((a, b) => b.progress - a.progress)
                .slice(0, 3)
                .map((trainee, index) => (
                  <div key={trainee.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{trainee.name}</p>
                      <p className="text-xs text-muted-foreground">Week {trainee.currentWeek}</p>
                    </div>
                    <div className="text-sm font-bold text-blue-600">
                      {trainee.progress}%
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

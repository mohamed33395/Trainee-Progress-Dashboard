import { useParams } from 'next/navigation'
import { Trainee, DailyReport } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { ArrowLeft, Mail, Calendar, TrendingUp, Award, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { useLanguage } from '@/context/LanguageContext'

interface StudentDetailsProps {
  trainees: Trainee[]
  reports: DailyReport[]
}

export function StudentDetails({ trainees, reports }: StudentDetailsProps) {
  const { t } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const trainee = trainees.find(t => t.id === id)
  const traineeReports = reports.filter(r => r.traineeId === id)

  if (!trainee) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">{t.studentDetails.title} not found</p>
      </div>
    )
  }

  const skillsData = Object.entries(trainee.skillsProgress).map(([skill, progress]) => ({
    skill,
    progress,
  }))

  const weeklyProgress = traineeReports.map(report => ({
    week: `Week ${report.week}`,
    progress: report.overallProgress,
    date: format(new Date(report.date), 'MMM dd'),
  }))

  const evaluationData = traineeReports.length > 0 ? {
    understanding: traineeReports.reduce((acc, r) => acc + r.evaluation.understanding, 0) / traineeReports.length,
    codingSkills: traineeReports.reduce((acc, r) => acc + r.evaluation.codingSkills, 0) / traineeReports.length,
    problemSolving: traineeReports.reduce((acc, r) => acc + r.evaluation.problemSolving, 0) / traineeReports.length,
    debugging: traineeReports.reduce((acc, r) => acc + r.evaluation.debugging, 0) / traineeReports.length,
    communication: traineeReports.reduce((acc, r) => acc + r.evaluation.communication, 0) / traineeReports.length,
    codeQuality: traineeReports.reduce((acc, r) => acc + r.evaluation.codeQuality, 0) / traineeReports.length,
    attendance: traineeReports.reduce((acc, r) => acc + r.evaluation.attendance, 0) / traineeReports.length,
  } : {}

  const radarData = Object.entries(evaluationData).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    value: Math.round(value),
    fullMark: 10,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href="/trainees">
            <ArrowLeft className="h-5 w-5" />
          </a>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{trainee.name}</h1>
          <p className="text-muted-foreground">{trainee.email}</p>
        </div>
        <Badge variant={trainee.status === 'active' ? 'default' : 'secondary'}>
          {trainee.status.charAt(0).toUpperCase() + trainee.status.slice(1)}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.common.week}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t.common.week} {trainee.currentWeek}</div>
            <p className="text-xs text-muted-foreground">
              Started {format(new Date(trainee.startDate), 'MMM dd, yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.common.progress}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainee.progress}%</div>
            <Progress value={trainee.progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.studentDetails.reportsHistory}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{traineeReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Total reports submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {traineeReports.length > 0 
                ? Math.round(traineeReports.reduce((acc, r) => acc + r.overallProgress, 0) / traineeReports.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all evaluations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t.studentDetails.overview}</TabsTrigger>
          <TabsTrigger value="skills">{t.studentDetails.skillsProgress}</TabsTrigger>
          <TabsTrigger value="reports">{t.studentDetails.reportsHistory}</TabsTrigger>
          <TabsTrigger value="evaluation">{t.studentDetails.evaluation}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t.studentDetails.profile}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={trainee.avatar}
                    alt={trainee.name}
                    className="h-20 w-20 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{trainee.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {trainee.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.common.status}</span>
                    <Badge variant={trainee.status === 'active' ? 'default' : 'secondary'}>
                      {trainee.status.charAt(0).toUpperCase() + trainee.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.studentDetails.age}</span>
                    <span>{trainee.age || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.studentDetails.origin}</span>
                    <span>{trainee.origin || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.studentDetails.languageLevel}</span>
                    <Badge variant="outline">{trainee.languageLevel}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.trainees.startDate}</span>
                    <span>{format(new Date(trainee.startDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.studentDetails.duration}</span>
                    <span>{trainee.currentWeek} weeks</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.studentDetails.assignedCoach}</span>
                    <span>{trainee.assignedCoach || t.studentDetails.notAssigned}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle>{t.studentDetails.overallProgress}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <CircularProgress value={trainee.progress} size={200}>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{trainee.progress}%</div>
                      <div className="text-sm text-muted-foreground">Complete</div>
                    </div>
                  </CircularProgress>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t.studentDetails.weeklyProgress}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.studentDetails.skillsProgress}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={skillsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="skill" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(trainee.skillsProgress).map(([skill, progress]) => (
              <Card key={skill}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{skill}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progress}%</div>
                  <Progress value={progress} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.studentDetails.reportsHistory}</CardTitle>
            </CardHeader>
            <CardContent>
              {traineeReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t.studentDetails.noReports}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.common.date}</TableHead>
                      <TableHead>{t.common.week}</TableHead>
                      <TableHead>Topics</TableHead>
                      <TableHead>{t.common.progress}</TableHead>
                      <TableHead>Overall Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {traineeReports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell>{format(new Date(report.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{t.common.week} {report.week}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {report.topics.slice(0, 3).map(topic => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {report.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{report.topics.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${report.overallProgress}%` }}
                              />
                            </div>
                            <span className="text-sm">{report.overallProgress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={report.overallProgress >= 80 ? 'default' : 'secondary'}>
                            {report.overallProgress >= 80 ? 'Excellent' : report.overallProgress >= 60 ? 'Good' : 'Average'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t.studentDetails.evaluation}</CardTitle>
              </CardHeader>
              <CardContent>
                {traineeReports.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} />
                      <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t.studentDetails.noEvaluationData}</p>
                )}
              </CardContent>
            </Card>

            {/* Evaluation Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t.studentDetails.evaluationDetails}</CardTitle>
              </CardHeader>
              <CardContent>
                {traineeReports.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(evaluationData).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="font-bold">{Math.round(value)}/10</span>
                        </div>
                        <Progress value={Math.round(value) * 10} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t.studentDetails.noEvaluationData}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Evaluations */}
          <Card>
            <CardHeader>
              <CardTitle>{t.studentDetails.recentEvaluations}</CardTitle>
            </CardHeader>
            <CardContent>
              {traineeReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t.studentDetails.noEvaluationData}</p>
              ) : (
                <div className="space-y-4">
                  {traineeReports.slice(-5).reverse().map(report => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          {format(new Date(report.date), 'MMM dd, yyyy')} - {t.common.week} {report.week}
                        </div>
                        <Badge>{report.overallProgress}%</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Understanding:</span>
                          <span className="ml-1 font-medium">{report.evaluation.understanding}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Coding Skills:</span>
                          <span className="ml-1 font-medium">{report.evaluation.codingSkills}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Problem Solving:</span>
                          <span className="ml-1 font-medium">{report.evaluation.problemSolving}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Communication:</span>
                          <span className="ml-1 font-medium">{report.evaluation.communication}/10</span>
                        </div>
                      </div>
                      {report.strengths && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Strengths:</span>
                          <p className="mt-1">{report.strengths}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

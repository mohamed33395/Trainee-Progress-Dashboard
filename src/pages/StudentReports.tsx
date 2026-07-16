import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Trainee, DailyReport } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Download, ArrowLeft, Calendar, FileText } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface StudentReportsProps {
  trainees: Trainee[]
  reports: DailyReport[]
}

export function StudentReports({ trainees, reports }: StudentReportsProps) {
  const { t } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const [searchQuery, setSearchQuery] = useState('')

  // If an ID is provided, show student detail view
  if (id) {
    const trainee = trainees.find(t => t.id === id)
    if (!trainee) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">{t.studentReports.studentNotFound}</p>
        </div>
      )
    }
    return <StudentDetailView trainee={trainee} reports={reports} />
  }

  // Otherwise, show the student list
  const filteredTrainees = trainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainee.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.studentReports.title}</h1>
        <p className="text-muted-foreground">
          {t.studentReports.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.studentReports.allStudents}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.studentReports.searchStudents}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrainees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.studentReports.noStudents}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.common.name}</TableHead>
                  <TableHead>{t.common.email}</TableHead>
                  <TableHead>{t.studentReports.languageLevel}</TableHead>
                  <TableHead>{t.common.progress}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead>{t.studentReports.reports}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map(trainee => (
                  <TableRow key={trainee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={trainee.avatar} />
                          <AvatarFallback>{trainee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{trainee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{trainee.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{trainee.languageLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${trainee.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{trainee.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trainee.status === 'active'
                            ? 'default'
                            : trainee.status === 'completed'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {trainee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{reports.filter(r => r.traineeId === trainee.id).length}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/student-reports/${trainee.id}`}>
                          {t.studentReports.viewReports}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface StudentDetailViewProps {
  trainee: Trainee
  reports: DailyReport[]
}

function StudentDetailView({ trainee, reports }: StudentDetailViewProps) {
  const { t } = useLanguage()

  const studentReports = reports
    .filter(report => report.traineeId === trainee.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const downloadReport = (report: DailyReport) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('Daily Progress Report', 105, 20, { align: 'center' })
    
    // Student Info
    doc.setFontSize(12)
    doc.text(`Student: ${trainee.name}`, 20, 40)
    doc.text(`Date: ${new Date(report.date).toLocaleDateString()}`, 20, 50)
    doc.text(`Week: ${report.week}`, 20, 60)
    doc.text(`Language Level: ${trainee.languageLevel}`, 20, 70)
    
    // Topics
    doc.setFontSize(14)
    doc.text('Topics Covered:', 20, 90)
    doc.setFontSize(10)
    doc.text(report.topics.join(', '), 20, 100)
    
    // Tasks
    doc.setFontSize(14)
    doc.text('Tasks:', 20, 120)
    doc.setFontSize(10)
    report.tasks.forEach((task, index) => {
      doc.text(`${index + 1}. ${task.description} - ${task.completed ? 'Completed' : 'Pending'}`, 20, 130 + (index * 10))
    })
    
    // Evaluation
    doc.setFontSize(14)
    doc.text('Evaluation:', 20, 180)
    doc.setFontSize(10)
    doc.text(`Understanding: ${report.evaluation.understanding}/10`, 20, 190)
    doc.text(`Coding Skills: ${report.evaluation.codingSkills}/10`, 20, 200)
    doc.text(`Problem Solving: ${report.evaluation.problemSolving}/10`, 20, 210)
    doc.text(`Debugging: ${report.evaluation.debugging}/10`, 20, 220)
    doc.text(`Communication: ${report.evaluation.communication}/10`, 20, 230)
    doc.text(`Code Quality: ${report.evaluation.codeQuality}/10`, 20, 240)
    doc.text(`Attendance: ${report.evaluation.attendance}/10`, 20, 250)
    
    // Strengths and Improvements
    doc.setFontSize(14)
    doc.text('Strengths:', 20, 270)
    doc.setFontSize(10)
    doc.text(report.strengths, 20, 280)
    
    doc.setFontSize(14)
    doc.text('Areas for Improvement:', 20, 300)
    doc.setFontSize(10)
    doc.text(report.needsImprovement, 20, 310)
    
    // Daily Notes
    if (report.dailyNotes) {
      doc.setFontSize(14)
      doc.text('Daily Notes:', 20, 330)
      doc.setFontSize(10)
      doc.text(report.dailyNotes, 20, 340)
    }
    
    // Tomorrow's Plan
    if (report.tomorrowPlan) {
      doc.setFontSize(14)
      doc.text("Tomorrow's Plan:", 20, 360)
      doc.setFontSize(10)
      doc.text(report.tomorrowPlan, 20, 370)
    }
    
    // Overall Progress
    doc.setFontSize(14)
    doc.text(`Overall Progress: ${report.overallProgress}%`, 20, 390)
    
    doc.save(`${trainee.name.replace(/\s+/g, '_')}_report_${report.date}.pdf`)
  }

  const downloadAllReports = () => {
    studentReports.forEach(report => downloadReport(report))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/student-reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.studentReports.title}</h1>
          <p className="text-muted-foreground">
            {t.studentReports.viewProgressReports.replace('{name}', trainee.name)}
          </p>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={trainee.avatar} />
              <AvatarFallback className="text-2xl">{trainee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{trainee.name}</h2>
                <p className="text-muted-foreground">{trainee.email}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">{t.studentReports.languageLevel}:</span>
                  <Badge variant="outline" className="ml-2">{trainee.languageLevel}</Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t.common.status}:</span>
                  <Badge variant={trainee.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                    {trainee.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t.common.progress}:</span>
                  <span className="ml-2 font-medium">{trainee.progress}%</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t.trainees.currentWeek}:</span>
                  <span className="ml-2 font-medium">{t.common.week} {trainee.currentWeek}</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t.studentReports.enrolled}:</span>
                <span className="ml-2">{new Date(trainee.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.studentReports.reports}</CardTitle>
            <Button onClick={downloadAllReports} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t.studentReports.downloadAllReports}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {studentReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.studentReports.noReportsAvailable}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentReports.map(report => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{new Date(report.date).toLocaleDateString()}</h3>
                        <p className="text-sm text-muted-foreground">Week {report.week}, Day {report.day}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.overallProgress >= 80 ? 'default' : 'secondary'}>
                        {report.overallProgress}% Progress
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadReport(report)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t.studentReports.download}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">{t.studentReports.topics}:</span>
                      <span className="ml-2 text-muted-foreground">{report.topics.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t.studentReports.strengths}:</span>
                      <span className="ml-2 text-muted-foreground">{report.strengths}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t.studentReports.areasForImprovement}:</span>
                      <span className="ml-2 text-muted-foreground">{report.needsImprovement}</span>
                    </div>
                    {report.dailyNotes && (
                      <div>
                        <span className="font-medium">{t.studentReports.dailyNotes}:</span>
                        <span className="ml-2 text-muted-foreground">{report.dailyNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

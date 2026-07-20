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
import { useAuth } from '@/context/AuthContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface StudentReportsProps {
  trainees: Trainee[]
  reports: DailyReport[]
}

export function StudentReports({ trainees, reports }: StudentReportsProps) {
  const { t } = useLanguage()
  const { user, isTrainee } = useAuth()
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [searchQuery, setSearchQuery] = useState('')

  // Filter trainees based on user role
  const currentTrainee = isTrainee() && user?.traineeId 
    ? trainees.find(t => t.id === user.traineeId)
    : null
  
  const displayTrainees = currentTrainee ? [currentTrainee] : trainees

  // If an ID is provided, show student detail view
  if (id) {
    const trainee = displayTrainees.find(t => t.id === id)
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
  const filteredTrainees = displayTrainees.filter(trainee =>
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
                        <Link href={`/student-reports/${trainee.id}`}>
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
    let yPos = 20

    // Company Header - Logo and Name Only
    try {
      doc.addImage('/img/logo.png', 'PNG', 20, yPos, 30, 30)
    } catch (e) {
      // If logo fails, continue without it
    }
    




    yPos += 40

    // Report Title
    doc.setFontSize(18)
    doc.setTextColor(59, 130, 246)
    doc.text('Daily Progress Report', 105, yPos, { align: 'center' })
    yPos += 10

    // Separator Line
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.5)
    doc.line(20, yPos, 190, yPos)
    yPos += 15

    // Student photo and info table
    if (trainee.avatar) {
      try {
        doc.addImage(trainee.avatar, 'JPEG', 20, yPos, 40, 40)
      } catch (e) {
        // If image fails, use placeholder
        doc.setFillColor(200, 200, 200)
        doc.rect(20, yPos, 40, 40, 'F')
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.text('No Photo', 40, yPos + 25, { align: 'center' })
      }
    } else {
      doc.setFillColor(200, 200, 200)
      doc.rect(20, yPos, 40, 40, 'F')
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text('No Photo', 40, yPos + 25, { align: 'center' })
    }

    // Student Info Table
    autoTable(doc, {
      startY: yPos,
      head: [['Field', 'Value']],
      body: [
        ['Name', trainee.name],
        ['Email', trainee.email],
        ['Date', new Date(report.date).toLocaleDateString()],
        ['Week', report.week.toString()],
        ['Day', report.day.toString()],
        ['Language Level', trainee.languageLevel],
        ['Status', trainee.status],
        ['Progress', `${trainee.progress}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 80 },
      },
      margin: { top: yPos, left: 70, right: 20 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Topics Table
    autoTable(doc, {
      startY: yPos,
      head: [['Topics Covered']],
      body: report.topics.map(topic => [topic]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      margin: { left: 20, right: 20 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Tasks Table
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Task Description', 'Status']],
      body: report.tasks.map((task, index) => [
        index + 1,
        task.description,
        task.completed ? '✓ Completed' : '○ Pending',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 120 },
        2: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: 20, right: 20 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Evaluation Table
    autoTable(doc, {
      startY: yPos,
      head: [['Criteria', 'Score', 'Max']],
      body: [
        ['Understanding', report.evaluation.understanding, '10'],
        ['Coding Skills', report.evaluation.codingSkills, '10'],
        ['Problem Solving', report.evaluation.problemSolving, '10'],
        ['Debugging', report.evaluation.debugging, '10'],
        ['Communication', report.evaluation.communication, '10'],
        ['Code Quality', report.evaluation.codeQuality, '10'],
        ['Attendance', report.evaluation.attendance, '10'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 20, right: 20 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Strengths Table
    autoTable(doc, {
      startY: yPos,
      head: [['Strengths']],
      body: [[report.strengths]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      margin: { left: 20, right: 20 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Areas for Improvement Table
    autoTable(doc, {
      startY: yPos,
      head: [['Areas for Improvement']],
      body: [[report.needsImprovement]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      margin: { left: 20, right: 20 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Daily Notes Table
    if (report.dailyNotes) {
      autoTable(doc, {
        startY: yPos,
        head: [['Daily Notes']],
        body: [[report.dailyNotes]],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 },
      })
      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Tomorrow's Plan Table
    if (report.tomorrowPlan) {
      autoTable(doc, {
        startY: yPos,
        head: [["Tomorrow's Plan"]],
        body: [[report.tomorrowPlan]],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 },
      })
      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Overall Progress
    autoTable(doc, {
      startY: yPos,
      head: [['Overall Progress']],
      body: [[`${report.overallProgress}%`]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', fontSize: 16, fontStyle: 'bold' },
      },
      margin: { left: 20, right: 20 },
    })

    // Footer with Company Contact Info
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      // Page Number
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }

    doc.save(`${trainee.name.replace(/\s+/g, '_')}_report_${report.date}.pdf`)
  }

  const downloadAllReports = () => {
    studentReports.forEach(report => downloadReport(report))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student-reports">
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

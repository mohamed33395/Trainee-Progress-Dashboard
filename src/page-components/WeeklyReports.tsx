"use client"
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, TrendingUp, Target, ChevronLeft, ChevronRight, Download, Save, FileText, Sparkles } from 'lucide-react'
import { DailyReport, Topic, Trainee } from '@/types'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface WeeklyReportsProps {
  trainees: Trainee[]
  reports: DailyReport[]
}

export function WeeklyReports({ trainees, reports }: WeeklyReportsProps) {
  const { t } = useLanguage()
  const { user, isTrainee } = useAuth()
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null)

  // Filter trainees based on user role
  const currentTrainee = isTrainee() && user?.traineeId 
    ? trainees.find(t => t.id === user.traineeId)
    : null
  
  const displayTrainees = currentTrainee ? [currentTrainee] : trainees

  // Auto-select first trainee if none selected
  if (!selectedTraineeId && displayTrainees.length > 0) {
    setSelectedTraineeId(displayTrainees[0].id)
  }

  // Get all available weeks
  const allWeeks = reports.length > 0 
    ? Array.from(new Set(reports.map(r => r.week))).sort((a, b) => a - b)
    : [1]

  // Get weekly reports for selected trainee and week
  const getWeeklyReports = (traineeId: string, week: number) => {
    return reports
      .filter(r => r.traineeId === traineeId && r.week === week)
      .sort((a, b) => a.day - b.day)
  }

  // Calculate skill shots (skills not used during the week)
  const getSkillShots = (weeklyReports: DailyReport[]): Topic[] => {
    const allTopics: Topic[] = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Git', 'Tailwind CSS']
    const usedTopics = new Set<Topic>()
    
    weeklyReports.forEach(report => {
      report.topics.forEach(topic => usedTopics.add(topic))
    })
    
    return allTopics.filter(topic => !usedTopics.has(topic))
  }

  // Calculate weekly averages
  const calculateWeeklyAverages = (weeklyReports: DailyReport[]) => {
    if (weeklyReports.length === 0) return null

    const averages = {
      understanding: 0,
      codingSkills: 0,
      problemSolving: 0,
      debugging: 0,
      communication: 0,
      codeQuality: 0,
      attendance: 0,
      overallProgress: 0,
    }

    weeklyReports.forEach(report => {
      averages.understanding += report.evaluation.understanding
      averages.codingSkills += report.evaluation.codingSkills
      averages.problemSolving += report.evaluation.problemSolving
      averages.debugging += report.evaluation.debugging
      averages.communication += report.evaluation.communication
      averages.codeQuality += report.evaluation.codeQuality
      averages.attendance += report.evaluation.attendance
      averages.overallProgress += report.overallProgress
    })

    const count = weeklyReports.length
    return {
      understanding: Math.round(averages.understanding / count),
      codingSkills: Math.round(averages.codingSkills / count),
      problemSolving: Math.round(averages.problemSolving / count),
      debugging: Math.round(averages.debugging / count),
      communication: Math.round(averages.communication / count),
      codeQuality: Math.round(averages.codeQuality / count),
      attendance: Math.round(averages.attendance / count),
      overallProgress: Math.round(averages.overallProgress / count),
    }
  }

  const selectedTrainee = selectedTraineeId ? trainees.find(t => t.id === selectedTraineeId) : null
  const weeklyReports = selectedTraineeId ? getWeeklyReports(selectedTraineeId, selectedWeek) : []
  const skillShots = getSkillShots(weeklyReports)
  const weeklyAverages = calculateWeeklyAverages(weeklyReports)

  // Download weekly report as PDF
  const downloadWeeklyReport = () => {
    if (!selectedTrainee || !weeklyAverages) return

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
    doc.text('Weekly Progress Report', 105, yPos, { align: 'center' })
    yPos += 10

    // Separator Line
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.5)
    doc.line(20, yPos, 190, yPos)
    yPos += 15

    // Student photo and info table
    if (selectedTrainee.avatar) {
      try {
        doc.addImage(selectedTrainee.avatar, 'JPEG', 20, yPos, 40, 40)
      } catch (e) {
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
        ['Name', selectedTrainee.name],
        ['Email', selectedTrainee.email],
        ['Week', selectedWeek.toString()],
        ['Language Level', selectedTrainee.languageLevel],
        ['Status', selectedTrainee.status],
        ['Progress', `${selectedTrainee.progress}%`],
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

    // Weekly Averages Table
    autoTable(doc, {
      startY: yPos,
      head: [['Criteria', 'Weekly Average', 'Max']],
      body: [
        ['Understanding', weeklyAverages.understanding.toString(), '10'],
        ['Coding Skills', weeklyAverages.codingSkills.toString(), '10'],
        ['Problem Solving', weeklyAverages.problemSolving.toString(), '10'],
        ['Debugging', weeklyAverages.debugging.toString(), '10'],
        ['Communication', weeklyAverages.communication.toString(), '10'],
        ['Code Quality', weeklyAverages.codeQuality.toString(), '10'],
        ['Attendance', weeklyAverages.attendance.toString(), '10'],
        ['Overall Progress', `${weeklyAverages.overallProgress}%`, '100'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 20, right: 20 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Five-Day Reports
    weeklyReports.forEach((report, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setTextColor(59, 130, 246)
      doc.text(`Day ${report.day} - ${new Date(report.date).toLocaleDateString()}`, 20, yPos)
      yPos += 10

      // Topics
      autoTable(doc, {
        startY: yPos,
        head: [['Topics Covered']],
        body: report.topics.map(topic => [topic]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 10

      // Tasks
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Task Description', 'Status']],
        body: report.tasks.map((task, idx) => [
          idx + 1,
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

      yPos = (doc as any).lastAutoTable.finalY + 10

      // Strengths
      autoTable(doc, {
        startY: yPos,
        head: [['Strengths']],
        body: [[report.strengths]],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 10

      // Areas for Improvement
      autoTable(doc, {
        startY: yPos,
        head: [['Areas for Improvement']],
        body: [[report.needsImprovement]],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    })

    // Skill Shots
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(255, 152, 0)
    doc.text('Skill Shots - Skills Not Practiced This Week', 20, yPos)
    yPos += 10

    if (skillShots.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Skill']],
        body: skillShots.map(skill => [skill]),
        theme: 'grid',
        headStyles: { fillColor: [255, 152, 0], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 },
      })
    } else {
      doc.setFontSize(12)
      doc.setTextColor(34, 197, 94)
      doc.text('Great job! All skills were covered this week.', 20, yPos)
    }

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

    doc.save(`${selectedTrainee.name.replace(/\s+/g, '_')}_weekly_report_week_${selectedWeek}.pdf`)
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-900/10 to-purple-900/10 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-900 to-blue-600 bg-clip-text text-transparent">
            التقارير الأسبوعية
          </h1>
          <p className="text-purple-200 mt-2">
            عرض ملخصات الأداء الأسبوعية والتقارير التفصيلية
          </p>
        </div>
        {selectedTrainee && weeklyAverages && (
          <div className="flex gap-2">
            <Button 
              onClick={downloadWeeklyReport}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              تحميل PDF
            </Button>
          </div>
        )}
      </div>

      {/* Trainee Selection */}
      {!currentTrainee && (
        <Card className="border-2 border-purple-300/50 shadow-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500/30 to-blue-500/30">
            <CardTitle className="text-xl flex items-center gap-2 text-purple-100">
              <Sparkles className="h-5 w-5 text-purple-300" />
              اختيار المتدرب
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {displayTrainees.map(trainee => (
                <Badge
                  key={trainee.id}
                  variant={selectedTraineeId === trainee.id ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 ${
                    selectedTraineeId === trainee.id 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                      : 'hover:bg-purple-500/30 text-purple-200 border-purple-400/50'
                  }`}
                  onClick={() => setSelectedTraineeId(trainee.id)}
                >
                  {trainee.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTrainee && (
        <>
          {/* Week Selection */}
          <Card className="border-2 border-purple-300/50 shadow-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500/30 to-blue-500/30">
              <CardTitle className="text-xl flex items-center justify-between text-purple-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-300" />
                  <span>الأسبوع {selectedWeek}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                    disabled={selectedWeek === 1}
                    className="hover:bg-purple-500/30 border-purple-400/50 text-purple-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedWeek(Math.min(...allWeeks, selectedWeek + 1))}
                    disabled={selectedWeek === Math.max(...allWeeks)}
                    className="hover:bg-purple-500/30 border-purple-400/50 text-purple-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {allWeeks.map(week => (
                  <Badge
                    key={week}
                    variant={selectedWeek === week ? 'default' : 'outline'}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 ${
                      selectedWeek === week 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                        : 'hover:bg-purple-500/30 text-purple-200 border-purple-400/50'
                    }`}
                    onClick={() => setSelectedWeek(week)}
                  >
                    الأسبوع {week}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="weekly-summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-purple-300/50">
              <TabsTrigger value="weekly-summary" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-purple-200">
                <TrendingUp className="h-4 w-4 mr-2" />
                ملخص الأسبوع
              </TabsTrigger>
              <TabsTrigger value="skill-shots" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-purple-200">
                <Target className="h-4 w-4 mr-2" />
                المهارات غير المستخدمة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly-summary" className="space-y-6 mt-6">
              {/* Weekly Averages */}
              {weeklyAverages ? (
                <Card className="border-2 border-purple-300/50 shadow-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-500/30 to-blue-500/30">
                    <CardTitle className="text-xl flex items-center gap-2 text-purple-100">
                      <TrendingUp className="h-6 w-6 text-purple-300" />
                      ملخص الأداء الأسبوعي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-6 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl border-2 border-purple-400/50 hover:shadow-lg transition-shadow">
                          <div className="text-3xl font-bold text-purple-200">{weeklyAverages.understanding}/10</div>
                          <div className="text-sm text-purple-300 mt-2">الفهم</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-600/40 to-blue-600/40 rounded-xl border-2 border-purple-500/50 hover:shadow-lg transition-shadow">
                          <div className="text-3xl font-bold text-purple-100">{weeklyAverages.codingSkills}/10</div>
                          <div className="text-sm text-purple-300 mt-2">مهارات البرمجة</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-700/50 to-blue-700/50 rounded-xl border-2 border-purple-600/50 hover:shadow-lg transition-shadow">
                          <div className="text-3xl font-bold text-purple-50">{weeklyAverages.problemSolving}/10</div>
                          <div className="text-sm text-purple-200 mt-2">حل المشكلات</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-800/60 to-blue-800/60 rounded-xl border-2 border-purple-700/50 hover:shadow-lg transition-shadow">
                          <div className="text-3xl font-bold text-white">{weeklyAverages.debugging}/10</div>
                          <div className="text-sm text-purple-100 mt-2">تصحيح الأخطاء</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-900/70 to-blue-900/70 rounded-xl border-2 border-purple-800/50 hover:shadow-lg transition-shadow">
                          <div className="text-3xl font-bold text-white">{weeklyAverages.communication}/10</div>
                          <div className="text-sm text-purple-100 mt-2">التواصل</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-indigo-900/80 to-blue-900/80 rounded-xl border-2 border-indigo-800/50 hover:shadow-lg transition-shadow">
                          <div className="text-3xl font-bold text-white">{weeklyAverages.codeQuality}/10</div>
                          <div className="text-sm text-purple-100 mt-2">جودة الكود</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-blue-900/90 to-indigo-900/90 rounded-xl border-2 border-blue-800/50 hover:shadow-lg transition-shadow">
                          <div className="text-3xl font-bold text-white">{weeklyAverages.attendance}/10</div>
                          <div className="text-sm text-purple-100 mt-2">الحضور</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-blue-950 to-indigo-950 rounded-xl border-2 border-blue-900/50 hover:shadow-lg transition-shadow">
                          <div className="text-3xl font-bold text-white">{weeklyAverages.overallProgress}%</div>
                          <div className="text-sm text-purple-100 mt-2">التقدم العام</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-purple-300/50 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                      <p className="text-purple-300 text-lg">
                        لا توجد تقارير للأسبوع {selectedWeek}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Five-Day Report */}
              <Card className="border-2 border-purple-300/50 shadow-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500/30 to-blue-500/30">
                  <CardTitle className="text-xl flex items-center gap-2 text-purple-100">
                    <FileText className="h-6 w-6 text-purple-300" />
                    التقرير اليومي (خمسة أيام)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyReports.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                      <p className="text-purple-300 text-lg">
                        لا توجد تقارير متاحة للأسبوع {selectedWeek}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {weeklyReports.map((report, index) => (
                        <div key={report.id} className="border-2 border-purple-400/50 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-500/30 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-300" />
                              </div>
                              <div>
                                <span className="font-bold text-lg text-purple-100">اليوم {report.day}</span>
                                <p className="text-sm text-purple-300">
                                  {new Date(report.date).toLocaleDateString('ar-EG')}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={report.overallProgress >= 80 ? 'default' : 'secondary'}
                              className={`px-4 py-2 text-sm ${
                                report.overallProgress >= 80 
                                  ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                                  : 'bg-gradient-to-r from-purple-500 to-blue-500'
                              }`}
                            >
                              {report.overallProgress}%
                            </Badge>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <span className="font-semibold text-sm text-purple-200">المواضيع:</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {report.topics.map(topic => (
                                  <Badge key={topic} variant="outline" className="bg-purple-500/30 border-purple-400/50 text-purple-200">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-semibold text-sm text-purple-200">المهام:</span>
                              <ul className="mt-2 space-y-2">
                                {report.tasks.map((task, idx) => (
                                  <li key={task.id} className="flex items-center gap-3 p-2 bg-purple-500/10 rounded-lg border border-purple-400/30">
                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full ${
                                      task.completed ? 'bg-purple-600 text-white' : 'bg-purple-400/50 text-purple-300'
                                    }`}>
                                      {task.completed ? '✓' : idx + 1}
                                    </span>
                                    <span className={task.completed ? 'line-through text-purple-400' : 'text-purple-200'}>
                                      {task.description}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-400/50">
                                <span className="font-semibold text-sm text-purple-200">نقاط القوة:</span>
                                <p className="text-sm text-purple-300 mt-1">{report.strengths}</p>
                              </div>
                              <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/50">
                                <span className="font-semibold text-sm text-blue-200">جوانب التحسين:</span>
                                <p className="text-sm text-blue-300 mt-1">{report.needsImprovement}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skill-shots" className="space-y-6 mt-6">
              <Card className="border-2 border-purple-300/50 shadow-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500/30 to-blue-500/30">
                  <CardTitle className="text-xl flex items-center gap-2 text-purple-100">
                    <Target className="h-6 w-6 text-purple-300" />
                    المهارات غير المستخدمة هذا الأسبوع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-400/50">
                      <p className="text-sm text-purple-200">
                        هذه المهارات لم يتم ممارستها خلال الأسبوع {selectedWeek}. يُنظر في دمجها في الجلسات القادمة.
                      </p>
                    </div>
                    
                    {skillShots.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-purple-500/30 rounded-full inline-block mb-4">
                          <Target className="h-16 w-16 text-purple-300" />
                        </div>
                        <p className="text-purple-200 font-bold text-xl mb-2">عمل رائع!</p>
                        <p className="text-purple-300">تم تغطية جميع المهارات هذا الأسبوع.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {skillShots.map(skill => (
                          <div
                            key={skill}
                            className="p-6 border-2 border-dashed border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl text-center hover:shadow-lg transition-shadow backdrop-blur-sm"
                          >
                            <Badge variant="outline" className="mb-3 bg-purple-500/30 border-purple-400/50 text-purple-200 px-4 py-2">
                              {skill}
                            </Badge>
                            <p className="text-xs text-purple-300 font-medium">لم يتم ممارستها</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {weeklyReports.length > 0 && (
                      <div className="p-6 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl border-2 border-purple-400/50 backdrop-blur-sm">
                        <h4 className="font-bold text-purple-200 mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-300" />
                          المهارات التي تم تغطيتها هذا الأسبوع:
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {Array.from(new Set(weeklyReports.flatMap(r => r.topics))).map(topic => (
                            <Badge key={topic} className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

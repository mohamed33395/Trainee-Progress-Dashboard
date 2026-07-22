import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Trainee, Topic, ReportTask, Evaluation, DailyReport } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { Plus, X, Save } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/components/ui/use-toast'

const topics: Topic[] = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Git', 'Tailwind CSS']

const evaluationCriteria = [
  { name: 'understanding', label: 'Understanding' },
  { name: 'codingSkills', label: 'Coding Skills' },
  { name: 'problemSolving', label: 'Problem Solving' },
  { name: 'debugging', label: 'Debugging' },
  { name: 'communication', label: 'Communication' },
  { name: 'codeQuality', label: 'Code Quality' },
  { name: 'attendance', label: 'Attendance' },
] as const

const reportSchema = z.object({
  traineeId: z.string().min(1, 'Trainee is required'),
  date: z.string().min(1, 'Date is required'),
  week: z.number().min(1, 'Week must be at least 1'),
  day: z.number().min(1).max(5, 'Day must be between 1 and 5'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  tasks: z.array(z.object({
    id: z.string(),
    description: z.string().min(1, 'Task description is required'),
    completed: z.boolean(),
  })).min(1, 'Add at least one task'),
  evaluation: z.object({
    understanding: z.number().min(1).max(10),
    codingSkills: z.number().min(1).max(10),
    problemSolving: z.number().min(1).max(10),
    debugging: z.number().min(1).max(10),
    communication: z.number().min(1).max(10),
    codeQuality: z.number().min(1).max(10),
    attendance: z.number().min(1).max(10),
  }),
  strengths: z.string().min(1, 'Strengths are required'),
  needsImprovement: z.string().min(1, 'Areas for improvement are required'),
  dailyNotes: z.string(),
  tomorrowPlan: z.string(),
})

type ReportFormData = z.infer<typeof reportSchema>

interface DailyReportFormProps {
  trainees: Trainee[]
  onSaveReport: (report: DailyReport) => void
}

export function DailyReportForm({ trainees, onSaveReport }: DailyReportFormProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([])
  const [tasks, setTasks] = useState<ReportTask[]>([
    { id: '1', description: '', completed: false },
  ])
  const [evaluation, setEvaluation] = useState<Evaluation>({
    understanding: 5,
    codingSkills: 5,
    problemSolving: 5,
    debugging: 5,
    communication: 5,
    codeQuality: 5,
    attendance: 10,
  })

  const { register, handleSubmit, setValue, formState: { errors }, control, reset } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      week: 1,
      day: 1,
      topics: [],
      tasks,
      evaluation,
      strengths: '',
      needsImprovement: '',
      dailyNotes: '',
      tomorrowPlan: '',
    },
  })

  const toggleTopic = (topic: Topic) => {
    const newTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic]
    setSelectedTopics(newTopics)
    setValue('topics', newTopics)
  }

  const addTask = () => {
    const newTask: ReportTask = {
      id: Date.now().toString(),
      description: '',
      completed: false,
    }
    const newTasks = [...tasks, newTask]
    setTasks(newTasks)
    setValue('tasks', newTasks)
  }

  const removeTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id)
    setTasks(newTasks)
    setValue('tasks', newTasks)
  }

  const updateTask = (id: string, field: keyof ReportTask, value: string | boolean) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, [field]: value } : t)
    setTasks(newTasks)
    setValue('tasks', newTasks)
  }

  const updateEvaluation = (field: keyof Evaluation, value: number) => {
    const newEvaluation = { ...evaluation, [field]: value }
    setEvaluation(newEvaluation)
    setValue('evaluation', newEvaluation)
  }

  const calculateOverallProgress = () => {
    const values = Object.values(evaluation)
    const sum = values.reduce((acc, val) => acc + val, 0)
    return Math.round((sum / (values.length * 10)) * 100)
  }

  const onSubmit = (data: ReportFormData) => {
    const report: DailyReport = {
      id: Date.now().toString(),
      traineeId: data.traineeId,
      date: data.date,
      week: data.week,
      day: data.day,
      topics: selectedTopics,
      tasks: tasks,
      evaluation: evaluation,
      strengths: data.strengths,
      needsImprovement: data.needsImprovement,
      dailyNotes: data.dailyNotes,
      tomorrowPlan: data.tomorrowPlan,
      overallProgress: calculateOverallProgress(),
      createdAt: new Date().toISOString(),
    }
    onSaveReport(report)
    
    // Show toast notification
    toast({
      title: t.common.save,
      description: "Report saved successfully",
    })
    
    // Reset form
    reset()
    setSelectedTopics([])
    setTasks([{ id: '1', description: '', completed: false } as ReportTask])
    setEvaluation({
      understanding: 5,
      codingSkills: 5,
      problemSolving: 5,
      debugging: 5,
      communication: 5,
      codeQuality: 5,
      attendance: 10,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.dailyReport.title}</h1>
        <p className="text-muted-foreground">
          {t.dailyReport.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dailyReport.generalInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="traineeId">{t.dailyReport.traineeName}</Label>
                <Controller
                  name="traineeId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.dailyReport.selectTrainee} />
                      </SelectTrigger>
                      <SelectContent>
                        {trainees.map(trainee => (
                          <SelectItem key={trainee.id} value={trainee.id}>
                            {trainee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.traineeId && (
                  <p className="text-sm text-destructive">{errors.traineeId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t.common.date}</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="week">{t.common.week}</Label>
                <Input
                  id="week"
                  type="number"
                  min="1"
                  {...register('week', { valueAsNumber: true })}
                />
                {errors.week && (
                  <p className="text-sm text-destructive">{errors.week.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="day">{t.common.day} (1-5, Friday & Saturday off)</Label>
                <Input
                  id="day"
                  type="number"
                  min="1"
                  max="5"
                  {...register('day', { valueAsNumber: true })}
                />
                {errors.day && (
                  <p className="text-sm text-destructive">{errors.day.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Topics */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dailyReport.topics}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => (
                <Badge
                  key={topic}
                  variant={selectedTopics.includes(topic) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleTopic(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>
            {errors.topics && (
              <p className="mt-2 text-sm text-destructive">{errors.topics.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dailyReport.tasks}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex gap-2 items-start">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => updateTask(task.id, 'completed', e.target.checked)}
                  className="mt-3 h-4 w-4"
                />
                <Input
                  value={task.description}
                  onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                  placeholder="Task description"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTask(task.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addTask}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.dailyReport.addTask}
            </Button>
            {errors.tasks && (
              <p className="text-sm text-destructive">{errors.tasks.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Performance Evaluation */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dailyReport.evaluation}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {evaluationCriteria.map(criterion => (
              <div key={criterion.name} className="space-y-2">
                <div className="flex justify-between">
                  <Label>{criterion.label}</Label>
                  <span className="text-sm font-medium">{evaluation[criterion.name]}/10</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateEvaluation(criterion.name, value)}
                      className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                        evaluation[criterion.name] >= value
                          ? 'bg-blue-600 text-white'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <Progress value={evaluation[criterion.name] * 10} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strengths & Needs Improvement */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.dailyReport.strengths}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the trainee's strengths..."
                {...register('strengths')}
                rows={4}
              />
              {errors.strengths && (
                <p className="mt-2 text-sm text-destructive">{errors.strengths.message}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.dailyReport.needsImprovement}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe areas that need improvement..."
                {...register('needsImprovement')}
                rows={4}
              />
              {errors.needsImprovement && (
                <p className="mt-2 text-sm text-destructive">{errors.needsImprovement.message}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dailyReport.dailyNotes}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional notes about today's session..."
              {...register('dailyNotes')}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Tomorrow Plan */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dailyReport.tomorrowPlan}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Outline the plan for tomorrow's session..."
              {...register('tomorrowPlan')}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dailyReport.overallProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <CircularProgress value={calculateOverallProgress()} size={150}>
                <div className="text-center">
                  <div className="text-3xl font-bold">{calculateOverallProgress()}%</div>
                  <div className="text-sm text-muted-foreground">Overall</div>
                </div>
              </CircularProgress>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Excellent (80-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Good (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Average (40-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">Needs Improvement (0-39%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {t.dailyReport.saveReport}
        </Button>
      </form>
    </div>
  )
}

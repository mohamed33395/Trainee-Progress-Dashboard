import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import { Task, TaskStatus, Trainee } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Upload, X, Eye, Trash2, Calendar, Download } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'

interface TasksProps {
  currentTraineeId?: string
}

export function Tasks({ currentTraineeId }: TasksProps) {
  const { t } = useLanguage()
  const { tasks, trainees, addTask, updateTask, deleteTask, users, updateTrainee } = useApp()
  const { user, isTrainee, isTeamLeader } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [taskImage, setTaskImage] = useState<string | null>(null)
  const [taskImageFile, setTaskImageFile] = useState<File | null>(null)
  
  // Determine the current trainee ID based on user role
  const effectiveTraineeId = currentTraineeId || (isTrainee() && user?.traineeId ? user.traineeId : undefined)
  
  // For trainees without traineeId, show all tasks (they can filter by trainee themselves)
  const showAllTasksForTrainee = isTrainee() && !user?.traineeId
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTraineeId: '',
    dueDate: '',
    skills: [] as string[],
    maxScore: 10,
  })

  // Submission state
  const [submissionData, setSubmissionData] = useState({
    codeSnippetImage: null as string | null,
    codeSnippetFile: null as File | null,
    projectImage: null as string | null,
    projectFile: null as File | null,
    details: '',
    instructorRating: 5,
  })

  const filteredTasks = effectiveTraineeId 
    ? tasks.filter(task => task.assignedTraineeId === effectiveTraineeId)
    : showAllTasksForTrainee 
      ? tasks 
      : tasks

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'task' | 'code' | 'project') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'task') {
          setTaskImageFile(file)
          setTaskImage(reader.result as string)
        } else if (type === 'code') {
          setSubmissionData(prev => ({
            ...prev,
            codeSnippetFile: file,
            codeSnippetImage: reader.result as string
          }))
        } else if (type === 'project') {
          setSubmissionData(prev => ({
            ...prev,
            projectFile: file,
            projectImage: reader.result as string
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (type: 'task' | 'code' | 'project') => {
    if (type === 'task') {
      setTaskImageFile(null)
      setTaskImage(null)
    } else if (type === 'code') {
      setSubmissionData(prev => ({
        ...prev,
        codeSnippetFile: null,
        codeSnippetImage: null
      }))
    } else if (type === 'project') {
      setSubmissionData(prev => ({
        ...prev,
        projectFile: null,
        projectImage: null
      }))
    }
  }

  const handleAddTask = () => {
    if (!formData.title || !formData.description || !formData.assignedTraineeId) {
      alert('Please fill in all required fields (title, description, and assignee)')
      return
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      imageUrl: taskImage || '',
      assignedTraineeId: formData.assignedTraineeId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: formData.dueDate || undefined,
      skills: formData.skills,
      maxScore: formData.maxScore,
    }

    addTask(newTask)
    setIsFormOpen(false)
    setFormData({ title: '', description: '', assignedTraineeId: '', dueDate: '', skills: [], maxScore: 10 })
    setTaskImage(null)
    setTaskImageFile(null)
  }

  const handleSubmitTask = () => {
    if (!selectedTask || !submissionData.codeSnippetImage || !submissionData.projectImage || !submissionData.details) {
      return
    }

    updateTask(selectedTask.id, {
      status: 'submitted',
      submission: {
        codeSnippetImage: submissionData.codeSnippetImage,
        projectImage: submissionData.projectImage,
        details: submissionData.details,
        instructorRating: submissionData.instructorRating,
        submittedAt: new Date().toISOString(),
      }
    })

    setIsSubmissionOpen(false)
    setSelectedTask(undefined)
    setSubmissionData({
      codeSnippetImage: null,
      codeSnippetFile: null,
      projectImage: null,
      projectFile: null,
      details: '',
      instructorRating: 5,
    })
  }

  const handleReviewTask = async (taskId: string, approved: boolean) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && task.submission) {
      await updateTask(taskId, {
        status: approved ? 'completed' : 'rejected',
        submission: {
          ...task.submission,
          reviewedAt: new Date().toISOString(),
          instructorFeedback: approved ? 'Great work!' : 'Please review and resubmit.',
        }
      })

      // If approved, update trainee skills progress
      if (approved && task.skills && task.maxScore) {
        const trainee = trainees.find(t => t.id === task.assignedTraineeId)
        if (trainee) {
          const scorePercentage = (task.submission.instructorRating / task.maxScore) * 100
          const updatedSkillsProgress = { ...trainee.skillsProgress }

          task.skills.forEach(skill => {
            const currentProgress = updatedSkillsProgress[skill] || 0
            // Add the score percentage to the skill progress (capped at 100)
            updatedSkillsProgress[skill] = Math.min(100, currentProgress + scorePercentage * 0.1)
          })

          // Update trainee skills progress through context
          await updateTrainee(trainee.id, { skillsProgress: updatedSkillsProgress })
        }
      }
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
    }
  }

  const handleDownloadPDF = async (task: Task) => {
    if (!task.submission) return

    const pdf = new jsPDF()
    const trainee = trainees.find(t => t.id === task.assignedTraineeId)
    
    // Get instructor name from teachers list using assignedCoach ID
    let instructorName = 'Team Leader'
    if (trainee?.assignedCoach) {
      const { teachers } = useApp()
      const instructor = teachers.find(t => t.id === trainee.assignedCoach)
      if (instructor) {
        instructorName = instructor.name
      }
    }
    
    // Add company logo (placeholder - you can replace with actual logo)
    pdf.setFontSize(20)
    pdf.text('Trainee Progress Dashboard', 105, 20, { align: 'center' })
    
    // Add title
    pdf.setFontSize(16)
    pdf.text(`Task: ${task.title}`, 20, 40)
    
    // Add trainee information
    pdf.setFontSize(12)
    pdf.text(`Trainee: ${trainee?.name || 'Unknown'}`, 20, 55)
    pdf.text(`Instructor: ${instructorName}`, 20, 65)
    pdf.text(`Date: ${new Date(task.submission.submittedAt).toLocaleDateString()}`, 20, 75)
    
    // Add task description
    pdf.text('Description:', 20, 90)
    const descriptionLines = pdf.splitTextToSize(task.description, 170)
    pdf.text(descriptionLines, 20, 100)
    
    let yPos = 100 + (descriptionLines.length * 7) + 10
    
    // Add trainee photo first if available
    if (trainee?.avatar) {
      try {
        pdf.text('Trainee Photo:', 20, yPos)
        yPos += 10
        pdf.addImage(trainee.avatar, 'JPEG', 20, yPos, 40, 40)
        yPos += 50
      } catch (error) {
        console.error('Error adding trainee photo to PDF:', error)
        // Continue without the photo if there's an error
      }
    }
    
    // Add task image if available
    if (task.imageUrl) {
      try {
        pdf.text('Task Image:', 20, yPos)
        yPos += 10
        pdf.addImage(task.imageUrl, 'JPEG', 20, yPos, 80, 60)
        yPos += 70
      } catch (error) {
        console.error('Error adding task image to PDF:', error)
      }
    }
    
    // Add submission details
    yPos += 10
    pdf.text('Submission Details:', 20, yPos)
    yPos += 10
    pdf.text(`Rating: ${task.submission.instructorRating}/10`, 20, yPos)
    yPos += 10
    
    // Add submission details text
    pdf.text('Details:', 20, yPos)
    yPos += 10
    const detailsLines = pdf.splitTextToSize(task.submission.details, 170)
    pdf.text(detailsLines, 20, yPos)
    yPos += (detailsLines.length * 7) + 10
    
    // Add instructor feedback if available
    if (task.submission.instructorFeedback) {
      pdf.text('Instructor Feedback:', 20, yPos)
      yPos += 10
      const feedbackLines = pdf.splitTextToSize(task.submission.instructorFeedback, 170)
      pdf.text(feedbackLines, 20, yPos)
      yPos += (feedbackLines.length * 7) + 10
    }
    
    // Add submission images
    yPos += 50
    if (yPos > 200) {
      pdf.addPage()
      yPos = 20
    }
    
    pdf.text('Code Snippet Image:', 20, yPos)
    yPos += 10
    try {
      pdf.addImage(task.submission.codeSnippetImage, 'JPEG', 20, yPos, 80, 60)
    } catch (error) {
      console.error('Error adding code snippet image to PDF:', error)
    }
    
    yPos += 70
    if (yPos > 200) {
      pdf.addPage()
      yPos = 20
    }
    
    pdf.text('Project Image:', 20, yPos)
    yPos += 10
    try {
      pdf.addImage(task.submission.projectImage, 'JPEG', 20, yPos, 80, 60)
    } catch (error) {
      console.error('Error adding project image to PDF:', error)
    }
    
    // Save the PDF
    pdf.save(`task-${task.title.replace(/\s+/g, '-')}.pdf`)
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'submitted': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTraineeName = (traineeId: string) => {
    const trainee = trainees.find(t => t.id === traineeId)
    return trainee?.name || 'Unknown'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.tasks.title}</h1>
          <p className="text-muted-foreground">{t.tasks.subtitle}</p>
        </div>
        {!effectiveTraineeId && isTeamLeader() && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.tasks.addTask}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.tasks.allTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.tasks.noTasks}</p>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={task.imageUrl}
                        alt={task.title}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        {!effectiveTraineeId && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Assigned to: {getTraineeName(task.assignedTraineeId)}
                          </p>
                        )}
                      </div>
                    </div>
                  <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(task.status)}`} />
                        {t.tasks[task.status as keyof typeof t.tasks] || task.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task)
                          setIsDetailOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{t.tasks.dueDate}: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {task.status === 'pending' && (effectiveTraineeId || showAllTasksForTrainee || isTeamLeader()) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task)
                        setIsSubmissionOpen(true)
                      }}
                    >
                      {t.tasks.submitTask}
                    </Button>
                  )}

                  {task.status === 'submitted' && !effectiveTraineeId && isTeamLeader() && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReviewTask(task.id, true)}
                      >
                        {t.tasks.approve}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReviewTask(task.id, false)}
                      >
                        {t.tasks.reject}
                      </Button>
                    </div>
                  )}

                  {task.submission && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">{t.tasks.submissionDetails}</h4>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={task.submission.codeSnippetImage}
                            alt="Code Snippet"
                            className="h-24 w-full rounded object-cover"
                          />
                          <p className="text-xs text-muted-foreground mt-1">{t.tasks.codeSnippetImage}</p>
                        </div>
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={task.submission.projectImage}
                            alt="Project"
                            className="h-24 w-full rounded object-cover"
                          />
                          <p className="text-xs text-muted-foreground mt-1">{t.tasks.projectImage}</p>
                        </div>
                      </div>
                      <p className="text-sm mb-2">
                        <span className="font-medium">{t.tasks.taskDetails}:</span> {task.submission.details}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">{t.tasks.instructorRating}:</span> {task.submission.instructorRating}/10
                      </p>
                      {task.submission.instructorFeedback && (
                        <p className="text-sm">
                          <span className="font-medium">{t.tasks.instructorFeedback}:</span> {task.submission.instructorFeedback}
                        </p>
                      )}
                    </div>
                  )}

                  {!effectiveTraineeId && isTeamLeader() && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t.common.delete}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.tasks.addTask}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t.tasks.taskTitle}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.tasks.taskDescription}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainee">{t.tasks.assignTo}</Label>
              <Select
                value={formData.assignedTraineeId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTraineeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.tasks.selectTrainee} />
                </SelectTrigger>
                <SelectContent>
                  {trainees.map(trainee => (
                    <SelectItem key={trainee.id} value={trainee.id}>
                      {trainee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">{t.tasks.dueDate}</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">{t.tasks.maxScore}</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                max="100"
                value={formData.maxScore}
                onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.tasks.skills}</Label>
              <div className="flex flex-wrap gap-2">
                {['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Git', 'Tailwind CSS'].map(skill => (
                  <Button
                    key={skill}
                    type="button"
                    variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        skills: prev.skills.includes(skill)
                          ? prev.skills.filter(s => s !== skill)
                          : [...prev.skills, skill]
                      }))
                    }}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.tasks.taskImage}</Label>
              <div className="flex items-center gap-4">
                {taskImage ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={taskImage}
                      alt="Task preview"
                      className="h-20 w-20 rounded-lg object-cover border-2 border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveImage('task')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'task')}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleAddTask}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedTask.title}</h3>
                  <p className="text-muted-foreground mt-2">{selectedTask.description}</p>
                </div>
                
                {selectedTask.imageUrl && (
                  <div>
                    <Label className="text-base font-medium">Task Image</Label>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedTask.imageUrl}
                      alt={selectedTask.title}
                      className="mt-2 rounded-lg w-full max-h-96 object-cover"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p className="font-medium">{selectedTask.status}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Due Date</Label>
                    <p className="font-medium">
                      {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Assigned To</Label>
                    <p className="font-medium">{getTraineeName(selectedTask.assignedTraineeId)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Max Score</Label>
                    <p className="font-medium">{selectedTask.maxScore || 10}</p>
                  </div>
                </div>
                
                {selectedTask.skills && selectedTask.skills.length > 0 && (
                  <div>
                    <Label className="text-base font-medium">Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTask.skills.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedTask.submission && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-lg font-semibold">Submission Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Code Snippet</Label>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedTask.submission.codeSnippetImage}
                        alt="Code Snippet"
                        className="mt-2 rounded-lg w-full h-48 object-cover"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Project</Label>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedTask.submission.projectImage}
                        alt="Project"
                        className="mt-2 rounded-lg w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Details</Label>
                    <p className="mt-2">{selectedTask.submission.details}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Rating</Label>
                      <p className="font-medium">{selectedTask.submission.instructorRating}/10</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Submitted At</Label>
                      <p className="font-medium">
                        {new Date(selectedTask.submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedTask.submission.instructorFeedback && (
                    <div>
                      <Label className="text-muted-foreground">Instructor Feedback</Label>
                      <p className="mt-2">{selectedTask.submission.instructorFeedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              {t.common.close}
            </Button>
            {selectedTask?.submission && (
              <Button onClick={() => handleDownloadPDF(selectedTask)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Task Dialog */}
      <Dialog open={isSubmissionOpen} onOpenChange={setIsSubmissionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.tasks.submitTask}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.tasks.codeSnippetImage}</Label>
              <div className="flex items-center gap-4">
                {submissionData.codeSnippetImage ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={submissionData.codeSnippetImage}
                      alt="Code snippet preview"
                      className="h-20 w-20 rounded-lg object-cover border-2 border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveImage('code')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'code')}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.tasks.projectImage}</Label>
              <div className="flex items-center gap-4">
                {submissionData.projectImage ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={submissionData.projectImage}
                      alt="Project preview"
                      className="h-20 w-20 rounded-lg object-cover border-2 border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveImage('project')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'project')}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">{t.tasks.taskDetails}</Label>
              <Textarea
                id="details"
                value={submissionData.details}
                onChange={(e) => setSubmissionData(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Describe your task completion..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">{t.tasks.instructorRating}</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="10"
                value={submissionData.instructorRating}
                onChange={(e) => setSubmissionData(prev => ({ ...prev, instructorRating: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmissionOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmitTask}>
              {t.tasks.submitTask}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

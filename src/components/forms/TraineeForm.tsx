import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Trainee, TraineeStatus, Topic, Teacher } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, X } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const traineeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  status: z.enum(['active', 'completed', 'on-hold', 'dropped']),
  startDate: z.string().min(1, 'Start date is required'),
  currentWeek: z.number().min(1, 'Week must be at least 1'),
  languageLevel: z.string().optional(),
  age: z.number().optional(),
  origin: z.string().optional(),
})

type TraineeFormData = z.infer<typeof traineeSchema>

interface TraineeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Trainee) => void
  trainee?: Trainee
  teachers?: Teacher[]
}

const topics: Topic[] = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Git', 'Tailwind CSS']

export function TraineeForm({ isOpen, onClose, onSubmit, trainee, teachers = [] }: TraineeFormProps) {
  const { t } = useLanguage()
  const [selectedSkills, setSelectedSkills] = useState<Record<string, number>>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(trainee?.avatar || null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<string>(trainee?.assignedCoach || '')
  const isEditing = !!trainee

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TraineeFormData>({
    resolver: zodResolver(traineeSchema),
    defaultValues: {
      name: trainee?.name || '',
      email: trainee?.email || '',
      status: trainee?.status || 'active',
      startDate: trainee?.startDate || new Date().toISOString().split('T')[0],
      currentWeek: trainee?.currentWeek || 1,
      age: trainee?.age || undefined,
      origin: trainee?.origin || '',
    },
  })

  useEffect(() => {
    if (trainee) {
      setSelectedSkills(trainee.skillsProgress)
      setSelectedTeacher(trainee.assignedCoach || '')
    }
  }, [trainee])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const updateSkill = (skill: string, value: number) => {
    setSelectedSkills(prev => ({ ...prev, [skill]: value }))
  }

  const onFormSubmit = (data: TraineeFormData) => {
    const traineeData: Trainee = {
      id: trainee?.id || Date.now().toString(),
      name: data.name,
      email: data.email,
      avatar: photoPreview || trainee?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(/\s/g, '')}`,
      status: data.status,
      startDate: data.startDate,
      currentWeek: data.currentWeek,
      progress: trainee?.progress || 0,
      reports: trainee?.reports || [],
      skillsProgress: selectedSkills,
      assignedCoach: selectedTeacher,
      languageLevel: (data.languageLevel || 'Intermediate') as 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced' | 'Proficient',
      age: data.age,
      origin: data.origin,
    }
    onSubmit(traineeData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Trainee' : 'Add Trainee'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo">{t.traineeForm.photo}</Label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemovePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select {...register('status')} onValueChange={(value) => setValue('status', value as TraineeStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="100"
                {...register('age', { valueAsNumber: true })}
                placeholder="25"
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentWeek">Current Week</Label>
              <Input
                id="currentWeek"
                type="number"
                min="1"
                {...register('currentWeek', { valueAsNumber: true })}
              />
              {errors.currentWeek && (
                <p className="text-sm text-destructive">{errors.currentWeek.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="origin">Country/Origin</Label>
              <Input
                id="origin"
                {...register('origin')}
                placeholder="Egypt||soudi arabia"
              />
              {errors.origin && (
                <p className="text-sm text-destructive">{errors.origin.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">{t.traineeForm.assignedTeacher}</Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder={t.traineeForm.selectTeacher} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t.traineeForm.noTeacherAssigned}</SelectItem>
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <div className="flex items-center gap-2">
                      <img
                        src={teacher.avatar}
                        alt={teacher.name}
                        className="h-4 w-4 rounded-full"
                      />
                      {teacher.name} - {teacher.subject}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Skills Progress</Label>
            <div className="grid gap-4 md:grid-cols-2">
              {topics.map(topic => (
                <div key={topic} className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor={topic}>{topic}</Label>
                    <span className="text-sm font-medium">{selectedSkills[topic] || 0}%</span>
                  </div>
                  <input
                    id={topic}
                    type="range"
                    min="0"
                    max="100"
                    value={selectedSkills[topic] || 0}
                    onChange={(e) => updateSkill(topic, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Add'} Trainee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

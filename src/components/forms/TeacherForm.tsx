import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Teacher, TeacherStatus, Subject, Trainee } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, X, Users } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const teacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.enum(['Web Development', 'Frontend Development', 'Backend Development', 'Full Stack Development', 'Mobile Development', 'Data Science', 'DevOps', 'UI/UX Design', 'Project Management', 'Other']),
  experience: z.number().min(0, 'Experience must be at least 0').max(50, 'Experience cannot exceed 50 years'),
  status: z.enum(['active', 'inactive', 'on-leave']),
  startDate: z.string().min(1, 'Start date is required'),
})

type TeacherFormData = z.infer<typeof teacherSchema>

interface TeacherFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Teacher) => void
  teacher?: Teacher
  trainees?: Trainee[]
}

const subjects: Subject[] = [
  'Web Development',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Mobile Development',
  'Data Science',
  'DevOps',
  'UI/UX Design',
  'Project Management',
  'Other',
]

export function TeacherForm({ isOpen, onClose, onSubmit, teacher, trainees = [] }: TeacherFormProps) {
  const { t } = useLanguage()
  const isEditing = !!teacher
  const [photoPreview, setPhotoPreview] = useState<string | null>(teacher?.avatar || null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>(teacher?.assignedTrainees || [])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: teacher?.name || '',
      email: teacher?.email || '',
      subject: teacher?.subject || 'Web Development',
      experience: teacher?.experience || 0,
      status: teacher?.status || 'active',
      startDate: teacher?.startDate || new Date().toISOString().split('T')[0],
    },
  })

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

  useEffect(() => {
    if (teacher) {
      setSelectedTrainees(teacher.assignedTrainees)
    }
  }, [teacher])

  const onFormSubmit = (data: TeacherFormData) => {
    const teacherData: Teacher = {
      id: teacher?.id || Date.now().toString(),
      name: data.name,
      email: data.email,
      avatar: photoPreview || teacher?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(/\s/g, '')}`,
      subject: data.subject,
      experience: data.experience,
      status: data.status,
      startDate: data.startDate,
      assignedTrainees: selectedTrainees,
    }
    onSubmit(teacherData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo">{t.teacherForm.photo}</Label>
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

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Dr. John Doe"
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
            <Label htmlFor="subject">Subject</Label>
            <Select {...register('subject')} onValueChange={(value) => setValue('subject', value as Subject)}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              max="50"
              {...register('experience', { valueAsNumber: true })}
            />
            {errors.experience && (
              <p className="text-sm text-destructive">{errors.experience.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select {...register('status')} onValueChange={(value) => setValue('status', value as TeacherStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
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

          <div className="space-y-2">
            <Label>{t.teacherForm.assignedTrainees}</Label>
            {trainees.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.teacherForm.noTraineesAvailable}</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {trainees.map(trainee => (
                  <div key={trainee.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`trainee-${trainee.id}`}
                      checked={selectedTrainees.includes(trainee.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTrainees([...selectedTrainees, trainee.id])
                        } else {
                          setSelectedTrainees(selectedTrainees.filter(id => id !== trainee.id))
                        }
                      }}
                    />
                    <Label
                      htmlFor={`trainee-${trainee.id}`}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={trainee.avatar}
                          alt={trainee.name}
                          className="h-5 w-5 rounded-full"
                        />
                        {trainee.name}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {selectedTrainees.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{selectedTrainees.length} {t.teacherForm.traineesSelected}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Add'} Teacher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'
import { Teacher, TeacherStatus } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, MoreVertical, Eye, Edit, Trash2, Plus, Users } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Filters } from '@/components/ui/Filters'
import { TeacherForm } from '@/components/forms/TeacherForm'
import { useLanguage } from '@/context/LanguageContext'

interface TeachersProps {
  teachers: Teacher[]
  trainees: any[]
  onTeacherDelete: (id: string) => void
  onTeacherAdd: (teacher: Teacher) => void
  onTeacherUpdate: (id: string, updates: Partial<Teacher>) => void
}

const statusColors: Record<TeacherStatus, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  'on-leave': 'bg-yellow-500',
}

export function Teachers({ teachers, trainees, onTeacherDelete, onTeacherAdd, onTeacherUpdate }: TeachersProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>()

  const statusOptions = [
    { value: 'active', label: t.common.active },
    { value: 'inactive', label: t.common.inactive },
    { value: 'on-leave', label: t.common.onLeave },
  ]

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilters.length === 0 || selectedFilters.includes(teacher.status)
    return matchesSearch && matchesFilter
  })

  const handleDelete = (id: string) => {
    if (confirm(t.teachers.deleteConfirm)) {
      onTeacherDelete(id)
    }
  }

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setIsFormOpen(true)
  }

  const handleFormSubmit = (teacher: Teacher) => {
    if (editingTeacher) {
      onTeacherUpdate(teacher.id, teacher)
    } else {
      onTeacherAdd(teacher)
    }
    setEditingTeacher(undefined)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTeacher(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.teachers.title}</h1>
          <p className="text-muted-foreground">
            {t.teachers.subtitle}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.teachers.addTeacher}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>{t.teachers.allTeachers}</CardTitle>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t.common.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <Filters
            options={statusOptions}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.common.name}</TableHead>
                <TableHead>{t.teachers.subject}</TableHead>
                <TableHead>{t.teachers.experience}</TableHead>
                <TableHead>{t.teachers.assignedTrainees}</TableHead>
                <TableHead>{t.common.status}</TableHead>
                <TableHead>{t.trainees.startDate}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t.teachers.noTeachers}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={teacher.avatar}
                          alt={teacher.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-sm text-muted-foreground">{teacher.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.subject}</TableCell>
                    <TableCell>{teacher.experience} {t.teachers.years}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{trainees.filter(t => t.assignedCoach === teacher.id).length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${statusColors[teacher.status]}`} />
                        {teacher.status === 'active' ? t.common.active : 
                         teacher.status === 'inactive' ? t.common.inactive : 
                         teacher.status === 'on-leave' ? t.common.onLeave : 
                         teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1).replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(teacher.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            {t.common.view}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(teacher.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TeacherForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        teacher={editingTeacher}
        trainees={trainees}
      />
    </div>
  )
}

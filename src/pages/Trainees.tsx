import { useState } from 'react'
import Link from 'next/link'
import { Trainee, TraineeStatus, Teacher } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, MoreVertical, Eye, Edit, Trash2, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Filters } from '@/components/ui/Filters'
import { TraineeForm } from '@/components/forms/TraineeForm'
import { useLanguage } from '@/context/LanguageContext'

interface TraineesProps {
  trainees: Trainee[]
  teachers: Teacher[]
  onTraineeDelete: (id: string) => void
  onTraineeAdd: (trainee: Trainee) => void
  onTraineeUpdate: (id: string, updates: Partial<Trainee>) => void
}

const statusColors: Record<TraineeStatus, string> = {
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  'on-hold': 'bg-yellow-500',
  dropped: 'bg-red-500',
}

export function Trainees({ trainees, teachers, onTraineeDelete, onTraineeAdd, onTraineeUpdate }: TraineesProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTrainee, setEditingTrainee] = useState<Trainee | undefined>()

  const statusOptions = [
    { value: 'active', label: t.common.active },
    { value: 'completed', label: t.common.completed },
    { value: 'on-hold', label: t.common.onHold },
    { value: 'dropped', label: t.common.dropped },
  ]

  const filteredTrainees = trainees.filter(trainee => {
    const matchesSearch = trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trainee.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilters.length === 0 || selectedFilters.includes(trainee.status)
    return matchesSearch && matchesFilter
  })

  const handleDelete = (id: string) => {
    if (confirm(t.trainees.deleteConfirm)) {
      onTraineeDelete(id)
    }
  }

  const handleEdit = (trainee: Trainee) => {
    setEditingTrainee(trainee)
    setIsFormOpen(true)
  }

  const handleFormSubmit = (trainee: Trainee) => {
    if (editingTrainee) {
      onTraineeUpdate(trainee.id, trainee)
    } else {
      onTraineeAdd(trainee)
    }
    setEditingTrainee(undefined)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTrainee(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.trainees.title}</h1>
          <p className="text-muted-foreground">
            {t.trainees.subtitle}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.trainees.addTrainee}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>{t.trainees.allTrainees}</CardTitle>
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
                <TableHead>{t.trainees.currentWeek}</TableHead>
                <TableHead>{t.common.progress}</TableHead>
                <TableHead>{t.common.status}</TableHead>
                <TableHead>{t.trainees.startDate}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {t.trainees.noTrainees}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={trainee.avatar}
                          alt={trainee.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{trainee.name}</div>
                          <div className="text-sm text-muted-foreground">{trainee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{t.common.week} {trainee.currentWeek}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${trainee.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{trainee.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${statusColors[trainee.status]}`} />
                        {trainee.status.charAt(0).toUpperCase() + trainee.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(trainee.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/student-details/${trainee.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t.common.view}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(trainee)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(trainee.id)}
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

      <TraineeForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        trainee={editingTrainee}
        teachers={teachers}
      />
    </div>
  )
}

"use client"
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/context/LanguageContext'
import { User, Mail, Calendar, Award, Target } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { trainees } = useApp()
  const { t } = useLanguage()

  // Get trainee data if user is a trainee
  const trainee = user?.role === 'trainee' && user?.traineeId 
    ? trainees.find(t => t.id === user.traineeId)
    : null

  if (!user || user.role !== 'trainee') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.common.profile}</h1>
        <p className="text-muted-foreground">Your personal information and progress</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700">
                <User className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="font-medium">{trainee?.name || user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{user.email}</span>
              </div>
              
              {trainee?.startDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{new Date(trainee.startDate).toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Language Level:</span>
                <span>{trainee?.languageLevel || 'Beginner'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Week:</span>
                <span className="font-medium">Week {trainee?.currentWeek || 1}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress:</span>
                <span className="font-medium">{trainee?.progress || 0}%</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${
                  trainee?.status === 'active' ? 'text-green-600' :
                  trainee?.status === 'inactive' ? 'text-gray-600' :
                  trainee?.status === 'completed' ? 'text-blue-600' :
                  'text-orange-600'
                }`}>
                  {trainee?.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{trainee?.progress || 0}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${trainee?.progress || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Progress */}
        {trainee?.skillsProgress && Object.keys(trainee.skillsProgress).length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(trainee.skillsProgress).map(([skill, progress]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{skill}</span>
                      <span className="font-medium">{progress as number}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 transition-all duration-300"
                        style={{ width: `${progress as number}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

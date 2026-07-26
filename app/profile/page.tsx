"use client"

import { useEffect, useMemo, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/context/LanguageContext'
import { firestoreStorageService } from '@/services/firestoreStorage'
import { Award, Mail, Target, Upload, User } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { trainees, teachers, updateUser } = useApp()
  const { t } = useLanguage()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isSavingImage, setIsSavingImage] = useState(false)
  const [profile, setProfile] = useState({ name: '', email: '' })

  const trainee = useMemo(() => {
    if (user?.role !== 'trainee' || !user?.traineeId) return null
    return trainees.find(trainee => trainee.id === user.traineeId) || null
  }, [trainees, user?.role, user?.traineeId])

  const teacher = useMemo(() => {
    if (user?.role !== 'teacher') return null
    return teachers.find(teacher => teacher.email === user.email || teacher.name === user.username) || null
  }, [teachers, user?.role, user?.email, user?.username])

  useEffect(() => {
    if (!user) return

    const displayName = trainee?.name || teacher?.name || user.username
    const displayEmail = trainee?.email || teacher?.email || user.email

    setProfile({ name: displayName, email: displayEmail })
  }, [user, trainee, teacher])

  useEffect(() => {
    const loadProfileImage = async () => {
      if (!user?.id) return

      try {
        const savedImage = await firestoreStorageService.getProfileImage(user.id)
        setProfileImage(savedImage)
      } catch (error) {
        console.error('Error loading profile image:', error)
      }
    }

    loadProfileImage()
  }, [user?.id])

  const roleLabel = useMemo(() => {
    if (!user) return ''

    switch (user.role) {
      case 'admin':
        return t.common.admin
      case 'team_leader':
        return t.common.teamLeader
      case 'teacher':
        return t.common.teacher
      case 'trainee':
        return t.common.trainee
      default:
        return user.role
    }
  }, [t, user])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    const reader = new FileReader()
    reader.onload = async () => {
      const imageData = reader.result as string
      setProfileImage(imageData)
      setIsSavingImage(true)

      try {
        await firestoreStorageService.saveProfileImage(user.id, imageData)
      } catch (error) {
        console.error('Error saving profile image:', error)
        alert('Failed to save profile image. Please try again.')
      } finally {
        setIsSavingImage(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = () => {
    if (!user?.id) return

    updateUser(user.id, {
      username: profile.name,
      email: profile.email,
    })

    alert('Profile saved successfully!')
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col mr-72">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-muted-foreground">Access denied</p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-72">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t.common.profile}</h1>
              <p className="text-muted-foreground">Manage your profile information and account details</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t.common.profile}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="h-32 w-32 rounded-full bg-pink-500 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 text-white" />
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-lg font-semibold">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {user.id?.slice(0, 8)}</p>
                    <p className="text-sm font-medium text-pink-500">{roleLabel}</p>
                  </div>

                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg text-white text-sm font-medium transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>{isSavingImage ? 'Saving...' : 'Change Image'}</span>
                    </div>
                  </label>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.common.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                    />
                  </div>
                  <Button onClick={handleSaveProfile}>{t.common.save}</Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium">{roleLabel}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {trainee ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Training Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Week:</span>
                      <span className="font-medium">Week {trainee.currentWeek}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Language Level:</span>
                      <span className="font-medium">{trainee.languageLevel}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium capitalize">{trainee.status}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{trainee.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${trainee.progress}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Role Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Access Level:</span>
                      <span className="font-medium">{roleLabel}</span>
                    </div>
                    {teacher && (
                      <>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Subject:</span>
                          <span className="font-medium">{teacher.subject}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="font-medium">{teacher.experience} years</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">Active</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {trainee?.skillsProgress && Object.keys(trainee.skillsProgress).length > 0 && (
              <Card>
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
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

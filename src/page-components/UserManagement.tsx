import { useState, useEffect } from 'react'
import { User, UserRole } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, User as UserIcon, Edit, Cloud } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { storageService } from '@/services/storage'

export function UserManagement() {
  const { t } = useLanguage()
  const { users, trainees, addUser, deleteUser, updateUser, addTrainee } = useApp()
  const { isAdmin, isTeamLeader, useFirestore, toggleStorage } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showNewTraineeForm, setShowNewTraineeForm] = useState(false)
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false)
  
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  })
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'trainee' as UserRole,
    traineeId: '',
  })
  
  const [newTraineeData, setNewTraineeData] = useState({
    name: '',
    email: '',
  })

  const filteredUsers = isAdmin() || isTeamLeader() 
    ? users 
    : users.filter(u => u.role === 'trainee')

  // Filter trainees to only show those that actually exist
  const validTrainees = trainees.filter(trainee => {
    // Check if trainee has valid data
    return trainee.name && trainee.email && trainee.id
  })

  const handleAddUser = () => {
    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.role === 'trainee' && !formData.traineeId) {
      alert('Please select a trainee for this user account')
      return
    }

    // Check if username already exists
    const existingUser = users.find(u => u.username === formData.username)
    if (existingUser) {
      alert('Username already exists')
      return
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      traineeId: formData.role === 'trainee' ? formData.traineeId : undefined,
      createdAt: new Date().toISOString(),
    }

    addUser(newUser)
    setIsFormOpen(false)
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'trainee',
      traineeId: '',
    })
    alert('User created successfully!')
  }

  const handleCreateNewTrainee = async () => {
    if (!newTraineeData.name || !newTraineeData.email) {
      return
    }

    const newTrainee = {
      id: Date.now().toString(),
      name: newTraineeData.name,
      email: newTraineeData.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newTraineeData.name}`,
      currentWeek: 1,
      progress: 0,
      status: 'active' as const,
      startDate: new Date().toISOString(),
      reports: [],
      skillsProgress: {},
      languageLevel: 'Beginner' as const,
    }

    await addTrainee(newTrainee)
    setFormData(prev => ({ ...prev, traineeId: newTrainee.id }))
    setShowNewTraineeForm(false)
    setNewTraineeData({ name: '', email: '' })
  }

  const handleDisableFirebase = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('firebase_configured', 'false')
      alert('Firebase disabled! The app will now reload to use localStorage.')
      window.location.reload()
    }
  }

  const handleSaveFirebaseConfig = () => {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
      alert('Please fill in at least API Key, Project ID, and App ID')
      return
    }

    // Save config to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('firebase_config', JSON.stringify(firebaseConfig))
      localStorage.setItem('firebase_configured', 'true')
      
      alert('Firebase configuration saved! The app will now reload to use Firestore.')
      setIsFirebaseConfigOpen(false)
    }
    toggleStorage()
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      traineeId: user.traineeId || '',
    })
    setIsEditFormOpen(true)
  }

  const handleUpdateUser = () => {
    if (!selectedUser || !formData.username || !formData.email) {
      return
    }

    if (formData.role === 'trainee' && !formData.traineeId) {
      return
    }

    const updates: Partial<User> = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
      traineeId: formData.role === 'trainee' ? formData.traineeId : undefined,
    }

    if (formData.password) {
      updates.password = formData.password
    }

    updateUser(selectedUser.id, updates)
    setIsEditFormOpen(false)
    setSelectedUser(null)
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'trainee',
      traineeId: '',
    })
  }

  const getTraineeName = (traineeId?: string) => {
    if (!traineeId) return '-'
    const trainee = trainees.find(t => t.id === traineeId)
    return trainee?.name || 'Unknown'
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-500'
      case 'team_leader': return 'bg-blue-500'
      case 'trainee': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.userManagement.title}</h1>
          <p className="text-muted-foreground">{t.userManagement.subtitle}</p>
        </div>
        <div className="flex gap-2">
          {(isAdmin() || isTeamLeader()) && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.userManagement.addUser}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.userManagement.allUsers}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.userManagement.noUsers}</p>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700">
                      <UserIcon className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.username}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getRoleBadgeColor(user.role)}`}>
                          {user.role === 'admin' ? t.userManagement.admin : user.role === 'team_leader' ? t.userManagement.teamLeader : t.userManagement.trainee}
                        </span>
                        {user.traineeId && (
                          <span className="text-xs text-muted-foreground">
                            {t.userManagement.assignToTrainee}: {getTraineeName(user.traineeId)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {(isAdmin() || isTeamLeader()) && user.role !== 'admin' && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.userManagement.addUser}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t.userManagement.username}</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder={t.userManagement.username}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.userManagement.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder={t.userManagement.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.userManagement.password}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={t.userManagement.password}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t.userManagement.role}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.userManagement.role} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trainee">{t.userManagement.trainee}</SelectItem>
                  {isAdmin() && <SelectItem value="teacher">{t.common.teacher}</SelectItem>}
                  {isAdmin() && <SelectItem value="team_leader">{t.userManagement.teamLeader}</SelectItem>}
                  {isAdmin() && <SelectItem value="admin">{t.userManagement.admin}</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'trainee' && (
              <div className="space-y-2">
                <Label htmlFor="trainee">Assign to Trainee</Label>
                {!showNewTraineeForm ? (
                  <div className="space-y-2">
                    <Select
                      value={formData.traineeId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, traineeId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.common.select} />
                      </SelectTrigger>
                      <SelectContent>
                        {validTrainees.map(trainee => (
                          <SelectItem key={trainee.id} value={trainee.id}>
                            {trainee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewTraineeForm(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t.userManagement.createNewTrainee}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="new-trainee-name">{t.userManagement.traineeName}</Label>
                      <Input
                        id="new-trainee-name"
                        value={newTraineeData.name}
                        onChange={(e) => setNewTraineeData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t.userManagement.traineeName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-trainee-email">{t.userManagement.traineeEmail}</Label>
                      <Input
                        id="new-trainee-email"
                        type="email"
                        value={newTraineeData.email}
                        onChange={(e) => setNewTraineeData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t.userManagement.traineeEmail}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewTraineeForm(false)}
                        className="flex-1"
                      >
                        {t.common.cancel}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateNewTrainee}
                        className="flex-1"
                      >
                        {t.userManagement.createTrainee}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleAddUser}>
              {t.common.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.common.edit} {t.userManagement.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">{t.userManagement.username}</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder={t.userManagement.username}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">{t.userManagement.email}</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder={t.userManagement.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">{t.userManagement.password}</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={t.userManagement.password}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">{t.userManagement.role}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.userManagement.role} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trainee">{t.userManagement.trainee}</SelectItem>
                  {isAdmin() && <SelectItem value="teacher">{t.common.teacher}</SelectItem>}
                  {isAdmin() && <SelectItem value="team_leader">{t.userManagement.teamLeader}</SelectItem>}
                  {isAdmin() && <SelectItem value="admin">{t.userManagement.admin}</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'trainee' && (
              <div className="space-y-2">
                <Label htmlFor="edit-trainee">{t.userManagement.assignToTrainee}</Label>
                <Select
                  value={formData.traineeId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, traineeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.common.select} />
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
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFormOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleUpdateUser}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Firebase Configuration Dialog */}
      <Dialog open={isFirebaseConfigOpen} onOpenChange={setIsFirebaseConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.userManagement.setupFirebase}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firebase-api-key">API Key *</Label>
              <Input
                id="firebase-api-key"
                value={firebaseConfig.apiKey}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter Firebase API Key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firebase-auth-domain">Auth Domain</Label>
              <Input
                id="firebase-auth-domain"
                value={firebaseConfig.authDomain}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, authDomain: e.target.value }))}
                placeholder="planning-with-ai-5e22a.firebaseapp.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firebase-project-id">Project ID *</Label>
              <Input
                id="firebase-project-id"
                value={firebaseConfig.projectId}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, projectId: e.target.value }))}
                placeholder="planning-with-ai-5e22a"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firebase-storage-bucket">Storage Bucket</Label>
              <Input
                id="firebase-storage-bucket"
                value={firebaseConfig.storageBucket}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, storageBucket: e.target.value }))}
                placeholder="planning-with-ai-5e22a.appspot.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firebase-messaging-sender-id">Messaging Sender ID</Label>
              <Input
                id="firebase-messaging-sender-id"
                value={firebaseConfig.messagingSenderId}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, messagingSenderId: e.target.value }))}
                placeholder="Enter Messaging Sender ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firebase-app-id">App ID *</Label>
              <Input
                id="firebase-app-id"
                value={firebaseConfig.appId}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, appId: e.target.value }))}
                placeholder="Enter Firebase App ID"
              />
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">{t.userManagement.firebaseInstructions}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFirebaseConfigOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSaveFirebaseConfig}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

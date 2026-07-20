import { useState, useEffect } from 'react'
import { User, UserRole, RolePermissions } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, User as UserIcon, Edit, Cloud, Download, Upload, Shield } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { storageService } from '@/services/storage'
import { defaultPermissions, getPermissions, updatePermissions } from '@/lib/permissions'

export function UserManagement() {
  const { t } = useLanguage()
  const { users, trainees, addUser, deleteUser, updateUser, addTrainee } = useApp()
  const { isAdmin, isTeamLeader, useFirestore, toggleStorage } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showNewTraineeForm, setShowNewTraineeForm] = useState(false)
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<UserRole | null>(null)
  const [currentPermissions, setCurrentPermissions] = useState<RolePermissions | null>(null)
  
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

  const handleResetData = () => {
    if (confirm('Are you sure you want to clear all data? This will delete all trainees, users, reports, and tasks from both localStorage and Firebase. This action cannot be undone.')) {
      // Clear localStorage
      storageService.clearAll()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('firebase_configured')
        localStorage.removeItem('firebase_config')
      }
      
      // Clear Firebase data
      if (useFirestore) {
        import('@/services/firestoreStorage').then(({ firestoreStorageService }) => {
          firestoreStorageService.clearAll().then(() => {
            alert('All data cleared successfully!')
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }).catch((error) => {
            console.error('Error clearing Firebase data:', error)
            alert('Local data cleared. Firebase data may need manual clearing.')
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          })
        })
      } else {
        alert('All data cleared successfully!')
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }
    }
  }

  const handleClearFirebaseOnly = () => {
    if (confirm('Are you sure you want to clear Firebase data only? This will fix the invalid data error while keeping your local data. This action cannot be undone.')) {
      if (useFirestore) {
        import('@/services/firestoreStorage').then(({ firestoreStorageService }) => {
          firestoreStorageService.clearAll().then(() => {
            alert('Firebase data cleared successfully! The page will reload.')
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }).catch((error) => {
            console.error('Error clearing Firebase data:', error)
            alert('Failed to clear Firebase data. Please try again.')
          })
        })
      } else {
        alert('Firebase is not currently enabled.')
      }
    }
  }

  const handleEnableFirebase = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('firebase_configured', 'true')
      alert('Firebase enabled! The app will now reload to use Firestore.')
      window.location.reload()
    }
  }

  // Auto-enable Firebase on component mount if not already enabled
  useEffect(() => {
    if (typeof window === 'undefined') return
    const firebaseConfigured = localStorage.getItem('firebase_configured')
    if (!firebaseConfigured || firebaseConfigured === 'false') {
      localStorage.setItem('firebase_configured', 'true')
    }
  }, [])

  const handleDisableFirebase = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('firebase_configured', 'false')
      alert('Firebase disabled! The app will now reload to use localStorage.')
      window.location.reload()
    }
  }

  const handleOpenPermissions = (role: UserRole) => {
    setSelectedRoleForPermissions(role)
    setCurrentPermissions(getPermissions(role))
    setIsPermissionsDialogOpen(true)
  }

  const handleSavePermissions = () => {
    if (selectedRoleForPermissions && currentPermissions) {
      updatePermissions(selectedRoleForPermissions, currentPermissions)
      alert('Permissions updated successfully!')
      setIsPermissionsDialogOpen(false)
      setSelectedRoleForPermissions(null)
      setCurrentPermissions(null)
    }
  }

  const handleTogglePermission = (permission: keyof RolePermissions) => {
    if (currentPermissions) {
      setCurrentPermissions({
        ...currentPermissions,
        [permission]: !currentPermissions[permission]
      })
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

  const handleExport = async () => {
    try {
      let jsonData: string
      if (useFirestore) {
        const { firestoreStorageService } = await import('@/services/firestoreStorage')
        jsonData = await firestoreStorageService.exportData()
      } else {
        jsonData = storageService.exportData()
      }

      // Create and download the file
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `trainee-progress-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert('Data exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import')
      return
    }

    try {
      const fileContent = await importFile.text()
      
      if (useFirestore) {
        const { firestoreStorageService } = await import('@/services/firestoreStorage')
        await firestoreStorageService.importData(fileContent)
      } else {
        storageService.importData(fileContent)
      }

      alert('Data imported successfully! The page will reload to reflect the changes.')
      setIsImportDialogOpen(false)
      setImportFile(null)
      
      // Reload the page to refresh the data
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error importing data:', error)
      alert('Failed to import data. Please make sure the file is a valid export file.')
    }
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
          {isAdmin() && !useFirestore && (
            <Button variant="outline" onClick={handleEnableFirebase}>
              <Cloud className="h-4 w-4 mr-2" />
              {t.userManagement.enableCloudStorage}
            </Button>
          )}
          {isAdmin() && useFirestore && (
            <Button variant="outline" onClick={handleDisableFirebase}>
              <Cloud className="h-4 w-4 mr-2" />
              {t.userManagement.disableCloudStorage}
            </Button>
          )}
          {isAdmin() && useFirestore && (
            <Button variant="outline" onClick={handleClearFirebaseOnly}>
              <Cloud className="h-4 w-4 mr-2" />
              Clear Firebase Only
            </Button>
          )}
          {isAdmin() && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          )}
          {isAdmin() && (
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          )}
          {isAdmin() && (
            <Button variant="destructive" onClick={handleResetData}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t.userManagement.resetAllData}
            </Button>
          )}
          {isAdmin() && (
            <Button variant="outline" onClick={() => handleOpenPermissions('team_leader')}>
              <Shield className="h-4 w-4 mr-2" />
              Manage Permissions
            </Button>
          )}
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

      {/* Import Data Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Select Export File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Select a JSON file exported from this application</li>
                <li>This will replace all current data with the imported data</li>
                <li>Make sure to export your current data before importing if needed</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleImport}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions - {selectedRoleForPermissions}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium">Role: {selectedRoleForPermissions}</p>
              <p className="text-muted-foreground">Configure what this role can access and do in the system.</p>
            </div>
            
            {currentPermissions && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">View Permissions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'canViewDashboard', label: 'View Dashboard' },
                      { key: 'canViewTrainees', label: 'View Trainees' },
                      { key: 'canViewTeachers', label: 'View Teachers' },
                      { key: 'canViewTasks', label: 'View Tasks' },
                      { key: 'canViewDailyReports', label: 'View Daily Reports' },
                      { key: 'canViewStudentReports', label: 'View Student Reports' },
                      { key: 'canViewAnalytics', label: 'View Analytics' },
                      { key: 'canViewUserManagement', label: 'View User Management' },
                      { key: 'canViewSettings', label: 'View Settings' },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{perm.label}</span>
                        <input
                          type="checkbox"
                          checked={currentPermissions[perm.key as keyof RolePermissions]}
                          onChange={() => handleTogglePermission(perm.key as keyof RolePermissions)}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Trainee Management</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'canAddTrainees', label: 'Add Trainees' },
                      { key: 'canEditTrainees', label: 'Edit Trainees' },
                      { key: 'canDeleteTrainees', label: 'Delete Trainees' },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{perm.label}</span>
                        <input
                          type="checkbox"
                          checked={currentPermissions[perm.key as keyof RolePermissions]}
                          onChange={() => handleTogglePermission(perm.key as keyof RolePermissions)}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Teacher Management</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'canAddTeachers', label: 'Add Teachers' },
                      { key: 'canEditTeachers', label: 'Edit Teachers' },
                      { key: 'canDeleteTeachers', label: 'Delete Teachers' },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{perm.label}</span>
                        <input
                          type="checkbox"
                          checked={currentPermissions[perm.key as keyof RolePermissions]}
                          onChange={() => handleTogglePermission(perm.key as keyof RolePermissions)}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Task Management</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'canAddTasks', label: 'Add Tasks' },
                      { key: 'canEditTasks', label: 'Edit Tasks' },
                      { key: 'canDeleteTasks', label: 'Delete Tasks' },
                      { key: 'canReviewTasks', label: 'Review Tasks' },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{perm.label}</span>
                        <input
                          type="checkbox"
                          checked={currentPermissions[perm.key as keyof RolePermissions]}
                          onChange={() => handleTogglePermission(perm.key as keyof RolePermissions)}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Report Management</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'canAddDailyReports', label: 'Add Daily Reports' },
                      { key: 'canEditDailyReports', label: 'Edit Daily Reports' },
                      { key: 'canDeleteDailyReports', label: 'Delete Daily Reports' },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{perm.label}</span>
                        <input
                          type="checkbox"
                          checked={currentPermissions[perm.key as keyof RolePermissions]}
                          onChange={() => handleTogglePermission(perm.key as keyof RolePermissions)}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">System Management</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'canManageUsers', label: 'Manage Users' },
                      { key: 'canManagePermissions', label: 'Manage Permissions' },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{perm.label}</span>
                        <input
                          type="checkbox"
                          checked={currentPermissions[perm.key as keyof RolePermissions]}
                          onChange={() => handleTogglePermission(perm.key as keyof RolePermissions)}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSavePermissions}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

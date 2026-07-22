import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Bell, Shield, Database, Cloud, Download, Upload } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { UserRole, RolePermissions } from '@/types'
import { getPermissions, updatePermissions } from '@/lib/permissions'
import { useAuth } from '@/context/AuthContext'
import { storageService } from '@/services/storage'

export function Settings() {
  const { t } = useLanguage()
  const { isAdmin, useFirestore } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
  })

  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('user_profile')
      if (savedProfile) {
        return JSON.parse(savedProfile)
      }
    }
    return {
      name: '',
      email: '',
    }
  })

  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [currentPermissions, setCurrentPermissions] = useState<RolePermissions | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleSaveProfile = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_profile', JSON.stringify(profile))
      alert('Profile saved successfully!')
    }
  }

  const handleClearData = () => {
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

  const handleOpenPermissions = () => {
    setIsPermissionsDialogOpen(true)
    setSelectedRole(null)
    setCurrentPermissions(null)
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setCurrentPermissions(getPermissions(role))
  }

  const handleSavePermissions = () => {
    if (selectedRole && currentPermissions) {
      updatePermissions(selectedRole, currentPermissions)
      alert('Permissions updated successfully!')
      setIsPermissionsDialogOpen(false)
      setSelectedRole(null)
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

  const handleExport = async () => {
    try {
      let jsonData: string
      if (useFirestore) {
        const { firestoreStorageService } = await import('@/services/firestoreStorage')
        jsonData = await firestoreStorageService.exportData()
      } else {
        jsonData = storageService.exportData()
      }

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
      
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error importing data:', error)
      alert('Failed to import data. Please make sure the file is a valid export file.')
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

  const handleDisableFirebase = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('firebase_configured', 'false')
      alert('Firebase disabled! The app will now reload to use localStorage.')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.settings.title}</h1>
        <p className="text-muted-foreground">
          {t.settings.subtitle}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">{t.settings.profileSettings}</TabsTrigger>
          <TabsTrigger value="notifications">{t.settings.notificationPreferences}</TabsTrigger>
          <TabsTrigger value="data">{t.settings.dataManagement}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t.settings.profileSettings}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.settings.fullName}</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.common.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveProfile}>{t.common.save}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t.settings.notificationPreferences}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.settings.emailNotifications}</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about trainee progress
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.settings.pushNotifications}</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.settings.weeklyReports}</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary reports
                  </p>
                </div>
                <Switch
                  checked={notifications.weekly}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weekly: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t.settings.dataManagement}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.settings.dataStorage}</Label>
                <p className="text-sm text-muted-foreground">
                  All data is stored locally in your browser using Local Storage.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {isAdmin() && (
                  <Button
                    variant="outline"
                    onClick={handleOpenPermissions}
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Manage Permissions
                  </Button>
                )}
                {isAdmin() && (
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                )}
                {isAdmin() && (
                  <Button
                    variant="outline"
                    onClick={() => setIsImportDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                )}
                {isAdmin() && useFirestore && (
                  <Button
                    variant="outline"
                    onClick={handleClearFirebaseOnly}
                    className="flex items-center gap-2"
                  >
                    <Cloud className="h-4 w-4" />
                    Clear Firebase Only
                  </Button>
                )}
                {isAdmin() && useFirestore && (
                  <Button
                    variant="outline"
                    onClick={handleDisableFirebase}
                    className="flex items-center gap-2"
                  >
                    <Cloud className="h-4 w-4" />
                    تعطيل التخزين السحابي
                  </Button>
                )}
              </div>
              <div className="space-y-2 pt-4 border-t">
                <Label className="text-destructive">{t.settings.dangerZone}</Label>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to clear all data? This will delete all trainees, users, reports, and tasks from both localStorage and Firebase. This action cannot be undone.
                </p>
                {isAdmin() && (
                  <Button variant="destructive" onClick={handleClearData}>
                    {t.userManagement.resetAllData}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data Privacy</Label>
                <p className="text-sm text-muted-foreground">
                  Your data never leaves your device. All information is stored locally
                  in your browser and is not transmitted to any external servers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permissions Management Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!selectedRole ? (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="font-medium">Select a role to manage permissions</p>
                  <p className="text-muted-foreground">Choose whether you want to manage permissions for trainees or team leaders.</p>
                </div>
                <div className="space-y-2">
                  <Label>Select Role</Label>
                  <Select onValueChange={(value: UserRole) => handleRoleSelect(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trainee">Trainee</SelectItem>
                      <SelectItem value="team_leader">Team Leader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="font-medium">Role: {selectedRole}</p>
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
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            {selectedRole && (
              <Button onClick={handleSavePermissions}>
                {t.common.save}
              </Button>
            )}
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
    </div>
  )
}

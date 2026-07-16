import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Bell, Shield, Database, Palette } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

export function Settings() {
  const { t } = useLanguage()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
  })

  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@traineehub.com',
  })

  const handleSaveProfile = () => {
    // Save profile logic
    console.log('Profile saved:', profile)
  }

  const handleClearData = () => {
    if (confirm(t.settings.clearWarning)) {
      localStorage.clear()
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
          <TabsTrigger value="appearance">{t.settings.appearance}</TabsTrigger>
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

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t.settings.appearance}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.settings.theme}</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <div className="h-8 w-full rounded bg-white border" />
                    <span className="text-sm">{t.settings.light}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <div className="h-8 w-full rounded bg-slate-900 border" />
                    <span className="text-sm">{t.settings.dark}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <div className="h-8 w-full rounded bg-gradient-to-r from-white to-slate-900 border" />
                    <span className="text-sm">{t.settings.system}</span>
                  </Button>
                </div>
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
              <div className="space-y-2">
                <Label>{t.settings.exportData}</Label>
                <Button variant="outline" className="w-full">
                  {t.settings.exportData}
                </Button>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <Label className="text-destructive">{t.settings.dangerZone}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.settings.clearWarning}
                </p>
                <Button variant="destructive" onClick={handleClearData}>
                  {t.settings.clearAllData}
                </Button>
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
    </div>
  )
}

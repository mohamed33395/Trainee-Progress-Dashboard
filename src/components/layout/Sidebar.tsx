import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  User,
  BarChart3,
  Settings,
  Menu,
  X,
  GraduationCap,
  Globe,
  ClipboardList,
  CheckSquare,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { language, setLanguage, dir, t } = useLanguage()
  const { isTrainee, isTeamLeader, isAdmin, user } = useAuth()

  const navigation = [
    { name: t.common.dashboard, href: '/', icon: LayoutDashboard, roles: ['admin', 'team_leader'] },
    { name: t.common.trainees, href: '/trainees', icon: Users, roles: ['admin', 'team_leader'] },
    { name: t.common.teachers, href: '/teachers', icon: GraduationCap, roles: ['admin', 'team_leader'] },
    { name: t.common.tasks, href: '/tasks', icon: CheckSquare, roles: ['admin', 'team_leader', 'trainee'] },
    { name: t.common.dailyReport, href: '/daily-report', icon: FileText, roles: ['admin', 'team_leader'] },
    { name: t.common.studentReports, href: '/student-reports', icon: ClipboardList, roles: ['admin', 'team_leader'] },
    { name: t.common.analytics, href: '/analytics', icon: BarChart3, roles: ['admin', 'team_leader'] },
    { name: t.common.userManagement, href: '/user-management', icon: Shield, roles: ['admin', 'team_leader'] },
    { name: t.common.settings, href: '/settings', icon: Settings, roles: ['admin', 'team_leader', 'trainee'] },
  ]

  const filteredNavigation = navigation.filter(item => {
    if (isTrainee()) {
      return item.roles.includes('trainee')
    }
    if (isTeamLeader()) {
      return item.roles.includes('team_leader') || item.roles.includes('admin')
    }
    if (isAdmin()) {
      return item.roles.includes('admin')
    }
    return false
  })

  return (
    <div className={cn(
      'fixed right-0 top-0 z-40 h-screen bg-slate-900 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                {t.common.appName}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Globe className="h-5 w-5" />
              <span className="sr-only">{language === 'en' ? 'Switch to Arabic' : 'Switch to English'}</span>
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {isCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white scale-105'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-105'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="animate-fade-in">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="border-t border-slate-800 p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                <User className="h-5 w-5 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.username}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user.role === 'admin' ? t.common.admin : 
                   user.role === 'team_leader' ? t.common.teamLeader : 
                   user.role === 'trainee' ? t.common.trainee : 
                   user.role.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import {usePathname} from 'next/navigation'
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
import {cn} from '@/lib/utils'
import {useState, useEffect} from 'react'
import {useLanguage} from '@/context/LanguageContext'
import {useAuth} from '@/context/AuthContext'
import {firestoreStorageService} from '@/services/firestoreStorage'

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [showAdminImage, setShowAdminImage] = useState(false)
    const [adminProfileImage, setAdminProfileImage] = useState<string | null>(null)
    const {language, setLanguage, dir, t} = useLanguage()
    const {isTrainee, isTeacher, isTeamLeader, isAdmin, user} = useAuth()

    // Load image from Firebase on mount
    useEffect(() => {
        const loadImage = async () => {
            if (user?.id) {
                try {
                    const savedImage = await firestoreStorageService.getAdminProfileImage(user.id)
                    if (savedImage) {
                        setAdminProfileImage(savedImage)
                    }
                } catch (error) {
                    console.error('Error loading admin profile image:', error)
                }
            }
        }
        loadImage()
    }, [user?.id])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && user?.id) {
            const reader = new FileReader()
            reader.onload = async () => {
                const imageData = reader.result as string
                setAdminProfileImage(imageData)
                try {
                    await firestoreStorageService.saveAdminProfileImage(user.id, imageData)
                } catch (error) {
                    console.error('Error saving admin profile image:', error)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const navigation = [
        {name: t.common.dashboard, href: '/', icon: LayoutDashboard, roles: ['admin', 'team_leader', 'teacher']},
        {name: t.common.trainees, href: '/trainees', icon: Users, roles: ['admin', 'team_leader', 'teacher']},
        {name: t.common.teachers, href: '/teachers', icon: GraduationCap, roles: ['admin', 'team_leader']},
        {name: t.common.tasks, href: '/tasks', icon: CheckSquare, roles: ['admin', 'team_leader', 'trainee']},
        {name: t.common.profile, href: '/profile', icon: User, roles: ['trainee']},
        {name: t.common.dailyReport, href: '/daily-report', icon: FileText, roles: ['admin', 'team_leader', 'teacher']},
        {
            name: t.common.studentReports,
            href: '/student-reports',
            icon: ClipboardList,
            roles: ['admin', 'team_leader', 'teacher']
        },
        {name: t.common.analytics, href: '/analytics', icon: BarChart3, roles: ['admin', 'team_leader']},
        {name: t.common.userManagement, href: '/user-management', icon: Shield, roles: ['admin', 'team_leader']},
        {name: t.common.settings, href: '/settings', icon: Settings, roles: ['admin', 'team_leader']},
    ]

    const filteredNavigation = navigation.filter(item => {
        if (isTrainee()) {
            return item.roles.includes('trainee')
        }
        if (isTeacher()) {
            return item.roles.includes('teacher')
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
            'fixed right-0 top-0 z-40 h-screen bg-white md:bg-gradient-to-b md:from-indigo-950 md:to-purple-950 transition-all duration-300',
            isCollapsed ? 'w-16' : 'w-72'
        )}>
            <div className="flex h-full flex-col">
                {/* User Profile Section */}
                {!isCollapsed && user && (
                    <div className="p-4 border-b border-purple-800/30 animate-fade-in">
                        <div className="flex items-center gap-3 mb-3">
                            <button
                                onClick={() => setShowAdminImage(true)}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 hover:bg-pink-600 transition-colors cursor-pointer overflow-hidden"
                            >
                                {adminProfileImage ? (
                                    <img src={adminProfileImage} alt="Profile" className="h-full w-full object-cover"/>
                                ) : (
                                    <User className="h-6 w-6 text-white"/>
                                )}
                            </button>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-white">{user.username}</p>
                                <p className="text-xs text-purple-300">ID: {user.id?.slice(0, 8) || 'NV-001'}</p>
                            </div>
                        </div>
                        <p className="text-xs text-pink-400">{language === 'ar' ? 'مرحباً' : 'Welcome'}, {user.username}</p>
                    </div>
                )}

                {/* Admin Image Modal */}
                {showAdminImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/80 backdrop-blur-sm"
                        onClick={() => setShowAdminImage(false)}
                    >
                        <div className="relative max-w-md w-full mx-4">
                            <button
                                onClick={() => setShowAdminImage(false)}
                                className="absolute -top-4 -right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                            >
                                <X className="h-5 w-5"/>
                            </button>
                            <div className="bg-purple-950 rounded-lg p-6 border border-purple-800">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-32 w-32 rounded-full bg-pink-500 flex items-center justify-center overflow-hidden">
                                        {adminProfileImage ? (
                                            <img src={adminProfileImage} alt="Profile" className="h-full w-full object-cover"/>
                                        ) : (
                                            <User className="h-16 w-16 text-white"/>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-semibold text-white">{user.username}</p>
                                        <p className="text-sm text-purple-300">ID: {user.id?.slice(0, 8) || 'NV-001'}</p>
                                        <p className="text-sm text-pink-400 mt-2">
                                            {user.role === 'admin' ? t.common.admin :
                                             user.role === 'team_leader' ? t.common.teamLeader :
                                             user.role === 'teacher' ? t.common.teacher :
                                             t.common.trainee}
                                        </p>
                                    </div>
                                    <label className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <div className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg text-white text-sm font-medium transition-colors">
                                            <User className="h-4 w-4"/>
                                            <span>{language === 'ar' ? 'تغيير الصورة' : 'Change Image'}</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Collapse Button */}
                <div className="px-4 py-2">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="rounded-lg p-2 text-purple-300 hover:bg-purple-800/50 hover:text-white transition-colors"
                    >
                        {isCollapsed ? (
                            <Menu className="h-5 w-5"/>
                        ) : (
                            <X className="h-5 w-5"/>
                        )}
                    </button>
                </div>


                {/* Navigation */}
                <nav className="flex-1 space-y-4 p-4 overflow-y-auto">
                    {/* Main Programs Section */}
                    {!isCollapsed && (
                        <div>
                            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                                {language === 'ar' ? 'البرامج الرئيسية' : 'Main Programs'}
                            </p>
                            <div className="space-y-1">
                                {filteredNavigation.slice(0, 4).map((item) => {
                                    const isActive = pathname === item.href
                                    const Icon = item.icon

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-pink-500 text-white'
                                                    : 'text-purple-200 hover:bg-purple-800/50 hover:text-white'
                                            )}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0"/>
                                            <span>{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Sub Programs Section */}
                    {!isCollapsed && filteredNavigation.length > 4 && (
                        <div>
                            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                                {language === 'ar' ? 'البرامج الفرعية' : 'Sub Programs'}
                            </p>
                            <div className="space-y-1">
                                {filteredNavigation.slice(4).map((item) => {
                                    const isActive = pathname === item.href
                                    const Icon = item.icon

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-pink-500 text-white'
                                                    : 'text-purple-200 hover:bg-purple-800/50 hover:text-white'
                                            )}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0"/>
                                            <span>{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Collapsed Navigation */}
                    {isCollapsed && (
                        <div className="space-y-1">
                            {filteredNavigation.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center justify-center rounded-lg p-2.5 transition-all duration-200',
                                            isActive
                                                ? 'bg-pink-500 text-white'
                                                : 'text-purple-200 hover:bg-purple-800/50 hover:text-white'
                                        )}
                                    >
                                        <Icon className="h-5 w-5"/>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </nav>

                {/* Logo at Bottom */}
                {!isCollapsed && (
                    <div className="p-4 border-t border-purple-800/30">
                        <div className="flex items-center justify-center">
                            <div className="relative">
                                <img
                                    src="/img/logo.png"
                                    className="h-40 w-40  object-contain logo-scale-animation"
                                    alt="NV Logo"
                                />
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

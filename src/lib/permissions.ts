import { UserRole, RolePermissions } from '@/types'

// Default permissions for each role
export const defaultPermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canViewDashboard: true,
    canViewTrainees: true,
    canViewTeachers: true,
    canViewTasks: true,
    canViewDailyReports: true,
    canViewStudentReports: true,
    canViewAnalytics: true,
    canViewUserManagement: true,
    canViewSettings: true,
    canAddTrainees: true,
    canEditTrainees: true,
    canDeleteTrainees: true,
    canAddTeachers: true,
    canEditTeachers: true,
    canDeleteTeachers: true,
    canAddTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canReviewTasks: true,
    canAddDailyReports: true,
    canEditDailyReports: true,
    canDeleteDailyReports: true,
    canManageUsers: true,
    canManagePermissions: true,
  },
  team_leader: {
    canViewDashboard: true,
    canViewTrainees: true,
    canViewTeachers: true,
    canViewTasks: true,
    canViewDailyReports: true,
    canViewStudentReports: true,
    canViewAnalytics: true,
    canViewUserManagement: true,
    canViewSettings: true,
    canAddTrainees: true,
    canEditTrainees: true,
    canDeleteTrainees: true,
    canAddTeachers: true,
    canEditTeachers: true,
    canDeleteTeachers: true,
    canAddTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canReviewTasks: true,
    canAddDailyReports: true,
    canEditDailyReports: true,
    canDeleteDailyReports: true,
    canManageUsers: false,
    canManagePermissions: false,
  },
  teacher: {
    canViewDashboard: true,
    canViewTrainees: true,
    canViewTeachers: false,
    canViewTasks: false,
    canViewDailyReports: true,
    canViewStudentReports: true,
    canViewAnalytics: false,
    canViewUserManagement: false,
    canViewSettings: false,
    canAddTrainees: false,
    canEditTrainees: false,
    canDeleteTrainees: false,
    canAddTeachers: false,
    canEditTeachers: false,
    canDeleteTeachers: false,
    canAddTasks: false,
    canEditTasks: false,
    canDeleteTasks: false,
    canReviewTasks: false,
    canAddDailyReports: true,
    canEditDailyReports: true,
    canDeleteDailyReports: false,
    canManageUsers: false,
    canManagePermissions: false,
  },
  trainee: {
    canViewDashboard: false,
    canViewTrainees: false,
    canViewTeachers: false,
    canViewTasks: true,
    canViewDailyReports: false,
    canViewStudentReports: false,
    canViewAnalytics: false,
    canViewUserManagement: false,
    canViewSettings: false,
    canAddTrainees: false,
    canEditTrainees: false,
    canDeleteTrainees: false,
    canAddTeachers: false,
    canEditTeachers: false,
    canDeleteTeachers: false,
    canAddTasks: false,
    canEditTasks: false,
    canDeleteTasks: false,
    canReviewTasks: false,
    canAddDailyReports: false,
    canEditDailyReports: false,
    canDeleteDailyReports: false,
    canManageUsers: false,
    canManagePermissions: false,
  },
}

// Get permissions for a specific role
export function getPermissions(role: UserRole): RolePermissions {
  return defaultPermissions[role]
}

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return defaultPermissions[role][permission]
}

// Update permissions for a role (only admin can do this)
export function updatePermissions(role: UserRole, permissions: Partial<RolePermissions>): void {
  if (role === 'admin') {
    throw new Error('Cannot modify admin permissions')
  }
  defaultPermissions[role] = { ...defaultPermissions[role], ...permissions }
}

// Reset permissions to default for a role
export function resetPermissions(role: UserRole): void {
  if (role === 'admin') {
    throw new Error('Cannot reset admin permissions')
  }
  // This would need to be implemented with the actual default values
  // For now, we'll just reload the page
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

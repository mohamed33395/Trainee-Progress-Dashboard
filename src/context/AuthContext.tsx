"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole } from '../types'
import { storageService } from '../services/storage'
import { firestoreStorageService } from '../services/firestoreStorage'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
  isTrainee: () => boolean
  isTeamLeader: () => boolean
  isAdmin: () => boolean
  useFirestore: boolean
  toggleStorage: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem('currentUserId')
    if (savedUserId) {
      return storageService.getUserById(savedUserId)
    }
    return null
  })
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true'
  })
  const [useFirestore, setUseFirestore] = useState(() => {
    return localStorage.getItem('firebase_configured') === 'true'
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUserId', user.id)
      localStorage.setItem('isAuthenticated', 'true')
    } else {
      localStorage.removeItem('currentUserId')
      localStorage.removeItem('isAuthenticated')
    }
  }, [user, isAuthenticated])

  const initializeDefaultUsers = async () => {
    const users = useFirestore ? await firestoreStorageService.getUsers() : storageService.getUsers()
    
    // Only create default users if no users exist at all
    if (users.length === 0) {
      // Create default admin user
      const adminUser: User = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@traineehub.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      }
      if (useFirestore) {
        await firestoreStorageService.addUser(adminUser)
      } else {
        storageService.addUser(adminUser)
      }

      // Create default team leader user
      const teamLeaderUser: User = {
        id: 'teamleader-1',
        username: 'teamleader',
        email: 'teamleader@traineehub.com',
        password: 'teamleader123',
        role: 'team_leader',
        createdAt: new Date().toISOString(),
      }
      if (useFirestore) {
        await firestoreStorageService.addUser(teamLeaderUser)
      } else {
        storageService.addUser(teamLeaderUser)
      }
    } else {
      // If users exist, ensure admin user exists (but don't overwrite if it does)
      const adminExists = users.some(u => u.username === 'admin')
      if (!adminExists) {
        const adminUser: User = {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@traineehub.com',
          password: 'admin123',
          role: 'admin',
          createdAt: new Date().toISOString(),
        }
        if (useFirestore) {
          await firestoreStorageService.addUser(adminUser)
        } else {
          storageService.addUser(adminUser)
        }
      }
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    await initializeDefaultUsers()
    
    const foundUser = useFirestore 
      ? await firestoreStorageService.getUserByUsername(username)
      : storageService.getUserByUsername(username)
    
    if (!foundUser) {
      return false
    }

    if (foundUser.password !== password) {
      return false
    }

    setUser(foundUser)
    setIsAuthenticated(true)
    return true
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('currentUserId')
    localStorage.removeItem('isAuthenticated')
  }

  const resetPassword = async (email: string): Promise<void> => {
    // In a real application, this would send an email with a reset link
    console.log(`Password reset email sent to: ${email}`)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const isTrainee = (): boolean => {
    return hasRole('trainee')
  }

  const isTeamLeader = (): boolean => {
    return hasRole('team_leader') || hasRole('admin')
  }

  const isAdmin = (): boolean => {
    return hasRole('admin')
  }

  const toggleStorage = () => {
    const newValue = !useFirestore
    setUseFirestore(newValue)
    localStorage.setItem('firebase_configured', newValue ? 'true' : 'false')
    window.location.reload()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, resetPassword, isAuthenticated, hasRole, isTrainee, isTeamLeader, isAdmin, useFirestore, toggleStorage }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

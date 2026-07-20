import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { firestoreStorageService } from './firestoreStorage'

/**
 * Migration script to move data from old single-document structure to new separate collections
 * This resolves the Firebase 1MB document size limit issue
 */

export async function migrateToSeparateCollections(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Starting migration to separate collections...')

    // 1. Read existing data from old structure
    const oldDocRef = doc(db, 'trainee_progress_data', 'main_data')
    const oldDocSnap = await getDoc(oldDocRef)

    if (!oldDocSnap.exists()) {
      return {
        success: true,
        message: 'No old data found - migration not needed (already using new structure)'
      }
    }

    const oldData = oldDocSnap.data()
    console.log('Found old data structure, migrating...')

    // 2. Migrate each data type to separate collections
    const migrationPromises = []

    if (oldData.trainees?.length > 0) {
      console.log(`Migrating ${oldData.trainees.length} trainees...`)
      migrationPromises.push(firestoreStorageService.setTrainees(oldData.trainees))
    }

    if (oldData.reports?.length > 0) {
      console.log(`Migrating ${oldData.reports.length} reports...`)
      migrationPromises.push(firestoreStorageService.setReports(oldData.reports))
    }

    if (oldData.teachers?.length > 0) {
      console.log(`Migrating ${oldData.teachers.length} teachers...`)
      migrationPromises.push(firestoreStorageService.setTeachers(oldData.teachers))
    }

    if (oldData.tasks?.length > 0) {
      console.log(`Migrating ${oldData.tasks.length} tasks...`)
      migrationPromises.push(firestoreStorageService.setTasks(oldData.tasks))
    }

    if (oldData.users?.length > 0) {
      console.log(`Migrating ${oldData.users.length} users...`)
      migrationPromises.push(firestoreStorageService.setUsers(oldData.users))
    }

    if (oldData.notifications?.length > 0) {
      console.log(`Migrating ${oldData.notifications.length} notifications...`)
      migrationPromises.push(firestoreStorageService.setNotifications(oldData.notifications))
    }

    if (oldData.settings) {
      console.log('Migrating settings...')
      migrationPromises.push(firestoreStorageService.setSettings(oldData.settings))
    }

    // Execute all migrations
    await Promise.all(migrationPromises)

    // 3. Verify migration by reading back data
    console.log('Verifying migration...')
    const verification = await firestoreStorageService.getAllData()

    const verifyCounts = {
      trainees: verification.trainees?.length || 0,
      reports: verification.reports?.length || 0,
      teachers: verification.teachers?.length || 0,
      tasks: verification.tasks?.length || 0,
      users: verification.users?.length || 0,
      notifications: verification.notifications?.length || 0,
    }

    const oldCounts = {
      trainees: oldData.trainees?.length || 0,
      reports: oldData.reports?.length || 0,
      teachers: oldData.teachers?.length || 0,
      tasks: oldData.tasks?.length || 0,
      users: oldData.users?.length || 0,
      notifications: oldData.notifications?.length || 0,
    }

    // Check if all data was migrated
    const allMigrated = Object.keys(oldCounts).every(
      key => oldCounts[key as keyof typeof oldCounts] === verifyCounts[key as keyof typeof verifyCounts]
    )

    if (!allMigrated) {
      console.error('Migration verification failed:', { oldCounts, verifyCounts })
      return {
        success: false,
        message: 'Migration verification failed - data counts do not match'
      }
    }

    // 4. Delete old document after successful migration
    console.log('Migration verified successfully, deleting old document...')
    await deleteDoc(oldDocRef)

    console.log('Migration completed successfully!')
    return {
      success: true,
      message: `Migration completed successfully! Migrated: ${oldCounts.trainees} trainees, ${oldCounts.reports} reports, ${oldCounts.teachers} teachers, ${oldCounts.tasks} tasks, ${oldCounts.users} users, ${oldCounts.notifications} notifications`
    }

  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Function to check if migration is needed
export async function checkMigrationNeeded(): Promise<boolean> {
  try {
    const oldDocRef = doc(db, 'trainee_progress_data', 'main_data')
    const oldDocSnap = await getDoc(oldDocRef)
    return oldDocSnap.exists()
  } catch (error) {
    console.error('Error checking migration status:', error)
    return false
  }
}

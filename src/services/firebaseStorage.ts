import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'

class FirebaseStorageService {
  // Upload image to Firebase Storage
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      console.log('Starting image upload:', path, 'File size:', file.size, 'bytes', 'File type:', file.type)
      
      // Check if storage is initialized
      if (!storage) {
        console.error('Firebase Storage is not initialized')
        throw new Error('Firebase Storage is not initialized. Please check your Firebase configuration.')
      }
      
      // Check if storage.app exists
      if (!storage.app) {
        console.error('Firebase Storage app is not initialized')
        throw new Error('Firebase Storage app is not initialized')
      }
      
      const storageRef = ref(storage, path)
      console.log('Storage ref created:', storageRef.toString())
      
      // Upload with metadata
      const metadata = {
        contentType: file.type || 'image/jpeg',
      }
      
      const snapshot = await uploadBytes(storageRef, file, metadata)
      console.log('Upload completed:', snapshot)
      
      const downloadURL = await getDownloadURL(storageRef)
      console.log('Download URL obtained:', downloadURL)
      
      return downloadURL
    } catch (error: any) {
      console.error('Error uploading image:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Full error:', JSON.stringify(error, null, 2))
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('You do not have permission to upload files. Please check Firebase Storage rules in the Firebase Console.')
      } else if (error.code === 'storage/canceled') {
        throw new Error('Upload was canceled')
      } else if (error.code === 'storage/unknown') {
        throw new Error('An unknown error occurred during upload. Please check your internet connection and Firebase Storage configuration.')
      } else if (error.code === 'storage/retry-limit-exceeded') {
        throw new Error('Upload retry limit exceeded. Please check your internet connection.')
      } else if (error.message?.includes('Firebase Storage')) {
        throw new Error(`Firebase Storage error: ${error.message}`)
      }
      
      throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`)
    }
  }

  // Delete image from Firebase Storage
  async deleteImage(path: string): Promise<void> {
    try {
      console.log('Deleting image:', path)
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
      console.log('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  // Get download URL for a file
  async getDownloadURL(path: string): Promise<string> {
    try {
      console.log('Getting download URL for:', path)
      const storageRef = ref(storage, path)
      const url = await getDownloadURL(storageRef)
      console.log('Download URL obtained:', url)
      return url
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw error
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService()

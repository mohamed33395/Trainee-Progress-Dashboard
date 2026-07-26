# Firebase Firestore & Storage Setup Guide

This guide will help you set up Firebase Firestore and Firebase Storage to enable permanent cloud storage for your Trainee Progress Dashboard. This ensures that your data persists even when deployed to Netlify and across different devices and browsers.

## Why Use Firebase Firestore & Storage?

- **Permanent Storage**: Data is stored in the cloud, not in the browser
- **Cross-Device Access**: Access your data from any device or browser
- **Deployment Ready**: Works perfectly when deployed to Netlify or other hosting platforms
- **Real-time Sync**: Changes are synced across all connected devices
- **Image Storage**: Firebase Storage handles large image files without Firestore size limits
- **Free Tier**: Generous free tier for small to medium applications

## Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "trainee-progress-dashboard")
4. Follow the setup wizard
5. Disable Google Analytics (optional) for simplicity
6. Click "Create project"

### 2. Add a Web App

1. In your Firebase project dashboard, click the web icon (`</>`) to add a web app
2. Give your app a name (e.g., "Trainee Dashboard")
3. Click "Register app"
4. Copy the Firebase configuration snippet - you'll need the values

### 3. Enable Firestore Database

1. In the left sidebar, click "Build" → "Firestore Database"
2. Click "Create database"
3. Select a location (choose the closest to your users)
4. Choose "Start in test mode" for now (we'll secure it later)
5. Click "Enable"

### 4. Enable Firebase Storage (IMPORTANT for Images)

1. In the left sidebar, click "Build" → "Storage"
2. Click "Get Started"
3. Select a location (same as Firestore recommended)
4. Choose "Start in test mode" for now
5. Click "Enable"

### 5. Configure Storage Rules (IMPORTANT)

1. Go to Storage → Rules tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow read/write for all users (for development)
      allow read, write: if true;
      
      // For production, use authenticated users:
      // allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### 6. Configure Firestore Rules

1. Go to Firestore Database → Rules tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Allow read/write for all users (for development)
      allow read, write: if true;
      
      // For production, use authenticated users:
      // allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### 7. Configure Your Application

1. Open your Trainee Progress Dashboard application
2. Log in as an Admin user
3. Navigate to "User Management"
4. Click the "Setup Firebase" button
5. Fill in the configuration fields:
   - **API Key**: From your Firebase config
   - **Auth Domain**: Usually `your-project-id.firebaseapp.com`
   - **Project ID**: Your Firebase project ID
   - **Storage Bucket**: Usually `your-project-id.appspot.com` or `your-project-id.firebasestorage.app`
   - **Messaging Sender ID**: From your Firebase config
   - **App ID**: From your Firebase config

6. Click "Save Configuration"
7. The app will reload and automatically switch to Cloud Storage

## Switching Between Storage Types

The application supports both Local Storage and Cloud Storage:

- **Local Storage**: Data stored in browser (default, works offline)
- **Cloud Storage**: Data stored in Firebase Firestore & Storage (permanent, cross-device)

To switch:
1. Go to User Management
2. Click the "Cloud Storage" / "Local Storage" button
3. The app will reload with the selected storage type

## Data Migration

When you first switch to Cloud Storage:
- The app will create a new empty Firestore database
- Your existing Local Storage data will not be automatically migrated
- You can manually migrate data by:
  1. Using the "Create Backup" button in Local Storage mode
  2. Switch to Cloud Storage
  3. Re-enter your data manually
  4. Or use the backup/restore functionality

## Troubleshooting

### Firebase Connection Issues

If you see connection errors:
1. Check that your Firebase configuration is correct
2. Ensure Firestore and Storage are enabled in your Firebase project
3. Check browser console for specific error messages
4. Verify your internet connection

### Image Upload Errors

If images fail to upload:
1. **Check Firebase Storage is enabled**: Go to Firebase Console → Build → Storage
2. **Check Storage rules**: Ensure rules allow read/write operations
3. **Check storage bucket name**: Verify it matches your config
4. **Check browser console**: Look for specific error codes like:
   - `storage/unauthorized`: Check storage rules
   - `storage/unknown`: Check internet connection and bucket name
5. **Verify file size**: Ensure images are under 10MB

### Data Not Syncing

If data isn't syncing:
1. Ensure you're in Cloud Storage mode
2. Check your Firebase project usage limits
3. Verify Firestore rules allow read/write operations
4. Check browser console for error messages

### Switching Back to Local Storage

If you need to switch back:
1. Go to User Management
2. Click the "Local Storage" button
3. The app will reload with local storage

## Cost Considerations

Firebase offers a generous free tier:

**Firestore:**
- **Spark Plan (Free)**: 50K reads, 20K writes, 20K deletes per day
- **Blaze Plan (Pay as you go)**: $0.18/GB stored, $0.06/100K reads

**Storage:**
- **Spark Plan (Free)**: 5GB storage, 1GB/day download
- **Blaze Plan (Pay as you go)**: $0.026/GB stored, $0.12/GB download

For a small team dashboard, the free tier should be sufficient.

## Benefits Summary

✅ **Permanent Data Storage** - Data persists even after browser clear
✅ **Cross-Device Access** - Access from any device or browser  
✅ **Deployment Ready** - Works perfectly on Netlify
✅ **Real-time Sync** - Changes sync across devices
✅ **Image Storage** - Large image files stored separately from data
✅ **Backup & Recovery** - Built-in backup functionality
✅ **Scalable** - Grows with your needs
✅ **Free Tier Available** - No cost for small applications

## Support

If you encounter issues:
1. Check the Firebase Console for project status
2. Review browser console for error messages
3. Verify your configuration values
4. Ensure Firestore and Storage are properly enabled
5. Check Firebase usage limits
6. Verify storage and firestore rules

Your data will now be permanently stored in the cloud and accessible from anywhere!

# Firebase Firestore Setup Guide

This guide will help you set up Firebase Firestore to enable permanent cloud storage for your Trainee Progress Dashboard. This ensures that your data persists even when deployed to Netlify and across different devices and browsers.

## Why Use Firebase Firestore?

- **Permanent Storage**: Data is stored in the cloud, not in the browser
- **Cross-Device Access**: Access your data from any device or browser
- **Deployment Ready**: Works perfectly when deployed to Netlify or other hosting platforms
- **Real-time Sync**: Changes are synced across all connected devices
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

### 4. Configure Your Application

1. Open your Trainee Progress Dashboard application
2. Log in as an Admin user (`)
3. Navigate to "User Management"
4. Click the "Setup Firebase" button
5. Fill in the configuration fields:
   - **API Key**: From your Firebase config
   - **Auth Domain**: Usually `your-project-id.firebaseapp.com`
   - **Project ID**: Your Firebase project ID
   - **Storage Bucket**: Usually `your-project-id.appspot.com`
   - **Messaging Sender ID**: From your Firebase config
   - **App ID**: From your Firebase config

6. Click "Save Configuration"
7. The app will reload and automatically switch to Cloud Storage

### 5. Secure Your Firestore (Optional but Recommended)

For production use, you should set up proper Firestore security rules:

1. Go to Firestore Database → Rules tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trainee_progress_data/{document=**} {
      // Allow read/write for authenticated users
      allow read, write: if request.auth != null;
    }
  }
}
```

Note: For a simple implementation without Firebase Authentication, you can use test mode or more permissive rules.

## Switching Between Storage Types

The application supports both Local Storage and Cloud Storage:

- **Local Storage**: Data stored in browser (default, works offline)
- **Cloud Storage**: Data stored in Firebase Firestore (permanent, cross-device)

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
2. Ensure Firestore is enabled in your Firebase project
3. Check browser console for specific error messages
4. Verify your internet connection

### Data Not Syncing

If data isn't syncing:
1. Ensure you're in Cloud Storage mode
2. Check your Firebase project usage limits
3. Verify Firestore rules allow read/write operations

### Switching Back to Local Storage

If you need to switch back:
1. Go to User Management
2. Click the "Local Storage" button
3. The app will reload with local storage

## Cost Considerations

Firebase Firestore offers a generous free tier:
- **Spark Plan (Free)**: 50K reads, 20K writes, 20K deletes per day
- **Blaze Plan (Pay as you go)**: $0.18/GB stored, $0.06/100K reads

For a small team dashboard, the free tier should be sufficient.

## Benefits Summary

✅ **Permanent Data Storage** - Data persists even after browser clear
✅ **Cross-Device Access** - Access from any device or browser  
✅ **Deployment Ready** - Works perfectly on Netlify
✅ **Real-time Sync** - Changes sync across devices
✅ **Backup & Recovery** - Built-in backup functionality
✅ **Scalable** - Grows with your needs
✅ **Free Tier Available** - No cost for small applications

## Support

If you encounter issues:
1. Check the Firebase Console for project status
2. Review browser console for error messages
3. Verify your configuration values
4. Ensure Firestore is properly enabled
5. Check Firebase usage limits

Your data will now be permanently stored in the cloud and accessible from anywhere!

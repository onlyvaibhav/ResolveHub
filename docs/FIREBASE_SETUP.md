# Firebase Setup Guide

This guide walks you through setting up Firebase for the ResolveHub project.

---

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `ResolveHub` (or your preferred name)
4. Disable Google Analytics (optional for MVP)
5. Click **"Create project"**

---

## 2. Register a Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Enter app nickname: `ResolveHub Web`
3. **Do NOT** enable Firebase Hosting (we'll use Vercel)
4. Click **"Register app"**
5. Copy the Firebase configuration object — you'll need these values for `.env`

The config will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 3. Enable Authentication

1. Go to **Build → Authentication** in the sidebar
2. Click **"Get started"**
3. Under **Sign-in method**, click **Email/Password**
4. Toggle **Enable** to ON
5. Click **Save**

---

## 4. Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **Start in test mode** (we'll apply proper rules later)
4. Select the closest region to your users
5. Click **"Enable"**

### Initial Collections

After the database is created, you should create the following initial document:

#### `counters` Collection

Create a document with ID `issueCounter`:

| Field         | Type      | Value  |
|---------------|-----------|--------|
| `currentValue` | number   | 1000   |
| `prefix`       | string   | ISS    |
| `createdAt`    | timestamp | now    |
| `updatedAt`    | timestamp | now    |

> **Note:** This counter ensures ticket IDs start from ISS-1001. The app will auto-create this document if it doesn't exist, but creating it manually avoids a first-user race condition.

---

## 5. Enable Firebase Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Choose **Start in test mode**
4. Select the same region as Firestore
5. Click **"Done"**

---

## 6. Apply Security Rules

### Firestore Rules

1. Go to **Firestore Database → Rules**
2. Replace the default rules with the contents of `firestore.rules` in the project root
3. Click **"Publish"**

### Storage Rules

1. Go to **Storage → Rules**
2. Replace the default rules with the contents of `storage.rules` in the project root
3. Click **"Publish"**

---

## 7. Create an Admin User

1. Register a normal user through the app
2. Go to **Firestore Database → Data**
3. Navigate to `users` collection
4. Find the user document you want to make admin
5. Change the `role` field from `"user"` to `"admin"`

---

## 8. Configure Environment Variables

Copy the Firebase config values to your `.env` file. See `ENVIRONMENT_VARIABLES.md` for details.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Firebase: No Firebase App" | Check that `.env` values are correct and the file is in the project root |
| "Permission denied" on Firestore | Ensure security rules are published and user is authenticated |
| Images fail to upload | Check Storage rules are published and file is under 5MB |
| Auth not working | Verify Email/Password sign-in method is enabled |

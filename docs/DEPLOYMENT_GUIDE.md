# Deployment Guide (Vercel)

This guide covers deploying ResolveHub to Vercel.

---

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works)
- Project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Firebase project set up (see `FIREBASE_SETUP.md`)

---

## Step 1: Push to Git

Ensure your project is pushed to a Git repository:

```bash
git init
git add .
git commit -m "feat: initial project setup"
git remote add origin https://github.com/your-username/ResolveHub.git
git push -u origin main
```

---

## Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your ResolveHub repository
4. Vercel will auto-detect it as a Vite project

---

## Step 3: Configure Build Settings

Vercel should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

---

## Step 4: Add Environment Variables

1. In the Vercel import screen, expand **"Environment Variables"**
2. Add each variable from your `.env` file:

| Key | Value |
|-----|-------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Your project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `VITE_FIREBASE_APP_ID` | Your app ID |

> **Tip:** Set these for all environments (Production, Preview, Development).

---

## Step 5: Deploy

Click **"Deploy"** and wait for the build to complete.

---

## Step 6: Configure Firebase Auth Domain

After deployment, you need to add your Vercel domain to Firebase:

1. Go to **Firebase Console → Authentication → Settings**
2. Under **Authorized domains**, click **"Add domain"**
3. Add your Vercel domain: `your-project.vercel.app`
4. If you have a custom domain, add that too

---

## SPA Routing Configuration

Vite + React Router uses client-side routing. Vercel needs a rewrite rule to handle this:

Create or verify `vercel.json` in the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures all routes are handled by the React app instead of returning 404.

---

## Custom Domain (Optional)

1. Go to **Vercel Dashboard → Your Project → Settings → Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Don't forget to add the custom domain to Firebase authorized domains

---

## Continuous Deployment

Vercel automatically deploys:

- **Production:** On every push to `main` branch
- **Preview:** On every pull request

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs in Vercel dashboard |
| Auth not working after deploy | Add Vercel domain to Firebase authorized domains |
| 404 on page refresh | Ensure `vercel.json` rewrite rule exists |
| Env vars not loading | Verify variable names start with `VITE_` |
| Storage/Firestore errors | Check Firebase security rules allow your domain |

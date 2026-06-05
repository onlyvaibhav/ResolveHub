# Environment Variables Guide

ResolveHub uses environment variables to securely manage Firebase credentials. **Never commit your `.env` file to version control.**

---

## Setup

1. Copy the example file:

```bash
cp .env.example .env
```

2. Fill in the values from your Firebase project console (see `FIREBASE_SETUP.md`)

---

## Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Firebase Console → Project Settings → General → Your apps → Web app → Config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | Same location as above |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Same location |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket URL | Same location |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID | Same location |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Same location |

---

## Example `.env` File

```env
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## Important Notes

### Vite Prefix

All client-side environment variables in Vite **must** start with `VITE_`. Variables without this prefix are not exposed to the browser.

### Security

- The `.env` file is listed in `.gitignore` and will not be committed
- Firebase API keys are **not secret** — they are safe to use in client-side code
- Security is enforced through **Firestore Security Rules** and **Storage Security Rules**, not by hiding the API key
- **Never** expose Firebase Admin SDK credentials in client-side code

### Vercel Deployment

When deploying to Vercel, add these same variables in:

**Vercel Dashboard → Your Project → Settings → Environment Variables**

See `DEPLOYMENT_GUIDE.md` for details.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `undefined` values in console | Missing `.env` file | Create `.env` from `.env.example` |
| Firebase init error | Wrong values | Double-check values match Firebase Console |
| Build works, app fails | `.env` not in root | Ensure `.env` is in project root, not in `src/` |
| Works locally, fails on Vercel | Missing env vars on Vercel | Add all vars in Vercel project settings |

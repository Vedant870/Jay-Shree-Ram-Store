# JSR Order App Deployment Guide

## Architecture Choice
This app is built as a **Full-Stack Vite + Express** application. For Vercel deployment:
- frontend is served from `dist`
- backend APIs are served through serverless handler [`api/[...route].ts`](api/[...route].ts)

## Vercel Deployment (Recommended)
1. **GitHub Connection:** Push this code to a GitHub repo.
2. **Project Setup:** Import the project in Vercel.
3. **Build Settings:**
    - Framework Preset: `Vite`
    - Build Command: `npm run build`
    - Output Directory: `dist`
4. **Environment Variables:**
    - Go to Project Settings > Environment Variables.
    - Add `MONGODB_URI`.
    - Add `JWT_SECRET`.
    - Add your `GEMINI_API_KEY`.
    - Add all Firebase public keys (e.g., `VITE_FIREBASE_API_KEY`).
    - Keep `VITE_API_BASE_URL` empty when frontend+API are on same Vercel project.
    - Set `ALLOW_MOCK_FALLBACK=false` in Production to disable mock data when DB is unavailable.

5. **Sanity URLs after deploy:**
   - `https://<your-domain>/api/health`
   - `https://<your-domain>/api/products`
   - `https://<your-domain>/catalog`

## Netlify Deployment
1. **Import:** Connect your GitHub account and select the repo.
2. **Settings:**
   - Base directory: `/`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Redirects:** I've added a `public/_redirects` file (creation below) to handle SPA routing.

## Post-Deployment
Once deployed, the app will automatically sync with your **Firebase Firestore** database. Any orders placed by customers will appear in your Admin Dashboard in real-time.

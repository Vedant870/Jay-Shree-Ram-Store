# JSR Order App Deployment Guide

## Architecture Choice
This app is built as a **Full-Stack Vite + Express** application for local dev, but is configured to deploy as a **Static Site (SPA)** to platforms like Vercel or Netlify for maximum speed and zero cost.

## Vercel Deployment (Recommended)
1. **GitHub Connection:** Push this code to a GitHub repo.
2. **Project Setup:** Import the project in Vercel.
3. **Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:**
   - Go to Project Settings > Environment Variables.
   - Add your `GEMINI_API_KEY`.
   - Add all your Firebase keys (e.g., `VITE_FIREBASE_API_KEY`).

## Netlify Deployment
1. **Import:** Connect your GitHub account and select the repo.
2. **Settings:**
   - Base directory: `/`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Redirects:** I've added a `public/_redirects` file (creation below) to handle SPA routing.

## Post-Deployment
Once deployed, the app will automatically sync with your **Firebase Firestore** database. Any orders placed by customers will appear in your Admin Dashboard in real-time.

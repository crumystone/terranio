# Terranio — Deployment Guide

## What's in this folder

```
terranio-deploy/
├── index.html          ← Main app page
├── app-component.jsx   ← React app (all game logic + UI)
├── manifest.json       ← PWA manifest (enables "Add to Home Screen")
├── sw.js               ← Service worker (offline caching)
├── icon-512.png        ← App icon (512x512)
├── icon-192.png        ← App icon (192x192)
├── icon-180.png        ← Apple touch icon
├── icon-152.png        ← iPad icon
├── icon-120.png        ← iPhone icon
├── favicon-32.png      ← Browser favicon
├── favicon-16.png      ← Small favicon
└── README.md           ← This file
```

## Deploy to Netlify (free, ~2 minutes)

1. Go to [netlify.com](https://www.netlify.com) and sign up (free)
2. From your dashboard, click **"Add new site"** → **"Deploy manually"**
3. Drag and drop the entire `terranio-deploy` folder onto the upload area
4. Netlify will give you a URL like `random-name-123.netlify.app`
5. Click **"Site configuration"** → **"Change site name"** to set it to `terranio.netlify.app` (if available)

That's it! Share the URL with anyone.

## Deploy to GitHub Pages (free, ~5 minutes)

1. Create a new GitHub repository called `terranio`
2. Upload all files from this folder to the repository root
3. Go to **Settings** → **Pages** → set source to **"Deploy from a branch"** → select `main` branch
4. Your site will be live at `yourusername.github.io/terranio`

## Deploy to Vercel (free, ~2 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click **"Add New Project"** → **"Upload"** 
3. Upload the folder contents
4. Vercel will deploy and give you a URL

## Adding to iPad/iPhone Home Screen

Once deployed, on your iPad or iPhone:

1. Open the URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. The app will appear on your home screen with the Terranio icon
5. When launched, it runs full-screen with no browser chrome — feels like a native app!

## How it works

- **React 18** loaded from unpkg CDN
- **Babel** transpiles JSX in the browser (for simplicity; can be precompiled for production)
- **localStorage** stores player profiles (persists on device)
- **Service Worker** caches assets for offline play after first load
- **PWA Manifest** enables "Add to Home Screen" on iOS/Android

## Updating the app

To update, simply replace `app-component.jsx` with the latest version and redeploy. The service worker will pick up changes on the next visit.

## Custom domain (optional)

All three hosting providers support custom domains for free:
- Buy a domain (e.g., `terranio.app` or `terranio.fun`) from any registrar
- Point it at your hosting provider following their DNS instructions
- Free SSL is included automatically

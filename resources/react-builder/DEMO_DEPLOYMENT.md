# GitHub Pages Demo Deployment

This document explains how to deploy the React Builder demo to GitHub Pages.

## Overview

The demo version uses LocalStorage instead of a Laravel backend, making it suitable for static hosting on GitHub Pages.

## Features

- ✅ No backend required - runs entirely in the browser
- ✅ LocalStorage persistence
- ✅ Sample data pre-loaded
- ✅ Auto-save functionality
- ✅ Export HTML feature
- ✅ All builder features (drag & drop, inline editing, styling, etc.)

## Building for GitHub Pages

### 1. Build the demo version

```bash
cd resources/react-builder
npm run build:demo
```

This command:
- Sets the base path to `/CMS/` (for GitHub Pages URL structure)
- Compiles TypeScript
- Builds the production bundle
- Outputs to `dist/` folder

### 2. Deploy to GitHub Pages

#### Option A: Manual Deployment

1. Copy the `dist/` folder contents to a `gh-pages` branch:
```bash
git checkout -b gh-pages
cp -r resources/react-builder/dist/* .
git add .
git commit -m "Deploy demo to GitHub Pages"
git push origin gh-pages
```

2. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages, folder: / (root)

#### Option B: GitHub Actions (Automated)

Create `.github/workflows/deploy-demo.yml`:

```yaml
name: Deploy Demo to GitHub Pages

on:
  push:
    branches:
      - demo/github-pages-localstorage

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: resources/react-builder
        run: npm install

      - name: Build demo
        working-directory: resources/react-builder
        run: npm run build:demo

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./resources/react-builder/dist
```

## Accessing the Demo

Once deployed, the demo will be available at:
```
https://manakadesign.github.io/CMS/demo
```

## Local Testing

To test the demo build locally:

```bash
cd resources/react-builder
npm run build:demo
npm run preview
```

Then open: http://localhost:4173/CMS/demo

## Configuration

### Base Path

The base path is configured via the `VITE_BASE_PATH` environment variable:
- **GitHub Pages**: `/CMS/` (repository name)
- **Laravel Production**: `/public/admin/`

### Routes

- `/CMS/` - Redirects to login or dashboard (requires auth)
- `/CMS/demo` - Demo version (no auth required)
- `/CMS/login` - Login page
- `/CMS/dashboard` - Dashboard (protected)
- `/CMS/builder/:pageId` - Builder (protected)

## Troubleshooting

### Issue: 404 errors on routes

**Solution**: Ensure GitHub Pages is configured to use the `gh-pages` branch and the base path in `vite.config.ts` matches your repository name.

### Issue: Assets not loading

**Solution**: Check that `VITE_BASE_PATH` is set correctly during build. All asset paths should be relative to `/CMS/`.

### Issue: LocalStorage not persisting

**Solution**: Check browser console for errors. LocalStorage requires HTTPS or localhost. GitHub Pages provides HTTPS automatically.

## Development vs Demo vs Production

| Environment | Base Path | Backend | Storage | Auth |
|------------|-----------|---------|---------|------|
| Development | `/public/admin/` | Laravel API | Database | Required |
| Demo (GitHub Pages) | `/CMS/` | None | LocalStorage | Not required |
| Production | `/public/admin/` | Laravel API | Database | Required |

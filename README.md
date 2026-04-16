# Pace Calculator

Fast Vue app for running and cycling pace math.

## Stack

- Vue 3
- Vite 8
- Tailwind CSS 4
- GitHub Pages deployment via GitHub Actions

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create a GitHub repository for this folder.
2. Push the `main` branch.
3. In the repository Pages settings, use `GitHub Actions` as the source if GitHub has not selected it automatically.
4. Every push to `main` will build and deploy the app.

The Vite config uses `base: './'`, so the app works on standard project Pages URLs without hardcoding the repository name.

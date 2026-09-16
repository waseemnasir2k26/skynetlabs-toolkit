# skynetlabs-toolkit

A React + Vite single-page app bundling 22 free agency and freelancer tools (proposals, SOWs, contracts, client onboarding, project tracking, website audits, social planning) under one SkynetLabs brand.

## Status

Last reviewed: September 2026 · release v2026.09

## Stack

- React 18 + React Router 6, built with Vite 6
- Tailwind CSS, Framer Motion, lucide-react, Recharts
- jsPDF + html2canvas for document export, @dnd-kit for drag-and-drop
- Sentry, PostHog and Vercel Analytics / Speed Insights (`src/lib/`)
- Serverless endpoints in `api/` (`auth.js`, `analytics.js`, `track.js`), deployed on Vercel

## Layout

- `src/config/tools.js` — single source of truth for the tool list
- `src/tools/<tool>/` — one folder per tool
- `src/tools/shared/` — shared UI primitives and hooks
- `src/pages/` — landing page, admin login/dashboard, 404

## Local development

```bash
npm install
npm run dev      # vite dev server
npm run build    # production build
npm run preview  # preview the build
```

Copy `.env.example` to `.env` and fill in the values before running.

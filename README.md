# SkynetLabs Toolkit

A React single-page app with 22 free tools for freelancers and agencies: proposals, SOWs, contracts, client onboarding (with NDA and e-signature pad), project tracking, website audit, social calendar, cold outreach, lead-magnet factory and more.

## Tools

Brand kit generator, brief analyzer, business scorecard, case study generator, client onboarding, client report, cold outreach, content planner, contract generator, email templates, feedback survey, Fiverr gig creator, lead magnet factory, meeting manager, onboarding portal, project tracker, proposal builder, social calendar, social proof manager, SOW generator, subject line tester, website audit.

The list lives in `src/config/tools.js`; each tool is a folder under `src/tools/`.

## Run it

```bash
npm install
cp .env.example .env     # Sentry and PostHog keys are optional
npm run dev
npm run build && npm run preview
```

Stack: React 18, Vite 6, React Router 6, Tailwind, Framer Motion, Recharts, jsPDF and html2canvas for PDF export. Deploys to Vercel; `api/` holds three serverless endpoints (`auth`, `analytics`, `track`) for the admin area.

## Privacy note

The app includes optional Sentry and PostHog hooks and an admin login with analytics. Leave the keys blank to switch monitoring off. Check what each tool stores before you put client data in it.

## Status

Working app, no automated tests in the repo. No license file yet.

For you if: you run a small agency or freelance practice and want browser tools you can host yourself.

---

Need this wired into your business? SkynetLabs builds voice agents, n8n back offices and sites that convert → https://skynetjoe.com
Contact: info@skynetjoe.com

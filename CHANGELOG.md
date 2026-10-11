# Changelog

All notable changes to this project are documented in this file.

## [2026.10] - 2026-10-12

- skynetlabs-toolkit is a public React 18 + Vite single-page app bundling free agency and freelancer tools (proposals, SOWs, contracts, onboarding, project tracking, audits, social planning) under the SkynetLabs brand, with serverless endpoints in api/ and Sentry, PostHog and Vercel analytics wired in.
- State: no commits since the 2026.09 release (2026-09-16); last functional commit 2026-04-25 (rebrand and monitoring). Application code was not touched.
- Reviewed October 2026: README, commit history and link check (the README contains no external links); package version bumped 1.1.0 -> 1.2.0; a Work with SkynetLabs section was added.
- Known gaps: no LICENSE; no tests, lint config or CI; dependency versions were not audited this cycle.

## [2026.09] - 2026-09-16

- Maintenance review of skynetlabs-toolkit — a React + Vite single-page app bundling 22 free agency/freelancer tools under one SkynetLabs brand (proposal builder, SOW and contract generators, client onboarding portal, project tracker, website audit, social calendar, cold outreach, and more).
- Status: Vite 6 + React 18 + Tailwind + React Router, with `framer-motion`, `recharts`, `jspdf`/`html2canvas` for exports and `@dnd-kit` for drag-and-drop. Serverless endpoints live in `api/` (`auth.js`, `analytics.js`, `track.js`); Sentry, PostHog and Vercel Analytics/Speed Insights are wired in `src/lib/`. Deployed on Vercel with SPA rewrites; `public/sitemap.xml` lists https://skynetlabs-toolkit.vercel.app/.
- Reviewed September 2026: documentation refreshed, a README added, and the package version bumped to 1.1.0 for release v2026.09. No application code changes.
- Known gaps: the repo had no README at all before this release; no CHANGELOG; no LICENSE file; no tests, linting or CI configuration; dependency versions have not been audited or updated this cycle.

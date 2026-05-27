# SkynetLabs Toolkit

Free, professional-grade business tools for freelancers and agencies. Built by [SKYNET LABS](https://www.skynetjoe.com) -- no sign-up required.

**Live:** [skynetlabs-toolkit.vercel.app](https://skynetlabs-toolkit.vercel.app/)

## Tech Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS 3
- **UI:** Framer Motion, Lucide Icons, Recharts (admin charts)
- **PDF/Export:** jsPDF, html2canvas
- **Drag & Drop:** @dnd-kit
- **Analytics Backend:** Supabase (event tracking)
- **Hosting:** Vercel (with serverless API routes)

## Quick Start

```bash
git clone https://github.com/waseemnasir2k26/skynetlabs-toolkit.git
cd skynetlabs-toolkit
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Environment Variables

Set these in Vercel project settings (or a local `.env` file):

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes (for analytics) | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes (for analytics) | Supabase service-role key (server-side only) |
| `ADMIN_PASSWORD` | Yes (for admin) | Password for the admin analytics dashboard |

Analytics tracking degrades gracefully -- if Supabase is not configured, the tracking endpoint returns a silent success so the frontend is unaffected.

## Project Structure

```
skynetlabs-toolkit/
├── api/                  # Vercel serverless functions
│   ├── analytics.js      # GET  /api/analytics  (admin dashboard data)
│   ├── auth.js           # POST /api/auth        (admin login)
│   └── track.js          # POST /api/track        (event ingestion)
├── src/
│   ├── components/       # Shared UI (Layout, Header, etc.)
│   ├── config/
│   │   └── tools.js      # Single source of truth for all tool definitions
│   ├── pages/            # LandingPage, AdminLogin, AdminDashboard, NotFound
│   └── tools/            # Each tool in its own directory
│       ├── brief-analyzer/
│       ├── proposal-builder/
│       ├── project-tracker/
│       └── ...
├── vercel.json           # Rewrites for SPA + API routing
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Tool Categories

### AI Intelligence
- Client Brief Analyzer -- extract deliverables, flag scope creep, estimate hours
- SOW Generator -- statement of work with milestones and payment terms
- Meeting Lifecycle Manager -- structured agendas and action items

### Ad Creative & Marketing
- Email Subject Line Tester -- 9-factor scoring and A/B comparison
- Email Template Library -- 30+ professional templates
- Cold Outreach Sequence Builder -- multi-channel campaigns with follow-ups

### Agency Operations
- Client Project Tracker -- Kanban, calendar, and client portals
- Client Onboarding & NDA -- forms with e-signatures
- Onboarding Portal -- branded onboarding for new clients
- Client Report Builder -- drag-and-drop with PDF export

### Generator
- Proposal & Quote Builder -- live preview and PDF export
- Contract Generator -- step-by-step wizard with clause library
- Brand Kit Generator -- colors, typography, and guidelines

### Authority Building
- 90-Day Content Planner -- calendar mapped to sales funnel
- Social Proof Manager -- testimonials with embeddable widgets
- Business Health Scorecard -- 50-question diagnostic
- Website Conversion Audit -- 20-point optimization report
- Lead Magnet Factory -- lead magnet and landing page in one workflow
- Client Feedback Survey Builder -- ratings, NPS, and text responses
- Social Media Content Calendar -- visual cross-platform calendar
- Case Study Generator -- Problem, Solution, Results framework

### Freelancer Tools
- Fiverr Gig Creator -- SEO titles, descriptions, pricing tiers, FAQ

## Admin Dashboard

Access at `/admin`. Authenticate with the `ADMIN_PASSWORD` environment variable.

The dashboard shows:
- Unique visitors, page views, and tool usage counts
- Top tools by popularity
- Traffic timeline (7d / 30d / 90d)
- Country and device breakdowns
- Event type distribution

All analytics data is stored in a Supabase `events` table. See `supabase-schema.sql` for the table definition.

## API Routes

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/track` | POST | None | Ingest visitor events (page views, tool usage) |
| `/api/auth` | POST | None | Admin login (returns token on valid password) |
| `/api/analytics` | GET | Bearer token | Aggregated analytics data for the admin dashboard |

## Deployment

The project is configured for Vercel:

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add the three environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ADMIN_PASSWORD`).
4. Deploy. Vercel auto-detects the Vite build and serverless `api/` directory.

The `vercel.json` handles SPA routing (all non-API routes serve `index.html`).

## Contributing

1. Fork the repo and create a feature branch.
2. Add new tools under `src/tools/<tool-name>/App.jsx`.
3. Register the tool in `src/config/tools.js` and add its route in `src/App.jsx`.
4. Test locally with `npm run dev`.
5. Open a pull request.

## License

Private project by [Waseem Nasir](https://www.waseemnasir.com) / [SKYNET LABS](https://www.skynetjoe.com).

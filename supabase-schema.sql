-- ============================================================
-- SkynetLabs Toolkit -- Supabase Analytics Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to create the events
-- table used by the /api/track and /api/analytics endpoints.
-- ============================================================

-- Events table: stores every page view and tool interaction
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  visitor_id  text        not null default 'anon',
  event_type  text        not null default 'page_view',
  tool_slug   text,
  metadata    jsonb       not null default '{}'::jsonb,
  user_agent  text        not null default '',
  country     text        not null default 'unknown',
  created_at  timestamptz not null default now()
);

-- Index: filter by date range (used by analytics endpoint)
create index if not exists idx_events_created_at
  on public.events (created_at);

-- Index: filter by event type (page_view, tool_use, etc.)
create index if not exists idx_events_event_type
  on public.events (event_type);

-- Index: filter/group by tool slug for popularity rankings
create index if not exists idx_events_tool_slug
  on public.events (tool_slug)
  where tool_slug is not null;

-- Index: count unique visitors efficiently
create index if not exists idx_events_visitor_id
  on public.events (visitor_id);

-- Composite index: analytics queries that filter by date + event type
create index if not exists idx_events_created_at_event_type
  on public.events (created_at, event_type);

-- Enable Row Level Security (recommended)
alter table public.events enable row level security;

-- Policy: allow inserts from the service role (used by /api/track)
-- The service key bypasses RLS, so this policy is a safety net for
-- any future client-side access patterns.
create policy "Allow service role insert"
  on public.events
  for insert
  with check (true);

-- Policy: allow reads from the service role (used by /api/analytics)
create policy "Allow service role select"
  on public.events
  for select
  using (true);

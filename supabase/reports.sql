create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  url text not null,
  page_title text,
  selected_checks text[] not null default '{}',
  overall_score integer not null,
  accessibility_score integer not null,
  readability_score integer not null,
  performance_score integer not null,
  issues jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists reports_user_created_at_idx
  on public.reports (user_id, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Users can view their own reports" on public.reports;
drop policy if exists "Users can insert their own reports" on public.reports;
drop policy if exists "Users can delete their own reports" on public.reports;

create policy "Users can view their own reports"
  on public.reports
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on public.reports
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on public.reports
  for delete
  using (auth.uid() = user_id);

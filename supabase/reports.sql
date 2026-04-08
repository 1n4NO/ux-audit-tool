create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workspace_id uuid references public.workspaces (id) on delete cascade,
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

alter table public.reports
  add column if not exists workspace_id uuid references public.workspaces (id) on delete cascade;

create index if not exists reports_user_created_at_idx
  on public.reports (user_id, created_at desc);

create index if not exists reports_workspace_created_at_idx
  on public.reports (workspace_id, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Users can view their own reports" on public.reports;
drop policy if exists "Users can insert their own reports" on public.reports;
drop policy if exists "Users can delete their own reports" on public.reports;
drop policy if exists "Members can view workspace reports" on public.reports;
drop policy if exists "Members can insert workspace reports" on public.reports;
drop policy if exists "Members can delete workspace reports" on public.reports;

create policy "Members can view workspace reports"
  on public.reports
  for select
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = reports.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy "Members can insert workspace reports"
  on public.reports
  for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = reports.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy "Members can delete workspace reports"
  on public.reports
  for delete
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = reports.workspace_id
        and wm.user_id = auth.uid()
    )
  );

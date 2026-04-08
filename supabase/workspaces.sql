create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  personal boolean not null default false,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (workspace_id, user_id)
);

create or replace function public.set_workspaces_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_workspaces_updated_at on public.workspaces;

create trigger set_workspaces_updated_at
before update on public.workspaces
for each row
execute function public.set_workspaces_updated_at();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

drop policy if exists "Members can view workspaces" on public.workspaces;
drop policy if exists "Users can create workspaces" on public.workspaces;
drop policy if exists "Members can view memberships" on public.workspace_members;
drop policy if exists "Users can bootstrap their own workspace membership" on public.workspace_members;
drop policy if exists "Owners and admins can add memberships" on public.workspace_members;
drop policy if exists "Owners and admins can update memberships" on public.workspace_members;

create policy "Members can view workspaces"
  on public.workspaces
  for select
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = workspaces.id
        and wm.user_id = auth.uid()
    )
  );

create policy "Users can create workspaces"
  on public.workspaces
  for insert
  with check (created_by = auth.uid());

create policy "Members can view memberships"
  on public.workspace_members
  for select
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy "Users can bootstrap their own workspace membership"
  on public.workspace_members
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.workspaces w
      where w.id = workspace_members.workspace_id
        and w.created_by = auth.uid()
    )
  );

create policy "Owners and admins can add memberships"
  on public.workspace_members
  for insert
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

create policy "Owners and admins can update memberships"
  on public.workspace_members
  for update
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

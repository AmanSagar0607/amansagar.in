-- The snapshot contains private drafts. Only the server-side service role may access it.
create table public.portfolio_cms_snapshot (
  singleton boolean primary key default true check (singleton),
  revision uuid not null,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_cms_snapshot enable row level security;
revoke all on public.portfolio_cms_snapshot from public, anon, authenticated;
grant select, insert, update on public.portfolio_cms_snapshot to service_role;

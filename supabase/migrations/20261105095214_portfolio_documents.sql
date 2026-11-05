-- Private document metadata. Binary content stays in the configured R2 bucket.
create table public.portfolio_documents (
  id uuid primary key,
  storage_key text not null unique check (storage_key ~ '^private/documents/[0-9a-f-]{36}\.pdf$'),
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type text not null check (mime_type = 'application/pdf'),
  byte_size bigint not null check (byte_size between 8 and 20971520),
  created_at timestamptz not null default now()
);

alter table public.portfolio_documents enable row level security;
revoke all on public.portfolio_documents from public, anon, authenticated;
grant select, insert on public.portfolio_documents to service_role;

-- Allow the authenticated server-side admin flow to rename and remove private document metadata.
grant update, delete on public.portfolio_documents to service_role;

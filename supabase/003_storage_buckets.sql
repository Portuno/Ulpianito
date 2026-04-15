-- ============================================
-- Ulpianito MVP - Storage Buckets & Policies
-- Run AFTER 002_rls_policies.sql
-- ============================================

-- Create the private documentos bucket
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false);

-- Users can upload files within their despacho folder
create policy "Users can upload to their despacho folder"
  on storage.objects for insert
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = public.get_user_despacho_id()::text
  );

-- Users can view files within their despacho folder
create policy "Users can view their despacho files"
  on storage.objects for select
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = public.get_user_despacho_id()::text
  );

-- Users can update files within their despacho folder
create policy "Users can update their despacho files"
  on storage.objects for update
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = public.get_user_despacho_id()::text
  );

-- Users can delete files within their despacho folder
create policy "Users can delete their despacho files"
  on storage.objects for delete
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = public.get_user_despacho_id()::text
  );

-- ============================================================
-- Alex T Studio — Storage 設定（media bucket）
--
-- 如果 0001_init.sql 最後的 storage 區塊沒有成功執行，
-- 單獨執行這一份即可。可以安全重複執行。
--
-- 若這份仍然報錯（部分 Supabase 專案不允許用 SQL 建立 bucket），
-- 請改用 Dashboard：Storage → New bucket
--   Name: media
--   Public bucket: 開啟
--   File size limit: 10 MB
--   Allowed MIME types: image/jpeg, image/png, image/webp
-- 建立好之後，再回來執行本檔案下半部的 policy 區塊。
-- ============================================================

-- ------------------------------------------------------------
-- 1. 建立 bucket
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 10485760,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- ------------------------------------------------------------
-- 2. Storage 存取政策
--    公開讀取、僅登入者可上傳／修改／刪除
-- ------------------------------------------------------------
drop policy if exists "public read media bucket" on storage.objects;
create policy "public read media bucket" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "admin upload media bucket" on storage.objects;
create policy "admin upload media bucket" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "admin update media bucket" on storage.objects;
create policy "admin update media bucket" on storage.objects
  for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists "admin delete media bucket" on storage.objects;
create policy "admin delete media bucket" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- ------------------------------------------------------------
-- 3. 確認結果
-- ------------------------------------------------------------
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'media';

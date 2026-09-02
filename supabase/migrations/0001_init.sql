-- ============================================================
-- Alex T Studio — Personal CMS schema
-- 執行方式：Supabase Dashboard → SQL Editor → 貼上整份執行
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 共用：updated_at 自動更新
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

-- ============================================================
-- 1. site_settings（單列）
-- ============================================================
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'Alex T',
  site_title text not null default 'Coffee, Places & Ideas',
  description text default 'A personal journal by Alex T.',
  seo_description text default 'A personal journal by Alex T exploring coffee, photography, Hualien, technology and everyday life.',
  website_url text default 'https://alext.example.com',
  footer_text text default '© 2026 Alex T.',
  location text default 'Taiwan',
  og_image_url text,
  favicon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. home_content（單列）
-- ============================================================
create table if not exists public.home_content (
  id uuid primary key default gen_random_uuid(),
  eyebrow text default 'A PERSONAL JOURNAL',
  title text default 'Collecting moments,
brewing ideas.',
  intro text default '喝咖啡、拍照、走走花蓮，
偶爾研究 AI。
這裡收藏我喜歡的事物，
也記錄正在發生的生活。',
  cta_label text default 'Explore My World',
  hero_image_url text,
  hero_image_caption text default 'Hualien, Taiwan',
  keywords text[] not null default array['Coffee', 'Photography', 'Hualien', 'Technology'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. about_content（單列）
-- ============================================================
create table if not exists public.about_content (
  id uuid primary key default gen_random_uuid(),
  section_label text default 'ABOUT',
  title text default 'A little about me.',
  paragraphs text[] not null default '{}',
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. coffee_entries
-- ============================================================
create table if not exists public.coffee_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null default 'brewing_note'
    check (entry_type in ('brewing_note', 'coffee_bean')),
  title text not null,
  coffee_name text,
  origin text,
  region text,
  producer text,
  variety text,
  process text,
  roast_level text,
  roaster text,
  roast_date date,
  brew_date date,
  brewer text,
  grinder text,
  grind_setting text,
  dose text,
  water text,
  water_temperature text,
  brew_time text,
  recipe text,
  flavor_notes text[] not null default '{}',
  rating smallint check (rating is null or (rating >= 0 and rating <= 5)),
  notes text,
  cover_image_url text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 5. places
-- ============================================================
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  category text default 'Local',
  location text,
  google_maps_url text,
  short_description text,
  story text,
  visit_date date,
  cover_image_url text,
  gallery text[] not null default '{}',
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 6. photos
-- ============================================================
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  location text,
  camera text,
  lens text,
  taken_on date,
  caption text,
  category text default 'Hualien',
  published boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 7. technology_projects
-- ============================================================
create table if not exists public.technology_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  technologies text[] not null default '{}',
  category text,
  description text,
  project_url text,
  github_url text,
  cover_image_url text,
  start_date date,
  status text not null default 'exploring'
    check (status in ('exploring', 'active', 'completed', 'archived')),
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 8. projects（前台 Selected Projects）
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  year text,
  description text,
  cover_image_url text,
  url text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 9. social_links
-- 只允許既有的七個平台，資料庫層級直接擋掉其他社群
-- ============================================================
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique
    check (platform in ('tiktok', 'google_maps', 'x', 'threads', 'instagram', 'github', 'email')),
  name text not null,
  handle text,
  url text not null,
  icon text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 10. media（Supabase Storage 檔案索引）
-- ============================================================
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
do $do$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'home_content', 'about_content', 'coffee_entries',
    'places', 'photos', 'technology_projects', 'projects',
    'social_links', 'media'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end;
$do$;

-- ------------------------------------------------------------
-- 索引
-- ------------------------------------------------------------
create index if not exists coffee_entries_published_idx on public.coffee_entries (published, sort_order);
create index if not exists places_published_idx on public.places (published, sort_order);
create index if not exists photos_published_idx on public.photos (published, sort_order);
create index if not exists technology_projects_published_idx on public.technology_projects (published, sort_order);
create index if not exists projects_published_idx on public.projects (published, sort_order);
create index if not exists media_created_idx on public.media (created_at desc);

-- ============================================================
-- Row Level Security
--   公開網站（anon）：只能讀取已發佈內容
--   管理者（authenticated）：完整讀寫
-- ============================================================
alter table public.site_settings       enable row level security;
alter table public.home_content        enable row level security;
alter table public.about_content       enable row level security;
alter table public.coffee_entries      enable row level security;
alter table public.places              enable row level security;
alter table public.photos              enable row level security;
alter table public.technology_projects enable row level security;
alter table public.projects            enable row level security;
alter table public.social_links        enable row level security;
alter table public.media               enable row level security;

-- 單列設定表：公開可讀
drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "public read home_content" on public.home_content;
create policy "public read home_content" on public.home_content
  for select to anon, authenticated using (true);

drop policy if exists "public read about_content" on public.about_content;
create policy "public read about_content" on public.about_content
  for select to anon, authenticated using (true);

-- 內容表：匿名只能讀 published = true
drop policy if exists "public read published coffee" on public.coffee_entries;
create policy "public read published coffee" on public.coffee_entries
  for select to anon using (published = true);

drop policy if exists "public read published places" on public.places;
create policy "public read published places" on public.places
  for select to anon using (published = true);

drop policy if exists "public read published photos" on public.photos;
create policy "public read published photos" on public.photos
  for select to anon using (published = true);

drop policy if exists "public read published technology" on public.technology_projects;
create policy "public read published technology" on public.technology_projects
  for select to anon using (published = true);

drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects" on public.projects
  for select to anon using (published = true);

drop policy if exists "public read enabled social" on public.social_links;
create policy "public read enabled social" on public.social_links
  for select to anon using (enabled = true);

-- media：只有登入者可讀（前台用的是內容表裡已存下的 public_url）
drop policy if exists "admin read media" on public.media;
create policy "admin read media" on public.media
  for select to authenticated using (true);

-- 管理者：所有表完整權限
do $do$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'home_content', 'about_content', 'coffee_entries',
    'places', 'photos', 'technology_projects', 'projects',
    'social_links', 'media'
  ]
  loop
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format(
      'create policy "admin full access" on public.%I
       for all to authenticated using (true) with check (true)', t);
  end loop;
end;
$do$;

-- ============================================================
-- Storage：media bucket
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 10485760,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

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

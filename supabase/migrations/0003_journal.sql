-- ============================================================
-- Alex T Studio — 第二階段：Journal / Block Editor / Gallery
--
-- 這份 migration 只新增欄位與資料表，
-- 不會刪除或修改任何既有的 coffee_entries / places / photos /
-- technology_projects / projects / social_links 資料。
--
-- 執行方式：Supabase Dashboard → SQL Editor → 貼上整份執行
-- 可以重複執行。
-- ============================================================

-- ------------------------------------------------------------
-- 1. media 擴充：通用圖片系統需要的中繼資料
-- ------------------------------------------------------------
alter table public.media add column if not exists width integer;
alter table public.media add column if not exists height integer;
alter table public.media add column if not exists aspect_ratio numeric(10, 6);
alter table public.media add column if not exists alt text;
alter table public.media add column if not exists caption text;
-- 焦點：0~1 的相對座標，cover 裁切時用來決定保留畫面的哪個部分
alter table public.media add column if not exists focal_x numeric(4, 3) not null default 0.5;
alter table public.media add column if not exists focal_y numeric(4, 3) not null default 0.5;
alter table public.media add column if not exists sort_order integer not null default 0;

-- 既有資料補上預設焦點（欄位有 default，這裡只是保險）
update public.media set focal_x = 0.5 where focal_x is null;
update public.media set focal_y = 0.5 where focal_y is null;

-- ------------------------------------------------------------
-- 1b. photos / places 也加上尺寸與焦點
--     讓 Photography masonry 與 Places 版面可以保留原始比例
-- ------------------------------------------------------------
alter table public.photos add column if not exists width integer;
alter table public.photos add column if not exists height integer;
alter table public.photos add column if not exists focal_x numeric(4, 3) not null default 0.5;
alter table public.photos add column if not exists focal_y numeric(4, 3) not null default 0.5;

alter table public.places add column if not exists cover_width integer;
alter table public.places add column if not exists cover_height integer;
alter table public.places add column if not exists cover_focal_x numeric(4, 3) not null default 0.5;
alter table public.places add column if not exists cover_focal_y numeric(4, 3) not null default 0.5;

-- ------------------------------------------------------------
-- 2. journal_posts
-- ------------------------------------------------------------
create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  slug text not null unique,
  excerpt text,
  cover_image_url text,
  cover_width integer,
  cover_height integer,
  cover_focal_x numeric(4, 3) not null default 0.5,
  cover_focal_y numeric(4, 3) not null default 0.5,
  cover_alt text,
  category text not null default 'Life'
    check (category in ('Coffee', 'Hualien', 'Photography', 'Travel', 'Technology', 'Life')),
  tags text[] not null default '{}',
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_posts_status_idx
  on public.journal_posts (status, published_at desc);
create index if not exists journal_posts_slug_idx on public.journal_posts (slug);

-- ------------------------------------------------------------
-- 3. content_blocks
--
-- content / settings 使用 jsonb，因此新增區塊型別時
-- 不需要再動 schema。
-- ------------------------------------------------------------
create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.journal_posts (id) on delete cascade,
  type text not null check (
    type in (
      'paragraph', 'heading', 'image', 'gallery', 'quote',
      'divider', 'spacer', 'location', 'coffee-note'
    )
  ),
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_blocks_post_idx
  on public.content_blocks (post_id, sort_order);

-- ------------------------------------------------------------
-- 4. galleries
--
-- 一篇文章可以有多個 gallery，因此 gallery 獨立成表，
-- 由 content_blocks.content->>'gallery_id' 指向。
-- ------------------------------------------------------------
create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.journal_posts (id) on delete cascade,
  title text,
  style text not null default 'editorial'
    check (style in ('editorial', 'masonry', 'grid', 'carousel', 'filmstrip')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists galleries_post_idx on public.galleries (post_id);

-- ------------------------------------------------------------
-- 5. gallery_images
--
-- image_url / width / height 刻意反正規化，
-- 讓公開前台不需要讀取 media 表（media 僅限管理者可讀）。
-- ------------------------------------------------------------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  media_id uuid references public.media (id) on delete set null,
  image_url text not null,
  alt text,
  caption text,
  width integer,
  height integer,
  focal_x numeric(4, 3) not null default 0.5,
  focal_y numeric(4, 3) not null default 0.5,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_images_gallery_idx
  on public.gallery_images (gallery_id, sort_order);

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
do $do$
declare
  t text;
begin
  foreach t in array array[
    'journal_posts', 'content_blocks', 'galleries', 'gallery_images'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end;
$do$;

-- ============================================================
-- Row Level Security
--   匿名：只能讀取 status = 'published' 的文章及其附屬內容
--   管理者：完整讀寫
-- ============================================================
alter table public.journal_posts  enable row level security;
alter table public.content_blocks enable row level security;
alter table public.galleries      enable row level security;
alter table public.gallery_images enable row level security;

-- journal_posts：匿名只讀已發佈
drop policy if exists "public read published posts" on public.journal_posts;
create policy "public read published posts" on public.journal_posts
  for select to anon using (status = 'published');

-- content_blocks：所屬文章已發佈才可讀
-- 子查詢同樣受 journal_posts 的 RLS 約束，因此 draft 文章的區塊不會外洩
drop policy if exists "public read blocks of published posts" on public.content_blocks;
create policy "public read blocks of published posts" on public.content_blocks
  for select to anon using (
    exists (
      select 1 from public.journal_posts p
      where p.id = content_blocks.post_id and p.status = 'published'
    )
  );

-- galleries：附屬於已發佈文章，或未綁定文章的獨立 gallery
drop policy if exists "public read galleries of published posts" on public.galleries;
create policy "public read galleries of published posts" on public.galleries
  for select to anon using (
    post_id is null
    or exists (
      select 1 from public.journal_posts p
      where p.id = galleries.post_id and p.status = 'published'
    )
  );

-- gallery_images：跟隨所屬 gallery 的可見性
drop policy if exists "public read images of visible galleries" on public.gallery_images;
create policy "public read images of visible galleries" on public.gallery_images
  for select to anon using (
    exists (
      select 1 from public.galleries g where g.id = gallery_images.gallery_id
    )
  );

-- 管理者：完整權限
do $do$
declare
  t text;
begin
  foreach t in array array[
    'journal_posts', 'content_blocks', 'galleries', 'gallery_images'
  ]
  loop
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format(
      'create policy "admin full access" on public.%I
       for all to authenticated using (true) with check (true)', t);
  end loop;
end;
$do$;

-- ------------------------------------------------------------
-- 確認結果
-- ------------------------------------------------------------
select
  (select count(*) from public.journal_posts)  as journal_posts,
  (select count(*) from public.content_blocks) as content_blocks,
  (select count(*) from public.galleries)      as galleries,
  (select count(*) from public.gallery_images) as gallery_images,
  (select count(*) from public.coffee_entries) as coffee_entries_unchanged,
  (select count(*) from public.places)         as places_unchanged,
  (select count(*) from public.projects)       as projects_unchanged;

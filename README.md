# Alex T — Coffee, Places & Ideas

Personal Journal / Portfolio，加上一套輕量的個人後台 **Alex T Studio**。

- 前台：`/`
- 後台：`/admin`
- 登入：`/admin/login`

## 開發

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 產出正式版
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run seed       # 把 src/data 的內容寫進 Supabase（見下方）
```

沒有設定 Supabase 也能跑 —— 前台會直接使用 `src/data` 的內容，後台則會顯示設定指引。

## 資料夾結構

```
src/
  app/
    layout.tsx              # 字體、SEO metadata（html/body 外框）
    (site)/                 # 前台
      layout.tsx            #   Header + Footer
      page.tsx              #   首頁區塊組裝
    admin/
      login/page.tsx        # /admin/login（不受保護）
      (protected)/          # 需要登入才能進入
        layout.tsx          #   驗證 + AdminShell
        page.tsx            #   /admin Overview
        home about social
        coffee places photography technology projects
        media settings
    globals.css sitemap.ts robots.ts
  components/
    layout/                 # 前台 Header / MobileMenu / Footer
    sections/               # 前台各區塊
    ui/                     # SectionLabel / Reveal / Figure / SocialLink
    admin/                  # AdminShell / Toast / ConfirmDialog / Fields …
  data/                     # 靜態內容（Supabase 沒資料時的 fallback）
  lib/
    content.ts              # 前台內容載入層（Supabase → fallback）
    supabase/               # client / server / middleware / config
    admin/                  # useSingleton / useCollection / media / navigation
    types/                  # content.ts（前台）、database.ts（資料庫）
  middleware.ts             # 保護 /admin/*
supabase/migrations/        # SQL migration
scripts/seed.ts             # 初始資料匯入
public/images/              # 舊圖片（仍可正常讀取）
```

---

# Alex T Studio（後台）設定

## 1. 建立 Supabase 專案

1. 到 [supabase.com](https://supabase.com) 建立一個新的 Project
2. 記下 Project 的 URL 與 anon key：
   **Project Settings → API**（或 Data API / API Keys）

## 2. 建立資料表與安全政策

Supabase Dashboard → **SQL Editor** → New query，
把 `supabase/migrations/0001_init.sql` 整份貼上執行。

這份 SQL 會建立：

- 10 張資料表：`site_settings`、`home_content`、`about_content`、`coffee_entries`、
  `places`、`photos`、`technology_projects`、`projects`、`social_links`、`media`
- 每張表的 `updated_at` 自動更新 trigger
- **Row Level Security**：匿名訪客只能讀取 `published = true` 的內容，
  登入後才能新增／修改／刪除
- Storage bucket `media`（公開讀取、限登入者上傳、單檔 10MB、僅 jpg/png/webp）

## 3. 設定環境變數

複製範本並填入你的值：

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`.env.local` 已被 `.gitignore` 排除，不會進 git。

> `SUPABASE_SERVICE_ROLE_KEY` 只有執行 `npm run seed` 時需要。
> 它可以繞過所有 RLS，**絕對不要**加上 `NEXT_PUBLIC_` 前綴、
> 不要在任何前端程式碼引用、也不要 commit。

## 4. 建立第一個 Admin 帳號

後台**沒有註冊功能**。帳號一律在 Supabase 建立：

Supabase Dashboard → **Authentication → Users → Add user → Create new user**

- Email：你的 Email
- Password：自己設定
- 勾選 **Auto Confirm User**（不勾的話要先收確認信）

只有這裡建立過的帳號才能登入後台。

## 5. 匯入初始資料（選用）

把目前 `src/data` 的網站內容寫進資料庫，後台就會有東西可以編輯：

```bash
npm run seed
```

執行前要先在 `.env.local` 補上 `SUPABASE_SERVICE_ROLE_KEY`。
腳本會跳過已經有資料的表，可以安全重複執行。

不跑也沒關係 —— 後台第一次儲存時會自動建立設定列，
前台在資料庫沒資料時會繼續使用 `src/data`。

## 6. 第一次登入

```bash
npm run dev
```

打開 <http://localhost:3000/admin/login>，用步驟 4 建立的帳號登入，
成功後會跳轉到 `/admin`。

未登入直接開 `/admin/*` 一律會被導回登入頁。

---

## Vercel 部署

Project Settings → **Environment Variables**，加入：

| 變數 | 值 | 環境 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Production / Preview / Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Production / Preview / Development |

`SUPABASE_SERVICE_ROLE_KEY` **不需要**設定在 Vercel —— seed 腳本只在你自己的電腦上跑。

部署後記得到 `/admin/settings` 把 **Website URL** 改成正式網域，
sitemap、canonical 與 Open Graph 會跟著更新。

---

## 內容管理對照

| 想改什麼 | 後台頁面 | 沒有 Supabase 時改哪個檔案 |
| --- | --- | --- |
| Hero 大標、中文介紹、主視覺 | `/admin/home` | `src/data/hero.ts` |
| About 內文與 Interest Tags | `/admin/about` | `src/data/about.ts` |
| 咖啡紀錄 | `/admin/coffee` | `src/data/coffee.ts` |
| 花蓮／地點 | `/admin/places` | `src/data/places.ts` |
| 攝影作品 | `/admin/photography` | `src/data/photography.ts` |
| AI & Tech 專案 | `/admin/technology` | `src/data/tech.ts` |
| Selected Projects | `/admin/projects` | `src/data/projects.ts` |
| 社群連結 | `/admin/social` | `src/data/social.ts` |
| 網站名稱／SEO／Footer | `/admin/settings` | `src/data/site.ts` |
| 圖片 | `/admin/media` | `public/images/` |
| 顏色／字體／動畫速度 | — | `tailwind.config.ts` |
| 區塊順序 | — | `src/app/(site)/page.tsx` |

## 內容載入規則

前台每個區塊都是這個順序：

```
Supabase 有已發佈的資料  →  使用 Supabase
否則（沒資料／未設定／查詢失敗）  →  使用 src/data
```

所以資料庫壞掉或環境變數填錯，網站也只會退回原本的內容，不會出現空白頁。

## 圖片

- 後台上傳的新圖片 → Supabase Storage 的 `media` bucket
- 舊圖片 → 仍然從 `public/images/` 正常讀取

兩者可以並存，不需要一次搬完。詳見 `public/images/README.md`。

## Draft / Published

`coffee_entries`、`places`、`photos`、`technology_projects`、`projects`
都支援 Draft / Published：

- **Draft**：只有後台看得到
- **Published**：才會出現在公開網站

這是由資料庫的 RLS 政策強制執行的，不是只靠前端判斷。

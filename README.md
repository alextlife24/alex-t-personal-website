# Alex T — Coffee, Places & Ideas

Personal Journal / Portfolio。純前端展示網站，沒有登入、資料庫、CMS 或後台。

## 開發

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 產出正式版
npm run lint     # ESLint
npm run typecheck
```

## 資料夾結構

```
src/
  app/
    layout.tsx          # 字體、SEO metadata、Header/Footer 外框
    page.tsx            # 首頁區塊組裝順序
    globals.css         # Tailwind base、版心 .shell、共用樣式
    sitemap.ts robots.ts
  components/
    layout/             # Header、MobileMenu、Footer
    sections/           # Hero 與各個 Section
    ui/                 # SectionLabel、Reveal、Figure、SocialLink
  data/                 # 所有文字內容（改文案只需動這裡）
  lib/utils.ts
public/images/          # 照片（見該資料夾的 README）
tailwind.config.ts      # 色票、字體、動畫節奏
```

## 我要改東西的時候

| 想改什麼 | 改哪個檔案 |
| --- | --- |
| 網站標題 / SEO / 描述 | `src/data/site.ts` |
| 導覽列項目 | `src/data/navigation.ts` |
| Hero 大標與中文介紹 | `src/data/hero.ts` |
| About 內文 | `src/data/about.ts` |
| Coffee 三張卡片 | `src/data/coffee.ts` |
| Places 四個 Journal | `src/data/places.ts` |
| Photography 照片與相機 | `src/data/photography.ts` |
| AI & Tech 三個專案 | `src/data/tech.ts` |
| Selected Projects 清單 | `src/data/projects.ts` |
| 社群連結與 Contact 文案 | `src/data/social.ts` |
| 顏色 / 字體 / 動畫時間 | `tailwind.config.ts` |
| 區塊順序 | `src/app/page.tsx` |

## 換照片

1. 把圖片放進 `public/images/`
2. 到 `src/data/` 對應檔案，把 `image: null` 改成 `image: '/images/檔名.jpg'`

還沒填的位置會顯示「IMAGE / Replace later」的 Placeholder，不會壞版。
細節見 `public/images/README.md`。

## 上線前

把 `src/data/site.ts` 的 `url` 換成正式網域，sitemap 與 Open Graph 會跟著更新。

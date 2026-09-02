# 圖片放置說明

把照片放進這個資料夾（`public/images/`），檔名建議如下：

| 檔名 | 用途 | 建議比例 |
| --- | --- | --- |
| `hero-placeholder.jpg` | 首頁 Hero 主視覺 | 4:5 直式 |
| `coffee-01.jpg` | Coffee — The Brewing Process | 4:5 |
| `coffee-02.jpg` | Coffee — Coffee Journal | 4:5 |
| `hualien-01.jpg` | Places — A slow afternoon in Hualien | 4:5 |
| `hualien-02.jpg` | Places — Coffee shops worth returning to | 3:4 |
| `hualien-03.jpg` | Places — Brand New Day Hualien | 4:5 |
| `photo-01.jpg` | Photography — 大型直圖 | 4:5 |
| `photo-02.jpg` | Photography — 小圖 | 1:1 |
| `photo-03.jpg` | Photography — 小圖 | 3:4 |
| `photo-04.jpg` | Photography — 橫圖 | 3:2 |

## 放好圖片後要做什麼

到 `src/data/` 對應的檔案，把 `image: null` 改成圖片路徑即可，例如：

```ts
image: '/images/photo-01.jpg',
```

- Hero → `src/data/hero.ts`
- Coffee → `src/data/coffee.ts`
- Places → `src/data/places.ts`
- Photography → `src/data/photography.ts`

還沒填路徑的位置會自動顯示「IMAGE / Replace later」的 Placeholder 區塊，
不會影響版面或造成錯誤。

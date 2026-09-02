# Website Pet — 圖片放置說明

## 需要的五個檔案

| 檔名 | 對應狀態 | 建議姿勢 |
| --- | --- | --- |
| `cat-idle.png` | 站著發呆 | 四腳站立、面向前方或右方 |
| `cat-walk.png` | 走路 | 邁步中、面向右方 |
| `cat-sit.png` | 坐著 | 坐姿 |
| `cat-sleep.png` | 睡覺 | 蜷曲趴睡（橫式構圖沒問題） |
| `cat-curious.png` | 好奇張望 | 抬頭往上看 |

任何一張缺席時，**只有該狀態**會顯示虛線 Placeholder，其他狀態照常運作，
網站不會壞版。所以可以先放幾張，之後再補齊。

## 規格

| 項目 | 要求 | 原因 |
| --- | --- | --- |
| 格式 | PNG，**必須有透明通道** | 白底會在米色網頁上變成明顯的白方塊 |
| 檔名 | 全小寫 | Vercel 的 Linux 環境區分大小寫 |
| 方向 | **面向右邊** | 往左走時程式用 `transform: scaleX(-1)` 翻轉 |
| 尺寸 | 短邊 320–600px | 實際顯示 48–80px，多的解析度給高解析螢幕 |
| 檔案大小 | 每張建議 200KB 以內 | 每頁都會載入 |
| 裁切 | 貼齊輪廓，四周不留多餘透明邊 | 有留白會讓貓看起來浮在半空中 |

橫式的睡覺圖不需要特別處理 —— 元件用 `object-fit: contain` 搭配底部對齊，
蜷曲的貓會自然呈現「寬而低」的樣子，比例正確。

## 檢查透明背景

存檔後不確定有沒有透明通道的話，跟 Claude 說一聲，
可以直接讀取 PNG 標頭確認 color type，不需要自己判斷。

## 要改對應關係時

編輯 `src/components/pet/petConfig.ts` 的 `petImages`：

```ts
export const petImages: Record<PetState, string> = {
  idle: '/pet/cat-idle.png',
  walking: '/pet/cat-walk.png',
  sitting: '/pet/cat-sit.png',
  sleeping: '/pet/cat-sleep.png',
  curious: '/pet/cat-curious.png',
};
```

同一個檔案裡也可以調整各狀態出現的機率（`behaviourWeights`）
與停留時間（`stateDuration`）。元件本身不需要改動。

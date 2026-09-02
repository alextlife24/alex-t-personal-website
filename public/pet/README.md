# Website Pet — 圖片放置說明

## 目前需要的檔案

把正式的**透明背景 PNG** 放在這裡：

```
public/pet/alex-cat.png
```

檔案還不存在時，元件會顯示一個簡單的 Placeholder 方塊，
不會壞版、也不會出現錯誤。放進檔案後重新整理即可看到貓咪。

### 建議規格

| 項目 | 建議 |
| --- | --- |
| 格式 | PNG，透明背景 |
| 尺寸 | 短邊至少 320px（顯示時最大約 80px，預留 Retina 用） |
| 構圖 | 貓咪面向**右邊**、四腳著地、完整入鏡 |
| 留白 | 四周不要留多餘透明邊，否則看起來會浮在半空中 |
| 檔案大小 | 建議 200KB 以內 |

面向右邊很重要：程式在往左走時會用 `transform: scaleX(-1)` 自動翻轉。
如果原圖面向左邊，方向就會全部相反。

## 未來要升級成多張圖時

之後如果想讓不同狀態使用不同圖片，把檔案放在同一個資料夾：

```
public/pet/cat-idle.png       # 站著
public/pet/cat-walk.png       # 走路
public/pet/cat-sleep.png      # 睡覺
public/pet/cat-sit.png        # 坐著
public/pet/cat-curious.png    # 好奇張望
```

然後只要修改 `src/components/pet/petConfig.ts` 裡的 `petImages` 對照表：

```ts
export const petImages: Record<PetState, string> = {
  idle: '/pet/cat-idle.png',
  walking: '/pet/cat-walk.png',
  sleeping: '/pet/cat-sleep.png',
  curious: '/pet/cat-curious.png',
};
```

元件其他部分都不需要動。

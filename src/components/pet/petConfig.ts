/**
 * Website Pet 的設定集中在這裡。
 *
 * 日後要升級成多張圖片的動畫，只需要改 petImages 對照表，
 * 元件本身完全不用動。詳見 public/pet/README.md。
 */

export type PetState = 'idle' | 'walking' | 'sitting' | 'sleeping' | 'curious';

/**
 * 各狀態使用的圖片。
 * 檔案放在 public/pet/，詳見該資料夾的 README。
 *
 * 任何一張缺席時，該狀態會顯示 Placeholder，其他狀態不受影響。
 */
export const petImages: Record<PetState, string> = {
  idle: '/pet/cat-idle.png',
  walking: '/pet/cat-walk.png',
  sitting: '/pet/cat-sit.png',
  sleeping: '/pet/cat-sleep.png',
  curious: '/pet/cat-curious.png',
};

/** 下一個行為的機率權重 */
export const behaviourWeights: { state: PetState; weight: number }[] = [
  { state: 'walking', weight: 45 },
  { state: 'idle', weight: 18 },
  { state: 'sitting', weight: 12 },
  { state: 'sleeping', weight: 15 },
  { state: 'curious', weight: 10 },
];

/** 每個狀態停留的時間範圍（毫秒）。walking 的實際時間由距離與速度決定。 */
export const stateDuration: Record<PetState, [number, number]> = {
  idle: [3000, 8000],
  walking: [4000, 10000],
  sitting: [4000, 9000],
  sleeping: [8000, 15000],
  curious: [2500, 4000],
};

/** 移動速度（px / 秒）。手機刻意放慢。 */
export const walkSpeed = { desktop: [25, 45] as const, mobile: [16, 26] as const };

/** 點擊後隨機顯示的句子 */
export const petMessages = [
  'meow.',
  'hello.',
  '☕?',
  '又在看什麼？',
  '休息一下吧。',
  '花蓮今天也很好。',
];

/** 低機率彩蛋（5%） */
export const coffeeMessages = ['Coffee time?', '今天喝什麼豆子？'];
export const coffeeEggChance = 0.05;

/** 對話泡泡顯示時間 */
export const bubbleDuration = 2600;

/** localStorage key 與同步用的自訂事件名稱 */
export const PET_HIDDEN_KEY = 'websitePetHidden';
export const PET_VISIBILITY_EVENT = 'websitepet:visibility';

export function pickWeighted(): PetState {
  const total = behaviourWeights.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of behaviourWeights) {
    roll -= item.weight;
    if (roll <= 0) return item.state;
  }
  return 'idle';
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

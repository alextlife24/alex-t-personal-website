'use client';

import { useCallback, useEffect, useState } from 'react';
import { PET_HIDDEN_KEY, PET_VISIBILITY_EVENT } from './petConfig';

function readHidden(): boolean {
  try {
    return window.localStorage.getItem(PET_HIDDEN_KEY) === 'true';
  } catch {
    // 隱私模式或封鎖 storage 時，當作沒有隱藏
    return false;
  }
}

/**
 * 貓咪的顯示／隱藏狀態，存在 localStorage。
 *
 * WebsitePet 與 Footer 的「Bring the cat back」是兩棵不同的元件樹，
 * 因此用一個自訂事件讓兩邊即時同步，不需要 Context Provider。
 *
 * mounted 用來避免 SSR 與 CSR 的 hydration 不一致
 * （伺服器端讀不到 localStorage）。
 */
export function usePetVisibility() {
  const [hidden, setHiddenState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHiddenState(readHidden());
    setMounted(true);

    const sync = () => setHiddenState(readHidden());

    // 同一分頁內由自訂事件同步；跨分頁由 storage 事件同步
    window.addEventListener(PET_VISIBILITY_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(PET_VISIBILITY_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setHidden = useCallback((next: boolean) => {
    try {
      window.localStorage.setItem(PET_HIDDEN_KEY, String(next));
    } catch {
      // 無法寫入時仍然更新當下的畫面狀態
    }
    setHiddenState(next);
    window.dispatchEvent(new Event(PET_VISIBILITY_EVENT));
  }, []);

  return { hidden, setHidden, mounted };
}

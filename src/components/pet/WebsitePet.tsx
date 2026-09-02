'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import PetBubble, { type BubbleAlign } from './PetBubble';
import { usePetVisibility } from './usePetVisibility';
import {
  bubbleDuration,
  coffeeEggChance,
  coffeeMessages,
  petImages,
  petMessages,
  pickWeighted,
  randomBetween,
  stateDuration,
  walkSpeed,
  type PetState,
} from './petConfig';
import './pet.css';

/** 貓咪與畫面左右邊緣的安全距離 */
const EDGE_MARGIN = 12;

type Cycle = { state: PetState; id: number };

export default function WebsitePet() {
  const { hidden, setHidden, mounted } = usePetVisibility();

  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const [cycle, setCycle] = useState<Cycle>({ state: 'idle', id: 0 });
  const [x, setX] = useState(0);
  const [moveMs, setMoveMs] = useState(0);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [hovered, setHovered] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bubbleAlign, setBubbleAlign] = useState<BubbleAlign>('center');
  const [imageBroken, setImageBroken] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** 目前可以走動的最大 x（避免走出畫面造成水平捲軸） */
  const maxX = useCallback(() => {
    const width = rootRef.current?.offsetWidth ?? 52;
    return Math.max(0, window.innerWidth - width - EDGE_MARGIN * 2);
  }, []);

  // 讀取使用者的動態偏好與裝置類型
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');

    const syncMotion = () => setReduced(motion.matches);
    const syncPointer = () => setIsCoarse(coarse.matches);

    syncMotion();
    syncPointer();
    motion.addEventListener('change', syncMotion);
    coarse.addEventListener('change', syncPointer);

    return () => {
      motion.removeEventListener('change', syncMotion);
      coarse.removeEventListener('change', syncPointer);
    };
  }, []);

  // 起始位置：畫面右側，像剛從旁邊走進來
  useEffect(() => {
    if (!mounted || hidden) return;
    setX(Math.max(0, maxX() - randomBetween(0, 80)));
  }, [mounted, hidden, maxX]);

  // 視窗縮放時把貓咪拉回可視範圍
  useEffect(() => {
    if (!mounted || hidden) return;

    const onResize = () => {
      setMoveMs(0);
      setX((current) => Math.min(current, maxX()));
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mounted, hidden, maxX]);

  /** 把貓咪凍結在目前的實際位置（hover 時用） */
  const freeze = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    setMoveMs(0);
    setX(Math.round(matrix.m41));
  }, []);

  // ----------------------------------------------------------
  // 行為排程：每個 cycle 結束後隨機挑下一個行為
  // React 只負責選目標與計時，移動本身交給 CSS transition
  // ----------------------------------------------------------
  useEffect(() => {
    if (!mounted || hidden) return;

    // Reduce Motion：不走動，靜靜待在右下角
    if (reduced) {
      clearTimer();
      setMoveMs(0);
      setX(maxX());
      return;
    }

    // 滑鼠停在貓咪上：停下來等使用者
    if (hovered) {
      clearTimer();
      freeze();
      return;
    }

    const next = () =>
      setCycle((current) => ({ state: pickWeighted(), id: current.id + 1 }));

    if (cycle.state === 'walking') {
      const [minSpeed, maxSpeed] = isCoarse ? walkSpeed.mobile : walkSpeed.desktop;
      const speed = randomBetween(minSpeed, maxSpeed);
      const [minMs, maxMs] = stateDuration.walking;

      const limit = maxX();
      const wanted = (randomBetween(minMs, maxMs) / 1000) * speed;
      const direction = Math.random() < 0.5 ? -1 : 1;

      setX((current) => {
        // 先試想要的方向，撞到邊界就往反方向走
        let target = current + wanted * direction;
        if (target < 0 || target > limit) target = current - wanted * direction;
        target = Math.min(limit, Math.max(0, target));

        const distance = Math.abs(target - current);
        if (distance < 4) {
          // 幾乎沒得走，改成站著
          setMoveMs(0);
          timerRef.current = window.setTimeout(next, 1200);
          return current;
        }

        setFacing(target > current ? 'right' : 'left');
        const duration = (distance / speed) * 1000;
        setMoveMs(duration);
        timerRef.current = window.setTimeout(next, duration + 120);
        return target;
      });
    } else {
      setMoveMs(0);
      const [minMs, maxMs] = stateDuration[cycle.state];
      timerRef.current = window.setTimeout(next, randomBetween(minMs, maxMs));
    }

    return clearTimer;
  }, [cycle, mounted, hidden, hovered, reduced, isCoarse, clearTimer, freeze, maxX]);

  // 元件卸載時清乾淨
  useEffect(() => clearTimer, [clearTimer]);

  // ----------------------------------------------------------
  // 點擊：顯示一句話
  // ----------------------------------------------------------
  const bubbleTimer = useRef<number | null>(null);

  const speak = useCallback(() => {
    const pool =
      Math.random() < coffeeEggChance ? coffeeMessages : petMessages;
    const text = pool[Math.floor(Math.random() * pool.length)];

    // 依照目前位置決定泡泡對齊方向，避免超出螢幕
    const el = rootRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      if (center < window.innerWidth * 0.25) setBubbleAlign('left');
      else if (center > window.innerWidth * 0.75) setBubbleAlign('right');
      else setBubbleAlign('center');
    }

    setMessage(text);
    if (bubbleTimer.current !== null) window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setMessage(null), bubbleDuration);
  }, []);

  useEffect(() => {
    return () => {
      if (bubbleTimer.current !== null) window.clearTimeout(bubbleTimer.current);
    };
  }, []);

  if (!mounted || hidden) return null;

  const state = cycle.state;
  const src = petImages[state];

  return (
    <div
      ref={rootRef}
      className="pet-root"
      style={{
        transform: `translateX(${x + EDGE_MARGIN}px)`,
        transition: moveMs > 0 ? `transform ${moveMs}ms linear` : 'none',
      }}
    >
      <div className="pet-stage">
        {message && (
          <PetBubble
            message={message}
            align={bubbleAlign}
            onHide={() => {
              setMessage(null);
              setHidden(true);
            }}
          />
        )}

        <button
          type="button"
          className="pet-hitbox"
          onClick={speak}
          onMouseEnter={() => !isCoarse && setHovered(true)}
          onMouseLeave={() => !isCoarse && setHovered(false)}
          aria-label="Alex T's cat"
        >
          <span className="pet-sprite" data-state={state} data-facing={facing}>
            {imageBroken ? (
              <span className="pet-placeholder" aria-hidden>
                cat
              </span>
            ) : (
              <Image
                src={src}
                alt="Alex T's cat"
                fill
                sizes="80px"
                // 貓咪是 fixed 定位、永遠在視窗內，lazy 沒有意義，
                // 而且會讓圖片缺席時的 onError 不會觸發（請求根本沒發出）
                loading="eager"
                onError={() => setImageBroken(true)}
              />
            )}
          </span>

          {state === 'sleeping' && (
            <span className="pet-zzz" aria-hidden>
              <span>z</span>
              <span>z</span>
              <span>Z</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

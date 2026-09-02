'use client';

import { usePetVisibility } from './usePetVisibility';

/**
 * Footer 裡的小連結。
 * 只有在貓咪被隱藏時才會出現，點擊即可讓牠回來。
 */
export default function BringPetBack() {
  const { hidden, setHidden, mounted } = usePetVisibility();

  if (!mounted || !hidden) return null;

  return (
    <button
      type="button"
      onClick={() => setHidden(false)}
      className="mt-4 block font-sans text-[0.6875rem] tracking-wide text-ink/35 underline decoration-ink/20 underline-offset-4 transition-colors duration-400 ease-editorial hover:text-coffee hover:decoration-coffee/40"
    >
      Bring the cat back
    </button>
  );
}

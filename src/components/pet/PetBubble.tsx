'use client';

export type BubbleAlign = 'left' | 'center' | 'right';

type PetBubbleProps = {
  message: string;
  align: BubbleAlign;
  onHide: () => void;
};

/**
 * 貓咪頭上的小紙條。
 * 右側的 × 讓使用者把貓咪收起來。
 */
export default function PetBubble({ message, align, onHide }: PetBubbleProps) {
  return (
    <div className="pet-bubble" data-align={align} role="status">
      <span className="pet-bubble-text">{message}</span>
      <button
        type="button"
        className="pet-bubble-hide"
        onClick={(event) => {
          event.stopPropagation();
          onHide();
        }}
        aria-label="Hide pet"
        title="Hide pet"
      >
        ×
      </button>
    </div>
  );
}

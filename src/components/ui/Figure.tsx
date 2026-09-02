import Image from 'next/image';
import { cn } from '@/lib/utils';

type FigureProps = {
  /** 圖片路徑（例如 '/images/photo-01.jpg'）。null 時顯示 Placeholder。 */
  src: string | null;
  alt: string;
  /** Tailwind 比例類別，例如 'aspect-[4/5]' */
  ratio?: string;
  className?: string;
  /** 傳給 next/image 的 sizes，協助挑選正確解析度 */
  sizes?: string;
  priority?: boolean;
  /** Hover 時是否要有極輕微的放大 */
  zoomOnHover?: boolean;
  children?: React.ReactNode;
};

/**
 * 統一的圖片容器。
 *
 * 圖片還沒準備好時 → 顯示「IMAGE / Replace later」的 Placeholder 區塊。
 * 要換成真實照片：把檔案放進 public/images/，再到 src/data/ 對應檔案把
 * image: null 改成 image: '/images/xxx.jpg' 即可，不需要改動元件。
 */
export default function Figure({
  src,
  alt,
  ratio = 'aspect-[4/5]',
  className,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  zoomOnHover = true,
  children,
}: FigureProps) {
  return (
    <div className={cn('relative overflow-hidden bg-sand', ratio, className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            'object-cover',
            zoomOnHover &&
              'transition-transform duration-700 ease-editorial group-hover:scale-[1.03]',
          )}
        />
      ) : (
        <div
          role="img"
          aria-label={`${alt}（圖片待補）`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-beige bg-sand"
        >
          <span className="label-text text-ink/40">IMAGE</span>
          <span className="font-sans text-[0.6875rem] tracking-wide text-ink/30">
            Replace later
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

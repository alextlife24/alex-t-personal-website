import Image from 'next/image';
import { cn } from '@/lib/utils';

export type ImageFit = 'cover' | 'contain';

/** 前台各種版面共用的比例名稱。original 代表沿用照片自己的比例。 */
export type RatioPreset =
  | 'original'
  | 'landscape'
  | 'portrait'
  | 'square'
  | 'panorama'
  | 'tall';

const ratioValue: Record<Exclude<RatioPreset, 'original'>, string> = {
  landscape: '3 / 2',
  portrait: '4 / 5',
  square: '1 / 1',
  panorama: '16 / 7',
  tall: '3 / 4',
};

export type SmartImageSource = {
  url: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  caption?: string | null;
};

type SmartImageProps = {
  image: SmartImageSource;
  /**
   * 顯示比例。
   * 'original' 會使用照片本身的長寬比，橫式、直式、方形、全景都不會被裁切。
   * 指定其他值時會裁切成該比例（fit 預設 cover）。
   */
  ratio?: RatioPreset;
  /**
   * cover：填滿容器並裁切，適合封面。
   * contain：完整顯示整張照片，適合攝影作品。
   */
  fit?: ImageFit;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** 沒有圖片時 placeholder 的高度比例 */
  fallbackRatio?: Exclude<RatioPreset, 'original'>;
  zoomOnHover?: boolean;
  children?: React.ReactNode;
};

/**
 * 通用圖片元件。
 *
 * 設計原則：
 * - 不要求使用者預先裁切成固定尺寸
 * - 照片絕不會被不合理拉伸（一律 object-fit，不用 fill 拉伸）
 * - 有記錄原始寬高時，'original' 模式會用真實比例排版，避免版面跳動
 * - 焦點（focal_x / focal_y）決定 cover 裁切時保留畫面的哪個部分
 */
export default function SmartImage({
  image,
  ratio = 'original',
  fit = 'cover',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  className,
  fallbackRatio = 'landscape',
  zoomOnHover = false,
  children,
}: SmartImageProps) {
  const { url, alt, width, height, focalX, focalY } = image;

  const naturalRatio =
    width && height && width > 0 && height > 0 ? `${width} / ${height}` : null;

  // original 模式優先使用照片真實比例；沒有尺寸資料時退回 fallbackRatio
  const aspectRatio =
    ratio === 'original'
      ? (naturalRatio ?? ratioValue[fallbackRatio])
      : ratioValue[ratio];

  const objectPosition =
    fit === 'cover'
      ? `${Math.round((focalX ?? 0.5) * 100)}% ${Math.round((focalY ?? 0.5) * 100)}%`
      : 'center';

  return (
    <div
      className={cn('relative overflow-hidden bg-sand', className)}
      style={{ aspectRatio }}
    >
      {url ? (
        <Image
          src={url}
          alt={alt ?? ''}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: fit, objectPosition }}
          className={cn(
            zoomOnHover &&
              'transition-transform duration-700 ease-editorial group-hover:scale-[1.03]',
          )}
        />
      ) : (
        <div
          role="img"
          aria-label={`${alt ?? '圖片'}（待補）`}
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

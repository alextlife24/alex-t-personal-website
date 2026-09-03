import SmartImage from '@/components/ui/SmartImage';
import type { Gallery, GalleryImage } from '@/lib/types/journal';
import { cn } from '@/lib/utils';

/**
 * Gallery 的五種版式。
 *
 * 共同原則：
 * - 一律用 object-fit，照片不會被拉伸變形
 * - masonry / carousel / filmstrip 保留每張照片的原始比例
 * - editorial / grid 會裁切，但以焦點為中心
 * - 手機一律改為單欄或可橫向滑動的容器，不產生頁面水平捲動
 */

function Caption({ image }: { image: GalleryImage }) {
  if (!image.caption) return null;
  return (
    <figcaption className="mt-2 font-sans text-xs leading-relaxed text-ink/45">
      {image.caption}
    </figcaption>
  );
}

function Frame({
  image,
  ratio,
  fit = 'cover',
  sizes,
  className,
}: {
  image: GalleryImage;
  ratio: 'original' | 'landscape' | 'portrait' | 'square' | 'panorama';
  fit?: 'cover' | 'contain';
  sizes: string;
  className?: string;
}) {
  return (
    <figure className={cn('group', className)}>
      <SmartImage
        image={{
          url: image.url,
          alt: image.alt,
          width: image.width,
          height: image.height,
          focalX: image.focalX,
          focalY: image.focalY,
        }}
        ratio={ratio}
        fit={fit}
        sizes={sizes}
        zoomOnHover
      />
      <Caption image={image} />
    </figure>
  );
}

export default function GalleryView({ gallery }: { gallery: Gallery }) {
  const images = gallery.images;
  if (images.length === 0) return null;

  if (gallery.style === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {images.map((image) => (
          <Frame
            key={image.id}
            image={image}
            ratio="square"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ))}
      </div>
    );
  }

  if (gallery.style === 'masonry') {
    // CSS columns 會保留每張照片的原始比例，橫直混排也不會變形
    return (
      <div className="columns-2 gap-3 sm:gap-4 md:columns-3 [&>figure]:mb-3 sm:[&>figure]:mb-4">
        {images.map((image) => (
          <Frame
            key={image.id}
            image={image}
            ratio="original"
            sizes="(max-width: 768px) 50vw, 33vw"
            className="break-inside-avoid"
          />
        ))}
      </div>
    );
  }

  if (gallery.style === 'carousel') {
    return (
      <div className="-mx-5 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 [scrollbar-width:thin]">
        <div className="flex snap-x snap-mandatory gap-4">
          {images.map((image) => (
            <Frame
              key={image.id}
              image={image}
              ratio="original"
              fit="contain"
              sizes="(max-width: 768px) 85vw, 60vw"
              className="w-[85vw] shrink-0 snap-center sm:w-[60vw] lg:w-[46vw]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (gallery.style === 'filmstrip') {
    return (
      <div className="-mx-5 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8">
        <div className="flex items-end gap-2 border-y border-ink/10 py-3">
          {images.map((image) => (
            <Frame
              key={image.id}
              image={image}
              ratio="original"
              sizes="180px"
              className="w-[42vw] shrink-0 sm:w-[220px]"
            />
          ))}
        </div>
      </div>
    );
  }

  // editorial：不對稱交錯，每三張一組
  return (
    <div className="space-y-6 sm:space-y-8">
      {chunk(images, 3).map((group, index) => (
        <div
          key={group[0]?.id ?? index}
          className={cn(
            'grid grid-cols-1 gap-4 sm:gap-5',
            group.length === 1 && 'sm:grid-cols-1',
            group.length === 2 && 'sm:grid-cols-12',
            group.length === 3 && 'sm:grid-cols-12',
          )}
        >
          {group.map((image, position) => (
            <Frame
              key={image.id}
              image={image}
              ratio="original"
              sizes="(max-width: 640px) 100vw, 50vw"
              className={cn(
                group.length === 2 &&
                  (position === 0 ? 'sm:col-span-7' : 'sm:col-span-5 sm:pt-10'),
                group.length === 3 &&
                  (position === 0
                    ? 'sm:col-span-7'
                    : position === 1
                      ? 'sm:col-span-5 sm:pt-12'
                      : 'sm:col-span-8 sm:col-start-3'),
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

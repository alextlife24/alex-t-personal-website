import { MapPin } from 'lucide-react';
import GalleryView from '@/components/journal/GalleryView';
import SmartImage from '@/components/ui/SmartImage';
import type {
  Block,
  CoffeeNoteContent,
  HeadingContent,
  ImageContent,
  ImageSettings,
  LocationContent,
  ParagraphContent,
  QuoteContent,
  SpacerContent,
} from '@/lib/types/journal';
import { cn } from '@/lib/utils';

/** 內文寬度：normal 置中易讀、wide 稍寬、full 滿版 */
const widthClass = {
  normal: 'mx-auto max-w-[42rem]',
  wide: 'mx-auto max-w-[58rem]',
  full: 'w-full',
} as const;

const spacerClass = {
  small: 'h-8',
  medium: 'h-16',
  large: 'h-28',
} as const;

function Paragraph({ block }: { block: Block }) {
  const { text } = block.content as unknown as ParagraphContent;
  if (!text?.trim()) return null;

  return (
    <div className={widthClass.normal}>
      {text.split('\n').map((line, index) =>
        line.trim() ? (
          <p
            key={index}
            className="mb-5 font-tc text-[1.0625rem] leading-[2] text-ink/80 last:mb-0"
          >
            {line}
          </p>
        ) : null,
      )}
    </div>
  );
}

function Heading({ block }: { block: Block }) {
  const { text, level } = block.content as unknown as HeadingContent;
  if (!text?.trim()) return null;

  if (level === 3) {
    return (
      <h3
        className={cn(
          widthClass.normal,
          'font-serif text-2xl leading-snug text-ink sm:text-[1.75rem]',
        )}
      >
        {text}
      </h3>
    );
  }

  return (
    <h2
      className={cn(
        widthClass.normal,
        'font-serif text-3xl leading-tight text-ink sm:text-4xl',
      )}
    >
      {text}
    </h2>
  );
}

function ImageBlock({ block }: { block: Block }) {
  const content = block.content as unknown as ImageContent;
  const settings = block.settings as unknown as Partial<ImageSettings>;
  if (!content.url) return null;

  const width = settings.width ?? 'normal';

  return (
    <figure className={cn('group', widthClass[width])}>
      <SmartImage
        image={{
          url: content.url,
          alt: content.alt,
          width: content.width,
          height: content.height,
          focalX: content.focalX,
          focalY: content.focalY,
        }}
        ratio={settings.ratio ?? 'original'}
        fit={settings.fit ?? 'cover'}
        sizes={
          width === 'full'
            ? '100vw'
            : width === 'wide'
              ? '(max-width: 768px) 100vw, 58rem'
              : '(max-width: 768px) 100vw, 42rem'
        }
      />
      {content.caption && (
        <figcaption className="mt-3 font-sans text-xs leading-relaxed text-ink/45">
          {content.caption}
        </figcaption>
      )}
    </figure>
  );
}

function Quote({ block }: { block: Block }) {
  const { text, attribution } = block.content as unknown as QuoteContent;
  if (!text?.trim()) return null;

  return (
    <blockquote
      className={cn(widthClass.normal, 'border-l border-coffee/40 pl-6 sm:pl-8')}
    >
      <p className="font-serif text-2xl leading-relaxed text-ink sm:text-[1.75rem]">
        {text}
      </p>
      {attribution && (
        <cite className="mt-4 block font-sans text-xs not-italic tracking-wide text-ink/45">
          — {attribution}
        </cite>
      )}
    </blockquote>
  );
}

function Location({ block }: { block: Block }) {
  const { name, detail, mapsUrl } = block.content as unknown as LocationContent;
  if (!name?.trim()) return null;

  const inner = (
    <>
      <MapPin
        aria-hidden
        strokeWidth={1.25}
        className="mt-0.5 h-4 w-4 shrink-0 text-coffee"
      />
      <span>
        <span className="block font-serif text-xl text-ink">{name}</span>
        {detail && (
          <span className="mt-1 block font-sans text-sm text-ink/55">{detail}</span>
        )}
      </span>
    </>
  );

  return (
    <div className={widthClass.normal}>
      {mapsUrl ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 border border-ink/10 bg-sand/60 p-5 transition-colors duration-400 ease-editorial hover:border-coffee/40"
        >
          {inner}
          <span
            aria-hidden
            className="ml-auto text-ink/30 transition-transform duration-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </a>
      ) : (
        <div className="flex items-start gap-3 border border-ink/10 bg-sand/60 p-5">
          {inner}
        </div>
      )}
    </div>
  );
}

function CoffeeNote({ block }: { block: Block }) {
  const note = block.content as unknown as CoffeeNoteContent;
  if (!note.coffeeName?.trim()) return null;

  const rows: [string, string | null][] = [
    ['ORIGIN', note.origin],
    ['PROCESS', note.process],
    ['ROASTER', note.roaster],
    ['BREWER', note.brewer],
  ];

  return (
    <div className={cn(widthClass.normal, 'border border-ink/10 bg-sand/60 p-6 sm:p-7')}>
      <p className="label-text text-coffee">COFFEE NOTE</p>
      <p className="mt-3 font-serif text-2xl text-ink">{note.coffeeName}</p>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
        {rows
          .filter(([, value]) => Boolean(value))
          .map(([label, value]) => (
            <div key={label}>
              <dt className="label-text text-ink/35">{label}</dt>
              <dd className="mt-1 font-sans text-sm text-ink/70">{value}</dd>
            </div>
          ))}
      </dl>

      {note.recipe && (
        <div className="mt-5 border-t border-ink/10 pt-4">
          <p className="label-text text-ink/35">RECIPE</p>
          <p className="mt-2 whitespace-pre-line font-sans text-sm leading-relaxed text-ink/70">
            {note.recipe}
          </p>
        </div>
      )}

      {note.flavourNotes?.length > 0 && (
        <div className="mt-5 border-t border-ink/10 pt-4">
          <p className="label-text text-ink/35">FLAVOUR</p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {note.flavourNotes.map((flavour) => (
              <li key={flavour} className="font-serif text-lg text-sage">
                {flavour}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** 依照 block type 渲染。未知型別直接略過，不會讓整頁壞掉。 */
export default function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <Paragraph block={block} />;
    case 'heading':
      return <Heading block={block} />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'gallery':
      return block.gallery ? (
        <div className={widthClass.wide}>
          {block.gallery.title && (
            <p className="label-text mb-4 text-ink/40">{block.gallery.title}</p>
          )}
          <GalleryView gallery={block.gallery} />
        </div>
      ) : null;
    case 'quote':
      return <Quote block={block} />;
    case 'divider':
      return (
        <div className={widthClass.normal}>
          <hr className="border-ink/12" />
        </div>
      );
    case 'spacer': {
      const { size } = block.content as unknown as SpacerContent;
      return <div aria-hidden className={spacerClass[size ?? 'medium']} />;
    }
    case 'location':
      return <Location block={block} />;
    case 'coffee-note':
      return <CoffeeNote block={block} />;
    default:
      return null;
  }
}

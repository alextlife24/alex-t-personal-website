'use client';

import { GripVertical, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import MediaPicker from '@/components/admin/MediaPicker';
import { Field, Select, TextInput } from '@/components/admin/Fields';
import { GALLERY_STYLES } from '@/lib/types/journal';
import type { GalleryStyle, MediaRow } from '@/lib/types/database';
import { cn } from '@/lib/utils';

export type DraftGalleryImage = {
  /** 已存在資料庫的列會有 id；新加入的暫時為 null */
  id: string | null;
  mediaId: string | null;
  url: string;
  alt: string;
  caption: string;
  width: number | null;
  height: number | null;
  focalX: number;
  focalY: number;
  isCover: boolean;
};

export type DraftGallery = {
  id: string | null;
  title: string;
  style: GalleryStyle;
  images: DraftGalleryImage[];
};

type GalleryEditorProps = {
  gallery: DraftGallery;
  onChange: (gallery: DraftGallery) => void;
};

/**
 * Gallery 編輯器。
 * 多選加入、拖曳排序、逐張 alt / caption、設定封面。
 * 不要求所有圖片同比例。
 */
export default function GalleryEditor({ gallery, onChange }: GalleryEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);

  const patchImage = (index: number, next: Partial<DraftGalleryImage>) => {
    onChange({
      ...gallery,
      images: gallery.images.map((image, i) =>
        i === index ? { ...image, ...next } : image,
      ),
    });
  };

  const addFromMedia = (media: MediaRow[]) => {
    const additions: DraftGalleryImage[] = media.map((item) => ({
      id: null,
      mediaId: item.id,
      url: item.public_url,
      alt: item.alt ?? '',
      caption: item.caption ?? '',
      width: item.width,
      height: item.height,
      focalX: Number(item.focal_x ?? 0.5),
      focalY: Number(item.focal_y ?? 0.5),
      isCover: false,
    }));
    onChange({ ...gallery, images: [...gallery.images, ...additions] });
  };

  const remove = (index: number) => {
    onChange({
      ...gallery,
      images: gallery.images.filter((_, i) => i !== index),
    });
    setEditing(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= gallery.images.length) return;
    const next = [...gallery.images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...gallery, images: next });
  };

  const drop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...gallery.images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    onChange({ ...gallery, images: next });
  };

  const setCover = (index: number) => {
    onChange({
      ...gallery,
      images: gallery.images.map((image, i) => ({ ...image, isCover: i === index })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Gallery Title" hint="可留空">
          <TextInput
            value={gallery.title}
            onChange={(value) => onChange({ ...gallery, title: value })}
          />
        </Field>
        <Field label="Style">
          <Select
            value={gallery.style}
            onChange={(value) => onChange({ ...gallery, style: value as GalleryStyle })}
            options={GALLERY_STYLES.map((style) => ({
              value: style.value,
              label: `${style.label} — ${style.hint}`,
            }))}
          />
        </Field>
      </div>

      <div className="flex items-center justify-between">
        <p className="label-text text-ink/45">{gallery.images.length} 張照片</p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="border border-ink/20 px-3 py-1.5 font-sans text-xs text-ink transition-colors duration-300 hover:border-coffee hover:text-coffee"
        >
          + Add Images
        </button>
      </div>

      {gallery.images.length === 0 ? (
        <p className="border border-dashed border-ink/15 p-6 text-center font-sans text-xs text-ink/40">
          還沒有照片。按 Add Images 一次選多張。
        </p>
      ) : (
        <>
          <p className="font-sans text-[0.6875rem] text-ink/35">
            桌機可拖曳縮圖排序；手機請用 ↑ ↓。點縮圖可編輯 alt 與說明文字。
          </p>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {gallery.images.map((image, index) => (
              <li
                key={`${image.url}-${index}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => drop(index)}
                className={cn(
                  'group relative border bg-paper',
                  editing === index ? 'border-coffee' : 'border-ink/10',
                  dragIndex === index && 'opacity-40',
                )}
              >
                <button
                  type="button"
                  onClick={() => setEditing(editing === index ? null : index)}
                  className="block w-full"
                >
                  <span className="block aspect-square w-full overflow-hidden bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  </span>
                </button>

                {image.isCover && (
                  <span className="absolute left-1 top-1 bg-coffee px-1.5 py-0.5 text-[0.5rem] uppercase tracking-label text-paper">
                    Cover
                  </span>
                )}

                <div className="flex items-center justify-between border-t border-ink/10 px-1 py-1">
                  <span className="hidden text-ink/25 md:block">
                    <GripVertical aria-hidden strokeWidth={1.5} className="h-3 w-3" />
                  </span>
                  <span className="flex md:hidden">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="上移"
                      className="px-1 font-sans text-[0.625rem] text-ink/40 disabled:opacity-25"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === gallery.images.length - 1}
                      aria-label="下移"
                      className="px-1 font-sans text-[0.625rem] text-ink/40 disabled:opacity-25"
                    >
                      ↓
                    </button>
                  </span>

                  <span className="flex">
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      aria-label="設為封面"
                      className={cn(
                        'px-1 transition-colors',
                        image.isCover ? 'text-coffee' : 'text-ink/30 hover:text-coffee',
                      )}
                    >
                      <Star
                        aria-hidden
                        strokeWidth={1.5}
                        className="h-3 w-3"
                        fill={image.isCover ? 'currentColor' : 'none'}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label="移除"
                      className="px-1 text-ink/30 transition-colors hover:text-red-800"
                    >
                      <Trash2 aria-hidden strokeWidth={1.5} className="h-3 w-3" />
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {editing !== null && gallery.images[editing] && (
        <div className="border border-coffee/30 bg-sand/60 p-4">
          <p className="label-text mb-3 text-coffee">
            IMAGE {editing + 1}
            {gallery.images[editing].width && gallery.images[editing].height
              ? ` · ${gallery.images[editing].width}×${gallery.images[editing].height}`
              : ''}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Alt Text" hint="給讀螢幕軟體與 SEO">
              <TextInput
                value={gallery.images[editing].alt}
                onChange={(value) => patchImage(editing, { alt: value })}
              />
            </Field>
            <Field label="Caption" hint="顯示在照片下方">
              <TextInput
                value={gallery.images[editing].caption}
                onChange={(value) => patchImage(editing, { caption: value })}
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="mt-3 font-sans text-xs text-ink/45 underline underline-offset-4 hover:text-coffee"
          >
            收合
          </button>
        </div>
      )}

      <MediaPicker
        open={pickerOpen}
        mode="multiple"
        title="Add images to gallery"
        onClose={() => setPickerOpen(false)}
        onSelect={addFromMedia}
      />
    </div>
  );
}

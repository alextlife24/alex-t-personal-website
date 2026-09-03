'use client';

import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import MediaPicker from '@/components/admin/MediaPicker';
import GalleryEditor, {
  type DraftGallery,
} from '@/components/admin/journal/GalleryEditor';
import { Field, Select, TagInput, TextArea, TextInput } from '@/components/admin/Fields';
import {
  BLOCK_LABELS,
  defaultContent,
  defaultSettings,
  type CoffeeNoteContent,
  type HeadingContent,
  type ImageContent,
  type ImageSettings,
  type LocationContent,
  type ParagraphContent,
  type QuoteContent,
  type SpacerContent,
} from '@/lib/types/journal';
import type { BlockType, MediaRow } from '@/lib/types/database';
import { cn } from '@/lib/utils';

export type DraftBlock = {
  /** 已存在資料庫的區塊會有 id；新增的為 null */
  id: string | null;
  type: BlockType;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  /** gallery 區塊的草稿內容 */
  gallery?: DraftGallery;
};

const BLOCK_ORDER: BlockType[] = [
  'paragraph',
  'heading',
  'image',
  'gallery',
  'quote',
  'location',
  'coffee-note',
  'divider',
  'spacer',
];

export function makeBlock(type: BlockType): DraftBlock {
  return {
    id: null,
    type,
    content: defaultContent(type),
    settings: defaultSettings(type),
    ...(type === 'gallery'
      ? { gallery: { id: null, title: '', style: 'editorial' as const, images: [] } }
      : {}),
  };
}

type BlockEditorProps = {
  blocks: DraftBlock[];
  onChange: (blocks: DraftBlock[]) => void;
};

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [imagePickerFor, setImagePickerFor] = useState<number | null>(null);

  const patch = (index: number, next: Partial<DraftBlock>) =>
    onChange(blocks.map((block, i) => (i === index ? { ...block, ...next } : block)));

  const patchContent = (index: number, next: Record<string, unknown>) =>
    patch(index, { content: { ...blocks[index].content, ...next } });

  const patchSettings = (index: number, next: Record<string, unknown>) =>
    patch(index, { settings: { ...blocks[index].settings, ...next } });

  const add = (type: BlockType) => {
    onChange([...blocks, makeBlock(type)]);
    setAddOpen(false);
  };

  const remove = (index: number) => onChange(blocks.filter((_, i) => i !== index));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const drop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...blocks];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    onChange(next);
  };

  const applyImage = (index: number, media: MediaRow) => {
    patchContent(index, {
      url: media.public_url,
      alt: media.alt ?? '',
      caption: media.caption ?? '',
      width: media.width,
      height: media.height,
      focalX: Number(media.focal_x ?? 0.5),
      focalY: Number(media.focal_y ?? 0.5),
    });
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 && (
        <p className="border border-dashed border-ink/15 p-8 text-center font-sans text-sm text-ink/40">
          文章還沒有任何區塊。從下方新增第一個。
        </p>
      )}

      <ul className="space-y-3">
        {blocks.map((block, index) => (
          <li
            key={block.id ?? `new-${index}-${block.type}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => drop(index)}
            className={cn(
              'border border-ink/10 bg-paper',
              dragIndex === index && 'opacity-40',
            )}
          >
            {/* 區塊標題列 */}
            <div className="flex items-center gap-2 border-b border-ink/10 bg-sand/50 px-3 py-2">
              <span className="hidden cursor-grab text-ink/25 md:block">
                <GripVertical aria-hidden strokeWidth={1.5} className="h-4 w-4" />
              </span>
              <span className="label-text flex-1 text-ink/50">
                {String(index + 1).padStart(2, '0')} · {BLOCK_LABELS[block.type]}
              </span>

              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="上移"
                className="p-1 text-ink/40 transition-colors hover:text-coffee disabled:opacity-25"
              >
                <ChevronUp aria-hidden strokeWidth={1.5} className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
                aria-label="下移"
                className="p-1 text-ink/40 transition-colors hover:text-coffee disabled:opacity-25"
              >
                <ChevronDown aria-hidden strokeWidth={1.5} className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="刪除區塊"
                className="p-1 text-ink/40 transition-colors hover:text-red-800"
              >
                <Trash2 aria-hidden strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </div>

            {/* 區塊內容 */}
            <div className="p-4">
              {block.type === 'paragraph' && (
                <TextArea
                  value={(block.content as unknown as ParagraphContent).text ?? ''}
                  onChange={(value) => patchContent(index, { text: value })}
                  rows={6}
                  placeholder="輸入段落文字，換行會自動分段。"
                />
              )}

              {block.type === 'heading' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <Field label="Text" className="sm:col-span-3">
                    <TextInput
                      value={(block.content as unknown as HeadingContent).text ?? ''}
                      onChange={(value) => patchContent(index, { text: value })}
                    />
                  </Field>
                  <Field label="Level">
                    <Select
                      value={String(
                        (block.content as unknown as HeadingContent).level ?? 2,
                      )}
                      onChange={(value) =>
                        patchContent(index, { level: Number(value) as 2 | 3 })
                      }
                      options={[
                        { value: '2', label: 'H2 大標' },
                        { value: '3', label: 'H3 小標' },
                      ]}
                    />
                  </Field>
                </div>
              )}

              {block.type === 'image' && (
                <ImageBlockFields
                  content={block.content as unknown as ImageContent}
                  settings={block.settings as unknown as Partial<ImageSettings>}
                  onPick={() => setImagePickerFor(index)}
                  onContent={(next) => patchContent(index, next)}
                  onSettings={(next) => patchSettings(index, next)}
                />
              )}

              {block.type === 'gallery' && block.gallery && (
                <GalleryEditor
                  gallery={block.gallery}
                  onChange={(gallery) => patch(index, { gallery })}
                />
              )}

              {block.type === 'quote' && (
                <div className="space-y-3">
                  <Field label="Quote">
                    <TextArea
                      value={(block.content as unknown as QuoteContent).text ?? ''}
                      onChange={(value) => patchContent(index, { text: value })}
                      rows={3}
                    />
                  </Field>
                  <Field label="Attribution" hint="可留空">
                    <TextInput
                      value={
                        (block.content as unknown as QuoteContent).attribution ?? ''
                      }
                      onChange={(value) => patchContent(index, { attribution: value })}
                    />
                  </Field>
                </div>
              )}

              {block.type === 'location' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Name">
                    <TextInput
                      value={(block.content as unknown as LocationContent).name ?? ''}
                      onChange={(value) => patchContent(index, { name: value })}
                    />
                  </Field>
                  <Field label="Detail" hint="地址或一句描述">
                    <TextInput
                      value={(block.content as unknown as LocationContent).detail ?? ''}
                      onChange={(value) => patchContent(index, { detail: value })}
                    />
                  </Field>
                  <Field label="Google Maps URL" className="sm:col-span-2">
                    <TextInput
                      type="url"
                      value={
                        (block.content as unknown as LocationContent).mapsUrl ?? ''
                      }
                      onChange={(value) => patchContent(index, { mapsUrl: value })}
                    />
                  </Field>
                </div>
              )}

              {block.type === 'coffee-note' && (
                <CoffeeNoteFields
                  content={block.content as unknown as CoffeeNoteContent}
                  onChange={(next) => patchContent(index, next)}
                />
              )}

              {block.type === 'divider' && (
                <p className="font-sans text-xs text-ink/35">
                  一條細分隔線，沒有可調整的選項。
                </p>
              )}

              {block.type === 'spacer' && (
                <Field label="Size">
                  <Select
                    value={(block.content as unknown as SpacerContent).size ?? 'medium'}
                    onChange={(value) => patchContent(index, { size: value })}
                    options={[
                      { value: 'small', label: 'Small' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'large', label: 'Large' },
                    ]}
                  />
                </Field>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* 新增區塊 */}
      <div className="border border-dashed border-ink/20 p-3">
        {addOpen ? (
          <div>
            <p className="label-text mb-3 text-ink/45">選擇區塊型別</p>
            <div className="flex flex-wrap gap-2">
              {BLOCK_ORDER.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => add(type)}
                  className="border border-ink/15 px-3 py-1.5 font-sans text-xs text-ink transition-colors duration-300 hover:border-coffee hover:text-coffee"
                >
                  {BLOCK_LABELS[type]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="mt-3 font-sans text-xs text-ink/40 underline underline-offset-4 hover:text-coffee"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex w-full items-center justify-center gap-2 py-2 font-sans text-sm text-ink/60 transition-colors duration-300 hover:text-coffee"
          >
            <Plus aria-hidden strokeWidth={1.5} className="h-4 w-4" />
            Add Block
          </button>
        )}
      </div>

      <MediaPicker
        open={imagePickerFor !== null}
        mode="single"
        title="Choose an image"
        onClose={() => setImagePickerFor(null)}
        onSelect={(media) => {
          if (imagePickerFor !== null && media[0]) applyImage(imagePickerFor, media[0]);
        }}
      />
    </div>
  );
}

function ImageBlockFields({
  content,
  settings,
  onPick,
  onContent,
  onSettings,
}: {
  content: ImageContent;
  settings: Partial<ImageSettings>;
  onPick: () => void;
  onContent: (next: Record<string, unknown>) => void;
  onSettings: (next: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="w-full max-w-[9rem] shrink-0 overflow-hidden border border-ink/15 bg-sand">
          {content.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.url} alt="" className="w-full object-contain" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center">
              <span className="label-text text-ink/30">NO IMAGE</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <button
            type="button"
            onClick={onPick}
            className="border border-ink/20 px-4 py-2 font-sans text-sm text-ink transition-colors duration-300 hover:border-coffee hover:text-coffee"
          >
            {content.url ? 'Replace Image' : 'Choose Image'}
          </button>

          {content.width && content.height && (
            <p className="font-sans text-xs text-ink/40">
              原始尺寸 {content.width}×{content.height}
              （比例 {(content.width / content.height).toFixed(2)}）
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Display" hint="Original 不裁切">
          <Select
            value={settings.ratio ?? 'original'}
            onChange={(value) => onSettings({ ratio: value })}
            options={[
              { value: 'original', label: 'Original' },
              { value: 'landscape', label: 'Landscape 3:2' },
              { value: 'portrait', label: 'Portrait 4:5' },
              { value: 'square', label: 'Square 1:1' },
              { value: 'panorama', label: 'Panorama 16:7' },
            ]}
          />
        </Field>
        <Field label="Fit">
          <Select
            value={settings.fit ?? 'cover'}
            onChange={(value) => onSettings({ fit: value })}
            options={[
              { value: 'cover', label: 'Cover 填滿裁切' },
              { value: 'contain', label: 'Contain 完整顯示' },
            ]}
          />
        </Field>
        <Field label="Width">
          <Select
            value={settings.width ?? 'normal'}
            onChange={(value) => onSettings({ width: value })}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'wide', label: 'Wide' },
              { value: 'full', label: 'Full' },
            ]}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Alt Text">
          <TextInput
            value={content.alt ?? ''}
            onChange={(value) => onContent({ alt: value })}
          />
        </Field>
        <Field label="Caption">
          <TextInput
            value={content.caption ?? ''}
            onChange={(value) => onContent({ caption: value })}
          />
        </Field>
      </div>
    </div>
  );
}

function CoffeeNoteFields({
  content,
  onChange,
}: {
  content: CoffeeNoteContent;
  onChange: (next: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Coffee Name" className="sm:col-span-2">
          <TextInput
            value={content.coffeeName ?? ''}
            onChange={(value) => onChange({ coffeeName: value })}
          />
        </Field>
        <Field label="Origin">
          <TextInput
            value={content.origin ?? ''}
            onChange={(value) => onChange({ origin: value })}
          />
        </Field>
        <Field label="Process">
          <TextInput
            value={content.process ?? ''}
            onChange={(value) => onChange({ process: value })}
          />
        </Field>
        <Field label="Roaster">
          <TextInput
            value={content.roaster ?? ''}
            onChange={(value) => onChange({ roaster: value })}
          />
        </Field>
        <Field label="Brewer">
          <TextInput
            value={content.brewer ?? ''}
            onChange={(value) => onChange({ brewer: value })}
          />
        </Field>
      </div>
      <Field label="Recipe">
        <TextArea
          value={content.recipe ?? ''}
          onChange={(value) => onChange({ recipe: value })}
          rows={3}
        />
      </Field>
      <Field label="Flavour Notes" hint="輸入後按 Enter">
        <TagInput
          values={content.flavourNotes ?? []}
          onChange={(values) => onChange({ flavourNotes: values })}
          placeholder="Orange Blossom / Honey…"
        />
      </Field>
    </div>
  );
}

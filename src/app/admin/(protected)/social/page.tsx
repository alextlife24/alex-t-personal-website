'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import EditorShell, { Panel } from '@/components/admin/EditorShell';
import { Field, TextInput, Toggle } from '@/components/admin/Fields';
import { useToast } from '@/components/admin/Toast';
import { getBrowserClient } from '@/lib/supabase/client';
import type { SocialPlatform } from '@/lib/types/database';

type SocialForm = {
  platform: SocialPlatform;
  name: string;
  handle: string;
  url: string;
  icon: string | null;
  enabled: boolean;
  sort_order: number;
};

/**
 * 固定的七個平台。
 * 後台不提供「新增平台」，資料庫也有 CHECK constraint 擋住其他社群，
 * 因此不可能出現 Facebook / LinkedIn / YouTube 等未指定的平台。
 */
const PLATFORMS: SocialForm[] = [
  {
    platform: 'tiktok',
    name: 'TikTok',
    handle: '@evanln_24',
    url: 'https://www.tiktok.com/@evanln_24',
    icon: null,
    enabled: true,
    sort_order: 0,
  },
  {
    platform: 'google_maps',
    name: 'Google Maps',
    handle: 'Local Guide',
    url: 'https://www.google.com/maps/contrib/@23.9736368,121.5712493,13z/data=!4m4!8m3!1e3!3m1!1e1?entry=ttu&g_ep=EgoyMDI2MDgzMC4wIKXMDSoASAFQAw%3D%3D',
    icon: 'map',
    enabled: true,
    sort_order: 1,
  },
  {
    platform: 'x',
    name: 'X',
    handle: '@evanln_24',
    url: 'https://x.com/evanln_24',
    icon: null,
    enabled: true,
    sort_order: 2,
  },
  {
    platform: 'threads',
    name: 'Threads',
    handle: '@evanln_24',
    url: 'https://www.threads.com/@evanln_24',
    icon: null,
    enabled: true,
    sort_order: 3,
  },
  {
    platform: 'instagram',
    name: 'Instagram',
    handle: '@uni_akumadesu',
    url: 'https://www.instagram.com/uni_akumadesu',
    icon: 'instagram',
    enabled: true,
    sort_order: 4,
  },
  {
    platform: 'github',
    name: 'GitHub',
    handle: 'alextlife24',
    url: 'https://github.com/alextlife24',
    icon: 'github',
    enabled: true,
    sort_order: 5,
  },
  {
    platform: 'email',
    name: 'Email',
    handle: 'toby0702889@gmail.com',
    url: 'mailto:toby0702889@gmail.com',
    icon: 'mail',
    enabled: true,
    sort_order: 6,
  },
];

export default function AdminSocialPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<SocialForm[]>(PLATFORMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const baseline = useRef(JSON.stringify(PLATFORMS));

  const dirty = useMemo(() => JSON.stringify(rows) !== baseline.current, [rows]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const supabase = getBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true });

      if (cancelled) return;

      if (error) {
        toast(`讀取失敗：${error.message}`, 'error');
      } else if (data?.length) {
        // 以固定清單為主，資料庫有的就覆蓋，沒有的維持預設
        const merged = PLATFORMS.map((preset) => {
          const found = data.find((row) => row.platform === preset.platform);
          return found
            ? {
                platform: found.platform,
                name: found.name,
                handle: found.handle ?? '',
                url: found.url,
                icon: found.icon,
                enabled: found.enabled,
                sort_order: found.sort_order,
              }
            : preset;
        });
        setRows(merged);
        baseline.current = JSON.stringify(merged);
      }

      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (platform: SocialPlatform, patch: Partial<SocialForm>) => {
    setRows((current) =>
      current.map((row) => (row.platform === platform ? { ...row, ...patch } : row)),
    );
  };

  const save = async () => {
    const supabase = getBrowserClient();
    if (!supabase) {
      toast('尚未設定 Supabase，無法儲存。', 'error');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('social_links')
      .upsert(rows, { onConflict: 'platform' });
    setSaving(false);

    if (error) {
      toast(`儲存失敗：${error.message}`, 'error');
      return;
    }

    baseline.current = JSON.stringify(rows);
    setRows((current) => [...current]);
    toast('Saved successfully.');
  };

  return (
    <EditorShell
      title="Social"
      description="Contact 區塊的社群連結"
      dirty={dirty}
      saving={saving}
      onSave={() => void save()}
    >
      {loading ? (
        <p className="font-sans text-sm text-ink/40">Loading…</p>
      ) : (
        <div className="max-w-3xl space-y-4">
          <p className="border border-ink/10 bg-sand/60 px-4 py-3 font-sans text-xs leading-relaxed text-ink/55">
            平台清單是固定的七個，無法新增其他社群。
            不想顯示某個平台時，把它切換成 Disabled 即可 —— 前台就不會出現。
          </p>

          {rows.map((row) => (
            <Panel key={row.platform}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-serif text-xl text-ink">{row.name}</h3>
                <span className="label-text text-ink/35">{row.platform}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Handle" className="sm:col-span-1">
                  <TextInput
                    value={row.handle}
                    onChange={(value) => update(row.platform, { handle: value })}
                  />
                </Field>
                <div className="sm:col-span-1 sm:self-end">
                  <Toggle
                    checked={row.enabled}
                    onChange={(checked) => update(row.platform, { enabled: checked })}
                    label={row.enabled ? 'Enabled' : 'Disabled'}
                    description={row.enabled ? '會顯示在前台' : '前台不顯示'}
                  />
                </div>
                <Field label="URL" className="sm:col-span-2">
                  <TextInput
                    value={row.url}
                    onChange={(value) => update(row.platform, { url: value })}
                    placeholder={
                      row.platform === 'email' ? 'mailto:you@example.com' : 'https://…'
                    }
                  />
                </Field>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </EditorShell>
  );
}

/**
 * 把目前 src/data 的網站內容寫進 Supabase，作為後台的初始資料。
 *
 * 使用方式（在你自己的電腦上執行，不會跑在瀏覽器）：
 *   1. 先在 Supabase SQL Editor 執行 supabase/migrations/0001_init.sql
 *   2. 在 .env.local 填入 NEXT_PUBLIC_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY
 *   3. npm run seed
 *
 * 這個腳本使用 service role key 以繞過 RLS，
 * 因此絕對不能在前端或任何 client component 中引用。
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { about } from '../src/data/about';
import { hero } from '../src/data/hero';
import { places } from '../src/data/places';
import { projects } from '../src/data/projects';
import { site } from '../src/data/site';
import { socials } from '../src/data/social';
import { tech } from '../src/data/tech';
import { coffee } from '../src/data/coffee';
import type { Database, SocialPlatform } from '../src/lib/types/database';

config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    '缺少環境變數。請在 .env.local 設定 NEXT_PUBLIC_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY。',
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false },
});

const platformOf = (name: string): SocialPlatform => {
  const map: Record<string, SocialPlatform> = {
    TikTok: 'tiktok',
    'Google Maps': 'google_maps',
    X: 'x',
    Threads: 'threads',
    Instagram: 'instagram',
    GitHub: 'github',
    Email: 'email',
  };
  const platform = map[name];
  if (!platform) throw new Error(`未知的社群平台：${name}`);
  return platform;
};

/** 表內已經有資料就跳過，避免重複執行時產生重複列 */
async function seedSingleton(
  table: 'site_settings' | 'home_content' | 'about_content',
  payload: Record<string, unknown>,
) {
  const { count, error: countError } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    console.log(`- ${table}：已有資料，略過`);
    return;
  }

  const { error } = await supabase.from(table).insert(payload as never);
  if (error) throw error;
  console.log(`✓ ${table}`);
}

async function seedCollection(
  table: 'coffee_entries' | 'places' | 'technology_projects' | 'projects',
  rows: Record<string, unknown>[],
) {
  const { count, error: countError } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    console.log(`- ${table}：已有 ${count} 筆，略過`);
    return;
  }

  const { error } = await supabase.from(table).insert(rows as never);
  if (error) throw error;
  console.log(`✓ ${table}（${rows.length} 筆）`);
}

async function main() {
  console.log('開始寫入初始資料…\n');

  await seedSingleton('site_settings', {
    site_name: site.name,
    site_title: site.titleSuffix,
    description: site.subtitle,
    seo_description: site.description,
    website_url: site.url,
    footer_text: site.copyright,
    location: 'Taiwan',
  });

  await seedSingleton('home_content', {
    eyebrow: hero.eyebrow,
    title: hero.titleLines.join('\n'),
    intro: hero.bodyLines.join('\n'),
    cta_label: hero.cta.label,
    hero_image_url: hero.image,
    hero_image_caption: hero.imageCaption,
    keywords: hero.keywords,
  });

  await seedSingleton('about_content', {
    section_label: about.label.title,
    title: about.heading,
    paragraphs: about.paragraphs,
    interests: about.interests,
  });

  await seedCollection(
    'coffee_entries',
    coffee.cards.map((card, index) => ({
      entry_type: card.kicker === 'COFFEE NOTES' ? 'coffee_bean' : 'brewing_note',
      title: card.title,
      notes: card.body,
      flavor_notes: card.items ?? [],
      cover_image_url: card.image,
      published: true,
      sort_order: index,
    })),
  );

  await seedCollection(
    'places',
    places.items.map((item, index) => ({
      title: item.title,
      category: item.meta,
      subtitle: item.imageAlt,
      cover_image_url: item.image,
      published: true,
      sort_order: index,
    })),
  );

  await seedCollection(
    'technology_projects',
    tech.cards.map((card, index) => ({
      name: card.title,
      technologies: card.stack.split(' / ').map((value) => value.trim()).filter(Boolean),
      description: card.body,
      status: 'exploring',
      published: true,
      sort_order: index,
    })),
  );

  await seedCollection(
    'projects',
    projects.items.map((item, index) => ({
      title: item.title,
      category: item.category,
      year: item.year,
      published: true,
      sort_order: index,
    })),
  );

  // social_links 以 platform 為唯一鍵，可安全重複執行
  const { error: socialError } = await supabase.from('social_links').upsert(
    socials.map((item, index) => ({
      platform: platformOf(item.name),
      name: item.name,
      handle: item.handle,
      url: item.href,
      icon: item.icon ?? null,
      enabled: true,
      sort_order: index,
    })),
    { onConflict: 'platform' },
  );
  if (socialError) throw socialError;
  console.log(`✓ social_links（${socials.length} 筆）`);

  console.log('\n完成。現在可以到 /admin 管理內容了。');
}

main().catch((error) => {
  console.error('\n寫入失敗：', error.message ?? error);
  process.exit(1);
});

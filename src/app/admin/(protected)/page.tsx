import Link from 'next/link';
import { getServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type RecentUpdate = {
  label: string;
  title: string;
  href: string;
  updatedAt: string;
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const quickActions = [
  { label: 'Add Coffee Note', href: '/admin/coffee?new=1' },
  { label: 'Add Place', href: '/admin/places?new=1' },
  { label: 'Add Photo', href: '/admin/photography' },
  { label: 'Add Project', href: '/admin/projects?new=1' },
];

export default async function AdminOverviewPage() {
  const supabase = await getServerClient();

  const emptyCounts = { coffee: 0, places: 0, photos: 0, projects: 0 };
  let counts = emptyCounts;
  let recent: RecentUpdate[] = [];

  if (supabase) {
    const [coffee, places, photos, projects] = await Promise.all([
      supabase.from('coffee_entries').select('id', { count: 'exact', head: true }),
      supabase.from('places').select('id', { count: 'exact', head: true }),
      supabase.from('photos').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
    ]);

    counts = {
      coffee: coffee.count ?? 0,
      places: places.count ?? 0,
      photos: photos.count ?? 0,
      projects: projects.count ?? 0,
    };

    const [recentCoffee, recentPlaces, recentPhotos, recentProjects, recentTech] =
      await Promise.all([
        supabase
          .from('coffee_entries')
          .select('title, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5),
        supabase
          .from('places')
          .select('title, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5),
        supabase
          .from('photos')
          .select('title, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5),
        supabase
          .from('projects')
          .select('title, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5),
        supabase
          .from('technology_projects')
          .select('name, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5),
      ]);

    recent = [
      ...(recentCoffee.data ?? []).map((row) => ({
        label: 'Coffee',
        title: row.title,
        href: '/admin/coffee',
        updatedAt: row.updated_at,
      })),
      ...(recentPlaces.data ?? []).map((row) => ({
        label: 'Place',
        title: row.title,
        href: '/admin/places',
        updatedAt: row.updated_at,
      })),
      ...(recentPhotos.data ?? []).map((row) => ({
        label: 'Photo',
        title: row.title || 'Untitled photo',
        href: '/admin/photography',
        updatedAt: row.updated_at,
      })),
      ...(recentProjects.data ?? []).map((row) => ({
        label: 'Project',
        title: row.title,
        href: '/admin/projects',
        updatedAt: row.updated_at,
      })),
      ...(recentTech.data ?? []).map((row) => ({
        label: 'AI & Tech',
        title: row.name,
        href: '/admin/technology',
        updatedAt: row.updated_at,
      })),
    ]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5);
  }

  const cards = [
    { label: 'Coffee Entries', value: counts.coffee, href: '/admin/coffee' },
    { label: 'Places', value: counts.places, href: '/admin/places' },
    { label: 'Photos', value: counts.photos, href: '/admin/photography' },
    { label: 'Projects', value: counts.projects, href: '/admin/projects' },
  ];

  return (
    <div className="py-8">
      <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
        {greeting()}, Alex.
      </h1>
      <p className="mt-2 font-sans text-sm text-ink/45">
        A quiet place to manage Coffee, Places, Photos and Ideas.
      </p>

      {/* 資訊卡 */}
      <div className="mt-10 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group bg-paper p-5 transition-colors duration-300 hover:bg-sand sm:p-6"
          >
            <p className="label-text text-ink/40">{card.label}</p>
            <p className="mt-3 font-serif text-4xl text-ink transition-colors duration-300 group-hover:text-coffee">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
        {/* Recent updates */}
        <section className="lg:col-span-2">
          <h2 className="label-text text-ink/45">RECENT UPDATES</h2>
          {recent.length === 0 ? (
            <p className="mt-5 border border-dashed border-ink/15 p-6 font-sans text-sm text-ink/40">
              目前還沒有任何內容。從右邊的 Quick Actions 開始建立第一筆吧。
            </p>
          ) : (
            <ul className="mt-5 border-t border-ink/10">
              {recent.map((item, index) => (
                <li key={`${item.href}-${index}`} className="border-b border-ink/10">
                  <Link
                    href={item.href}
                    className="group flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4 transition-colors duration-300 hover:text-coffee"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="label-text mr-3 text-coffee/60">{item.label}</span>
                      <span className="font-serif text-lg text-ink group-hover:text-coffee">
                        {item.title}
                      </span>
                    </span>
                    <time
                      dateTime={item.updatedAt}
                      className="font-sans text-xs text-ink/40"
                    >
                      {new Date(item.updatedAt).toLocaleDateString('zh-TW')}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="label-text text-ink/45">QUICK ACTIONS</h2>
          <ul className="mt-5 space-y-2">
            {quickActions.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="group flex items-center justify-between border border-ink/15 px-4 py-3 font-sans text-sm text-ink transition-colors duration-300 hover:border-coffee hover:text-coffee"
                >
                  {action.label}
                  <span
                    aria-hidden
                    className="text-ink/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-coffee"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

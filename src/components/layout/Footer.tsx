import { site } from '@/data/site';

/** Footer。不重複列出社群連結，只保留識別、版權與回到頂部。 */
export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-sand">
      <div className="shell flex flex-col gap-10 py-14 sm:py-16 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            {site.name}
          </p>
          <p className="mt-2 font-sans text-sm tracking-wide text-coffee">
            {site.tagline}
          </p>
          <p className="mt-6 font-sans text-xs leading-relaxed text-ink/45">
            {site.copyright}
            <br />
            {site.footerNote}
          </p>
        </div>

        <a
          href="#top"
          className="group inline-flex items-center gap-2 self-start font-sans text-sm tracking-wide text-ink/70 transition-colors duration-400 ease-editorial hover:text-coffee md:self-auto"
        >
          Back to top
          <span
            aria-hidden
            className="transition-transform duration-400 ease-editorial group-hover:-translate-y-1"
          >
            ↑
          </span>
        </a>
      </div>
    </footer>
  );
}

import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import type { ProjectsContent } from '@/lib/types/content';
import { cn } from '@/lib/utils';

/**
 * 06 / SELECTED PROJECTS
 *
 * 視覺節奏：大型交替列。
 * 每一列是一個高大的橫幅，編號與年份左右分置，
 * 標題字級刻意放大，與 AI & Tech 的密集清單形成對比。
 */
export default function ProjectsSection({ projects }: { projects: ProjectsContent }) {
  return (
    <section id="projects" className="section-space bg-sand">
      <div className="shell">
        <Reveal>
          <SectionLabel index={projects.label.index} title={projects.label.title} />
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-12 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.01em] text-ink sm:text-5xl lg:mt-16">
            {projects.heading}
          </h2>
        </Reveal>

        <ul className="mt-14 border-t border-ink/15 lg:mt-20">
          {projects.items.map((project, index) => {
            const alignRight = index % 2 === 1;
            const row = (
              <div
                className={cn(
                  'group flex flex-col gap-2 py-8 transition-colors duration-400 ease-editorial sm:py-10 lg:py-12',
                  alignRight && 'sm:items-end sm:text-right',
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-4',
                    alignRight && 'sm:flex-row-reverse',
                  )}
                >
                  <span className="label-text text-coffee/70">{project.id}</span>
                  <span aria-hidden className="h-px w-8 bg-ink/20" />
                  <span className="label-text text-ink/40">{project.category}</span>
                </div>

                <h3 className="font-serif text-[1.75rem] leading-tight text-ink transition-colors duration-400 group-hover:text-coffee sm:text-4xl lg:text-5xl">
                  {project.title}
                </h3>

                <div
                  className={cn(
                    'mt-1 flex items-center gap-3',
                    alignRight && 'sm:flex-row-reverse',
                  )}
                >
                  <span className="font-sans text-sm text-ink/40">{project.year}</span>
                  {project.href && (
                    <span
                      aria-hidden
                      className={cn(
                        'text-ink/30 transition-transform duration-400 ease-editorial group-hover:text-coffee',
                        alignRight
                          ? 'group-hover:-translate-x-1'
                          : 'group-hover:translate-x-1',
                      )}
                    >
                      {alignRight ? '←' : '→'}
                    </span>
                  )}
                </div>
              </div>
            );

            return (
              <Reveal
                as="li"
                key={project.id}
                delay={0.04 * index}
                y={14}
                duration={0.6}
                className="border-b border-ink/10"
              >
                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {row}
                  </a>
                ) : (
                  row
                )}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

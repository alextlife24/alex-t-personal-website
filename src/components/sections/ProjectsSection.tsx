import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { projects } from '@/data/projects';

/**
 * 06 / SELECTED PROJECTS。
 * 極簡 Row List：編號、標題、分類、年份、箭頭。Hover 時整列淡淡變色。
 */
export default function ProjectsSection() {
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
          {projects.items.map((project, index) => (
            <Reveal
              as="li"
              key={project.id}
              delay={0.03 * index}
              y={10}
              duration={0.5}
              className="border-b border-ink/10"
            >
              <div className="group -mx-4 flex items-center gap-4 px-4 py-6 transition-colors duration-400 ease-editorial hover:bg-paper sm:gap-8 sm:py-7">
                <span className="label-text w-6 shrink-0 text-coffee/70">
                  {project.id}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-xl leading-snug text-ink transition-colors duration-400 group-hover:text-coffee sm:text-2xl">
                    {project.title}
                  </h3>
                  <p className="mt-1 font-sans text-xs text-ink/45 sm:hidden">
                    {project.category} &middot; {project.year}
                  </p>
                </div>

                <span className="hidden w-48 shrink-0 font-sans text-sm text-ink/50 sm:block">
                  {project.category}
                </span>

                <span className="hidden w-16 shrink-0 font-sans text-sm text-ink/40 sm:block">
                  {project.year}
                </span>

                <span
                  aria-hidden
                  className="shrink-0 text-ink/30 transition-all duration-400 ease-editorial group-hover:translate-x-1 group-hover:text-coffee"
                >
                  &#8594;
                </span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { cn } from '@/lib/utils';

type SectionLabelProps = {
  index: string;
  title: string;
  className?: string;
};

/** Editorial 小型編號標籤，例如「01 / ABOUT」。 */
export default function SectionLabel({ index, title, className }: SectionLabelProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <span className="label-text text-coffee">{index}</span>
      <span aria-hidden className="h-px w-8 bg-ink/20" />
      <span className="label-text text-ink/55">{title}</span>
    </div>
  );
}

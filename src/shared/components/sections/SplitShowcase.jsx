import { cn } from '@/shared/utils';
import { FloatingCaption } from '@/shared/components/ui/FloatingCaption.jsx';
import { ImageWithSkeleton } from '@/shared/components/ui/ImageWithSkeleton.jsx';

export function SplitShowcase({ eyebrow, title, intro, imageSrc, imageSrcSet, imageSizes, imageAlt, caption, captionAlign = 'left', items, reverse = false, bg = 'bg-kop-mint', sectionClassName }) {
  const visual = (
    <div className="relative">
      <ImageWithSkeleton
        src={imageSrc}
        srcSet={imageSrcSet}
        sizes={imageSizes}
        alt={imageAlt || ''}
        ratio="h-85 sm:h-100"
        className="bg-accent-500/30"
        frameClassName="rounded-[16px]"
      />
      {caption && <FloatingCaption align={captionAlign} title={caption[0]} subtitle={caption[1]} />}
    </div>
  );

  const content = (
    <div>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
      {intro && <p className="mt-3 text-sm leading-7 text-gray-600">{intro}</p>}
      <ul className="mt-6 space-y-3 text-sm text-gray-700">
        {items.map(({ icon: Icon, title: t, body }) => (
          <li key={t} className="flex items-start gap-3">
            <span className="mt-0.5 leading-none">
              <Icon size={24} aria-hidden strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-semibold text-gray-900">{t}</p>
              <p className="text-gray-600 text-[13px] leading-6">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section className={cn('py-8 lg:py-16', bg, sectionClassName)}>
      <aside className="container-kop grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
        {reverse ? (
          <>
            <div className="lg:order-2">{visual}</div>
            {content}
          </>
        ) : (
          <>
            {visual}
            {content}
          </>
        )}
      </aside>
    </section>
  );
}

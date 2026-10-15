export function SectionHeader({ eyebrow, title, intro, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {title}
        </h2>
        {intro && (
          <p className="mt-2 text-sm leading-7 text-gray-600">{intro}</p>
        )}
      </div>
      {children}
    </div>
  );
}

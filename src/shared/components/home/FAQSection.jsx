import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/shared/utils';
import { FAQ } from '@/shared/content/home.js';

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section className="container-kop py-8 lg:py-16">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Avant de vous lancer</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            On vous répond.
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            Quelques réponses pour utiliser KOP en toute simplicité.
          </p>
        </div>
        <div className="space-y-1 grid-cols-2 col-span-2">
          {FAQ.map(({ q, a }, i) => (
            <div key={q} className=" border-b border-gray-300  overflow-hidden ">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                className="w-full flex items-center cursor-pointer justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-ring"
                aria-expanded={openIdx === i}
              >
                <span>{q}</span>
                <span className={cn('text-primary-600 transition-transform text-lg leading-none', openIdx === i && 'rotate-45')}>
                  <Plus size={16} aria-hidden />
                </span>
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 animate-fade-in">
                  <p className="text-sm leading-7 text-gray-600">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Fragment } from "react";
import { Card } from "@/shared/components/ui/Card.jsx";
import { SectionHeader } from "@/shared/components/sections/SectionHeader.jsx";
import { cn } from "@/shared/utils";
import { STEPS } from "@/shared/content/home.js";

export function HowItWorksSection() {
  return (
    <section className="container-kop py-8 lg:py-16">
      <SectionHeader
        eyebrow="Simple, du début à la rencontre"
        title="Votre projet commence ici."
        intro="Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les professionnels de votre quartier et échangez directement avec eux."
      />
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        {STEPS.map((s, index) => (
          <Fragment key={s.n}>
            <Card
              className={`${s.tone} flex-1 aspect-4/4.5 bg-primary-600! p-2 border-0! shadow-none! flex flex-col justify-between`}
            >
              <div className="px-4">
                <h3 className="mt-5 text-xl font-medium text-gray-200!">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm  text-gray-300">{s.body}</p>
              </div>
              <div
                className={cn(
                  "h-45.5 rounded-sm text-8xl font-bold flex items-center  justify-center",
                  s.tone,
                )}
              >
                {s.n}
              </div>
            </Card>
            <ul
              className={`mx-4 flex w-auto flex-col gap-y-0 opacity-25 md:mx-0 md:w-auto md:flex-row ${index === STEPS.length - 1 ? "hidden" : ""}`}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="h-1 w-full border-t md:h-88 md:w-1 md:border-t-0 md:border-l"
                ></li>
              ))}
            </ul>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

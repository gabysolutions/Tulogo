import type { ProductionTimelineItem } from "../../types/dashboard";

interface Props {
  timeline: ProductionTimelineItem[];
}

export default function ProductionTimeline({ timeline }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-base font-semibold">Timeline de Producción</h3>

      <p className="mb-5 text-xs text-muted-foreground">
        Pedidos por etapa actualmente
      </p>

      <ol className="flex flex-col md:flex-row md:items-start md:justify-between">
        {timeline.map((item, index) => {
          const isLast = index === timeline.length - 1;

          return (
            <li
              key={item.id}
              className="relative flex items-center gap-4 pb-6 last:pb-0 md:flex-1 md:flex-col md:gap-0 md:pb-0"
            >
              {/* Conector: vertical en móvil, horizontal en md+ */}
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-5 top-10 h-full w-0.5 -translate-x-1/2 bg-gray-300
                             md:left-1/2 md:top-5 md:h-0.5 md:w-full md:translate-x-0 md:-translate-y-1/2"
                />
              )}

              <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-blue-600 bg-white text-xs font-bold text-blue-600">
                {item.count}
              </div>

              <p className="text-left text-sm text-gray-600 md:mt-2 md:text-center">
                {item.stage}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
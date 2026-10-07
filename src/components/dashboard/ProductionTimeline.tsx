import type { ProductionTimelineItem } from "../../types/dashboard";

interface Props {
  timeline: ProductionTimelineItem[];
}

export default function ProductionTimeline({
  timeline,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <h3 className="text-md font-semibold">
        Timeline de Producción
      </h3>

      <p className="mb-5 text-xs text-muted-foreground">
        Pedidos por etapa actualmente
      </p>

      <div className="relative">

        <div className="absolute left-0 right-0 top-4 h-px bg-border" />

        <div className="flex items-start justify-between">

          {timeline.map((item,index) => (

            <div
              key={item.id}
              className="relative flex flex-1 flex-col items-center"
            >
              {index < timeline.length - 1 && (
                    <div
                    className="
                        absolute
                        top-5
                        left-1/2
                        w-full
                        h-[2px]
                        bg-gray-400
                        -z-0
                    "
                    />
                )}





              <div
                className="
                  z-10
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border-3
                  border-primary
                  bg-white
                  text-xs
                  font-bold
                  text-primary
                  text-blue-600
                "
              >
                {item.count}
              </div>

              <p className="mt-2 text-gray-600 text-center text-[14px] text-muted-foreground">
                {item.stage}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}
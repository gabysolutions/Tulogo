import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Palette, Shirt } from "lucide-react";

import { type Design } from "../../types/design";
import { StatusBadge } from "./StatusBadge";

export function DesignCard({ design }: { design: Design }) {
  const firstDetail = design.details[0];
  const previewImage = firstDetail?.designImg ?? firstDetail?.files[0]?.url ?? null;

  return (
    <Link
      to={`/diseños/${design.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
            {previewImage ? (
              <img
                src={previewImage}
                alt={firstDetail?.description ?? "Diseño"}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <Shirt className="h-10 w-10" />
              </div>
            )}
          </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-slate-800">
              COT-{String(design.quoteId).padStart(4, "0")}
            </p>
            <p className="truncate text-base font-medium text-slate-800">
              {firstDetail?.teamName ?? "Sin equipo"}
            </p>
          </div>
          <StatusBadge status={design.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Palette className="h-3.5 w-3.5" />
            {design.designerName === "SIN ASIGNAR" ? "Sin asignar" : design.designerName}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {design.deliveryDate}
          </span>
          {design.details.length > 1 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {design.details.length} artículos
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-end text-sm font-medium text-blue-600">
          Ver detalle
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
import { useState } from "react";
import { Check, ArrowRight, Lock, X } from "lucide-react";
import { STAGES, getStage } from "../../types/order";
import type { ProductionOrderListItem } from "../../types/order";

interface Props {
  order: Pick<ProductionOrderListItem, "id" | "status"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // El status que se manda al API sale de la orden seleccionada (el backend avanza la etapa).
  // Devuelve true si el cambio se guardó (el dialog se cierra solo en ese caso)
  onConfirm: () => Promise<boolean>;
}

export function UpdateStatusDialog({ order, open, onOpenChange, onConfirm }: Props) {
  const [submitting, setSubmitting] = useState(false);

  if (!open || !order) return null;

  const current = order.status;
  const isLast = current >= STAGES.length;
  const nextId = current + 1;
  const nextStage = isLast ? null : getStage(nextId);

  async function handleConfirm() {
    if (!order) return;
    setSubmitting(true);
    try {
      const ok = await onConfirm();
      if (ok) onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
      onClick={() => !submitting && onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Actualizar estado · ORD-{String(order.id).padStart(4, "0")}
            </h2>
            <p className="text-sm text-slate-500">
              Solo puedes avanzar al siguiente estado. El flujo no permite retroceder.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <ol className="flex flex-col gap-1 overflow-y-auto p-3">
          {STAGES.map((stage) => {
            const done = stage.id < current;
            const isCurrent = stage.id === current;
            const isNext = stage.id === nextId;
            const locked = stage.id > nextId;

            return (
              <li
                key={stage.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                  isCurrent ? "border-blue-200 bg-blue-50/50" : isNext ? "border-emerald-200 bg-emerald-50/50" : "border-transparent"
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isCurrent
                      ? "border-blue-500 bg-blue-500 text-white"
                      : isNext
                      ? "border-emerald-400 bg-white text-emerald-600"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : locked ? <Lock className="size-3.5" /> : (
                    <span className="text-xs font-bold">{stage.id}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col leading-tight">
                  <span className="text-sm font-medium text-slate-800">
                    {stage.id}. {stage.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {done && "Completada"}
                    {isCurrent && "Etapa actual"}
                    {isNext && "Siguiente etapa"}
                    {locked && "Bloqueada"}
                  </span>
                </div>
                {isNext && <ArrowRight className="size-4 text-emerald-600" />}
              </li>
            );
          })}
        </ol>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
          <button
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            disabled={isLast || submitting}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Guardando..." : isLast ? "Flujo completado" : `Avanzar a ${nextStage?.label}`}
            {!isLast && !submitting && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
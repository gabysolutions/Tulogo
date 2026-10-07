import { useMemo } from "react";
import { X, Clock, Check, Play, Loader2 } from "lucide-react";
import { STAGES, getStage } from "../../types/order";
import type { OrderMovement, ProductionOrderListItem } from "../../types/order";
import { formatDate } from "../../utils/productionUtils";

interface Props {
  order: Pick<ProductionOrderListItem, "id" | "client"> | null;
  movements: OrderMovement[];
  loading?: boolean;
  error?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LAST_STAGE_ID = STAGES[STAGES.length - 1].id;

export function HistoryDrawer({
  order,
  movements,
  loading = false,
  error = null,
  open,
  onOpenChange,
}: Props) {
  // Más reciente primero (por fecha y, en empate, por id)
  const sorted = useMemo(
    () =>
      [...movements].sort(
        (a, b) => b.registrationDate.localeCompare(a.registrationDate) || b.id - a.id
      ),
    [movements]
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Clock className="size-4" /> Historial de producción
            </h2>
            <p className="text-sm text-slate-500">
              {order ? `ORD-${String(order.id).padStart(4, "0")} · ${order.client}` : "Registro de cambios"}
            </p>
          </div>
          <button onClick={() => onOpenChange(false)} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-600">{error}</p>
          ) : sorted.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Sin movimientos registrados.</p>
          ) : (
            <ol className="relative flex flex-col">
              {sorted.map((event, i, arr) => {
                const stage = getStage(event.status);
                const isCompleted = event.status === LAST_STAGE_ID;
                const isLast = i === arr.length - 1;

                return (
                  <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {!isLast && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-200" />}
                    <div
                      className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-full border ${
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-blue-500 bg-blue-500 text-white"
                      }`}
                    >
                      {isCompleted ? <Check className="size-4" strokeWidth={3} /> : <Play className="size-3.5" />}
                    </div>
                    <div className="flex flex-col gap-0.5 pt-1">
                      <span className="font-mono text-xs text-slate-400">{formatDate(event.registrationDate)}</span>
                      <span className="text-sm font-medium text-slate-800">
                        {isCompleted ? "Entrega completada" : `${stage.label} iniciada`}
                      </span>
                      <span className="text-xs text-slate-400">{event.user}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </>
  );
}
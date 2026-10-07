import { useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUpRight, CalendarDays, Layers, Package, User, X } from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "../../lib/utils";
import { getStage, isCompleted, PRIORITY_META, STAGES, type Order } from "../../types/order";

interface Props {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function OrderDialog({ order, onOpenChange }: Props) {
  const meta = order ? PRIORITY_META[order.priority] : null;
  const stage = order ? getStage(order.status) : null;

  const progress = order && stage ? (STAGES.indexOf(stage) + 1) / STAGES.length : 0;

 
  useEffect(() => {
    if (!order) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [order, onOpenChange]);

  if (!order || !meta || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-gray-200 hover:text-black"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>

        <div>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <h2 className="text-xl font-semibold text-foreground">{order.quoteId}</h2>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                meta.badge,
              )}
            >
              Prioridad {meta.label}
            </span>
            {isCompleted(order) && (
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                Completado
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{order.client}</p>
        </div>

        {order.images.length > 0 && (
          <div
            className={cn(
              "grid gap-2",
              order.images.length > 1 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {order.images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`Diseño ${i + 1} del pedido ${order.quoteId} para ${order.client}`}
                loading="lazy"
                className="h-36 w-full rounded-xl border border-gray-200 object-cover"
              />
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Row icon={User} label="Cliente" value={order.client} />
          <Row icon={User} label="Diseñador" value={order.designer} />
          <Row icon={Package} label="Piezas" value={`${order.numberPieces} piezas`} />
          <Row
            icon={CalendarDays}
            label="Fecha de entrega"
            value={format(parseISO(order.deliveryDate), "d 'de' MMMM yyyy", { locale: es })}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <Layers className="size-4 text-muted-foreground" /> Estado actual
            </p>
            <span className="text-sm font-semibold text-foreground">{stage.label}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gray-200"
          >
            Cerrar
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Ver detalle completo <ArrowUpRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

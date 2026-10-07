import {
  Eye,
  History,
  Printer,
  ArrowRightCircle,
  Hash,
  Building2,
  PenTool,
  Package2,
  CalendarDays,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { ProductionOrderListItem } from "../../types/order";
import { getStage, isCompleted, PRIORITY_META, CONFIG_STAGE_ID } from "../../types/order";
import { deliveryLabel, deliveryStatus, formatDate } from "../../utils/productionUtils";
import { DesignCarousel } from "./DesignCarousel";
import { ProgressTrack } from "./ProgressTrack";

interface Props {
  order: ProductionOrderListItem;
  printing?: boolean;
  onViewDetails: (order: ProductionOrderListItem) => void;
  onUpdateStatus: (order: ProductionOrderListItem) => void;
  onViewHistory: (order: ProductionOrderListItem) => void;
  onPrint: (order: ProductionOrderListItem) => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Hash; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-slate-400" />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
        <span className="truncate text-xs font-medium text-slate-800">{value}</span>
      </div>
    </div>
  );
}

export function OrderCard({
  order,
  printing = false,
  onViewDetails,
  onUpdateStatus,
  onViewHistory,
  onPrint,
}: Props) {
  const stage = getStage(order.status);
  const priority = PRIORITY_META[order.priority];
  const dStatus = deliveryStatus(order);
  const completed = isCompleted(order);

  const folio = `COT-${String(order.quoteId).padStart(4, "0")}`;

  // La configuración está completa cuando ya se registraron todas las piezas
  const pendingPieces = Math.max(0, order.numberPieces - order.piecesRegistered);
  const configIncomplete = order.status === CONFIG_STAGE_ID && pendingPieces > 0;

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        dStatus === "soon" ? "ring-2 ring-amber-300" : dStatus === "overdue" ? "ring-2 ring-red-300" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-800">
              ORD-{String(order.id).padStart(4, "0")}
            </span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
              {folio}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-800">{order.client}</span>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${priority.classes}`}>
          {priority.label}
        </span>
      </div>

      <div className="px-4">
        <DesignCarousel images={order.images} alt={`ORD-${order.id}`} />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-3 p-4">
        <InfoRow icon={PenTool} label="Diseñador" value={order.designer} />
        <InfoRow icon={Building2} label="Diseño" value={`DIS-${String(order.designId).padStart(4, "0")}`} />
        <InfoRow icon={Package2} label="Piezas" value={`${order.piecesRegistered}/${order.numberPieces} pzs`} />
        <InfoRow icon={CalendarDays} label="Entrega" value={formatDate(order.deliveryDate)} />
      </div>

      <div className="flex items-center justify-between gap-2 px-4 pb-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            completed ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {completed ? "Entregada" : stage.label}
        </span>
        <span
          className={`text-xs font-medium ${
            dStatus === "overdue" ? "text-red-600" : dStatus === "soon" ? "text-amber-600" : "text-slate-500"
          }`}
        >
          {deliveryLabel(order)}
        </span>
      </div>

      <div className="mx-4 mb-2 rounded-xl bg-slate-50 p-4">
        <ProgressTrack status={order.status} completed={completed} />
      </div>

      {configIncomplete && (
        <div className="mx-4 mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          <AlertTriangle className="size-3.5 shrink-0 translate-y-0.5" />
          <span>
            Completa la configuración para avanzar: faltan {pendingPieces} pieza
            {pendingPieces === 1 ? "" : "s"} por capturar.
          </span>
        </div>
      )}

      <div className="border-t border-slate-100" />

      <div className="grid grid-cols-2 gap-2 p-3">
        <button
          onClick={() => onViewDetails(order)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Eye size={16} /> Ver detalles
        </button>
        <button
          onClick={() => onUpdateStatus(order)}
          disabled={completed || configIncomplete}
          title={configIncomplete ? "Completa la configuración de la orden para poder avanzar" : undefined}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowRightCircle size={16} /> Actualizar
        </button>
        <button
          onClick={() => onViewHistory(order)}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <History size={16} /> Historial
        </button>
        <button
          onClick={() => onPrint(order)}
          disabled={printing}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {printing ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
          {printing ? "Generando..." : "Imprimir"}
        </button>
      </div>
    </article>
  );
}
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Loader2,
  Package2,
  Palette,
  Printer,
} from "lucide-react";

import { useProductionOrder } from "../../hooks/useProduction";
import { useOrderPdf } from "../../hooks/Useorderpdf";
import { getStage, isCompleted, PRIORITY_META } from "../../types/order";
import { formatDate } from "../../utils/productionUtils";
import { ProgressTrack } from "../../components/production/ProgressTrack";

// Ajusta si tu ruta de listado es distinta
const PRODUCTION_PATH = "/produccion";

const GENDER_LABEL: Record<"M" | "F", string> = { M: "Masculino", F: "Femenino" };

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orderId = Number(id);
  const validId = Number.isInteger(orderId) && orderId > 0;

  const { order: data, loading, error, refetch } = useProductionOrder(validId ? orderId : null);
  const { openPdf, loadingId } = useOrderPdf();

  // Evita pintar la orden anterior mientras carga la nueva
  const order = data && data.id === orderId ? data : null;
  const printing = loadingId === orderId;

  const goBack = () => navigate(PRODUCTION_PATH);

  if (!validId) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-20 text-center">
          <p className="text-sm font-medium text-slate-800">La orden solicitada no es válida.</p>
          <button
            onClick={goBack}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Volver a producción
          </button>
        </div>
      </main>
    );
  }

  if (loading && !order) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="size-6 text-red-500" />
          <p className="text-sm font-medium text-red-700">{error ?? "No se encontró la orden."}</p>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Reintentar
            </button>
            <button
              onClick={goBack}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Volver
            </button>
          </div>
        </div>
      </main>
    );
  }

  const stage = getStage(order.status);
  const priority = PRIORITY_META[order.priority];
  const completed = isCompleted(order);
  const folio = `COT-${String(order.quoteId).padStart(4, "0")}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="flex flex-col gap-6">
        <button
          onClick={goBack}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Volver a producción
        </button>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-2xl font-semibold text-slate-800">
                ORD-{String(order.id).padStart(4, "0")}
              </h1>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${priority.classes}`}>
                {priority.label}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  completed ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                }`}
              >
                {completed ? "Entregada" : stage.label}
              </span>
            </div>
            <p className="text-sm text-slate-500">{order.client}</p>
          </div>

          <button
            onClick={() => openPdf(order.id)}
            disabled={printing}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {printing ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            {printing ? "Generando..." : "Imprimir PDF"}
          </button>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <ProgressTrack status={order.status} completed={completed} />
        </div>

        {order.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {order.images.map((img, i) => (
              <div key={img} className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                <img src={img} alt={`Diseño ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileText className="size-4 text-slate-400" /> Cotización
          </h2>
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-4">
            <Meta label="N° Cotización" value={folio} />
            <Meta label="Cliente" value={order.client} />
            <Meta label="Prioridad" value={priority.label} />
            {order.advanceDate && <Meta label="Fecha anticipo" value={formatDate(order.advanceDate)} />}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Palette className="size-4 text-slate-400" /> Diseño
          </h2>
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
            <Meta label="N° Diseño" value={`DIS-${String(order.designId).padStart(4, "0")}`} />
            <Meta label="Diseñador" value={order.designer} />
            <Meta label="Etapa actual" value={stage.label} />
            <Meta label="Piezas totales" value={`${order.numberPieces}`} />
            <Meta label="Piezas registradas" value={`${order.piecesRegistered}`} />
            <Meta label="Fecha entrega" value={formatDate(order.deliveryDate)} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Package2 className="size-4 text-slate-400" /> Prendas ({order.details.length} de{" "}
            {order.numberPieces} pzs)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-3 py-2 font-medium">Artículo</th>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Número</th>
                  <th className="px-3 py-2 font-medium">Talla</th>
                  <th className="px-3 py-2 font-medium">Género</th>
                  <th className="px-3 py-2 font-medium">Observación</th>
                </tr>
              </thead>
              <tbody>
                {order.details.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <span className="block font-medium text-slate-800">{d.article}</span>
                      <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                        {d.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800">{d.nickname}</td>
                    <td className="px-3 py-2 font-mono text-slate-700">{d.number ?? "-"}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-md border border-slate-200 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                        {d.size}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-500">{GENDER_LABEL[d.gender]}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{d.observation || "-"}</td>
                  </tr>
                ))}

                {order.details.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                      Sin prendas capturadas todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default OrderDetail;
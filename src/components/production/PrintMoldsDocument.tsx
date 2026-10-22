import { createPortal } from "react-dom";
import type { Order } from "../../types/order";
import { formatDate } from "../../utils/productionUtils";

interface Props {
  order: Order | null;
}

const GENDER_LABEL: Record<"M" | "F", string> = { M: "Masculino", F: "Femenino" };


export function PrintMoldsDocument({ order }: Props) {
  if (!order) return null;

  const folio = `COT-${String(order.quoteId).padStart(4, "0")}`;
  const categories =
    Array.from(new Set(order.details.map((d) => d.category))).join(", ") || "Sin categoría";
  const articleNames =
    Array.from(new Set(order.details.map((d) => d.article))).join(", ") || "Sin artículo";

  return createPortal(
    <div id="print-molds-root" className="hidden print:block">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-molds-root, #print-molds-root * { visibility: visible; }
          #print-molds-root {
            position: absolute;
            inset: 0;
            padding: 28px;
          }
        }
      `}</style>

      <div className="flex flex-col gap-6 text-slate-900">
        <header className="flex items-start justify-between border-b border-slate-300 pb-4">
          <div>
            <h1 className="text-xl font-bold">Orden en personalizado</h1>
            <p className="text-sm text-slate-600">
              ORD-{String(order.id).padStart(4, "0")} · {folio}
            </p>
          </div>
          <div className="text-right">
            <p className="text-base font-semibold">{categories}</p>
            <p className="text-sm text-slate-600">{articleNames}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <p>
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">Cliente</span>
            {order.client}
          </p>
          <p>
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">Diseñador</span>
            {order.designer}
          </p>
          <p>
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">Piezas totales</span>
            {order.numberPieces}
          </p>
          <p>
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">Entrega</span>
            {formatDate(order.deliveryDate)}
          </p>
        </section>

        {order.images.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold">Diseños aceptados</h2>
            <div className="grid grid-cols-3 gap-2">
              {order.images.map((img) => (
                <img
                  key={img}
                  src={img}
                  alt={categories}
                  className="aspect-square w-full rounded-md border border-slate-300 object-cover"
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-sm font-semibold">
            Detalle de piezas ({order.details.length} de {order.numberPieces})
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-400 text-left">
                <th className="py-1.5 pr-2 font-medium">Artículo</th>
                <th className="py-1.5 pr-2 font-medium">Nombre</th>
                <th className="py-1.5 pr-2 font-medium">Talla</th>
                <th className="py-1.5 pr-2 font-medium">Género</th>
                <th className="py-1.5 pr-2 font-medium">Número</th>
              </tr>
            </thead>
            <tbody>
              {order.details.map((d) => (
                <tr key={d.id} className="border-b border-slate-200">
                  <td className="py-1.5 pr-2">{d.article}</td>
                  <td className="py-1.5 pr-2">{d.nickname}</td>
                  <td className="py-1.5 pr-2">{d.size}</td>
                  <td className="py-1.5 pr-2">{GENDER_LABEL[d.gender]}</td>
                  <td className="py-1.5 pr-2">{d.number ?? "-"}</td>
                </tr>
              ))}

              {order.details.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    Sin prendas capturadas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>,
    document.body
  );
}
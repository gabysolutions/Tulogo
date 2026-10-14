import { useMemo, useState } from "react";
import { Check, ChevronDown, Inbox, X } from "lucide-react";
import Swal from "sweetalert2";
import type { Order, SubmittedOrderDetail } from "../../types/order";
import { acceptOrderDetails, rejectOrderDetails } from "../../services/orderLink.service";
import { getApiErrorMessage } from "../../utils/apiError";
import { GENDER_LABELS } from "../../constants/orderDetails";

interface Props {
  order: Order;
  onReviewed: () => Promise<unknown> | void; // recarga la orden
}

// Con tantas piezas o más, la tabla empieza colapsada
const COLLAPSE_FROM = 6;

export function PendingDetailsReview({ order, onReviewed }: Props) {
  const forms = useMemo(() => {
    const byLink = new Map<number, SubmittedOrderDetail[]>();
    for (const d of order.submittedDetails) {
      byLink.set(d.linkId, [...(byLink.get(d.linkId) ?? []), d]);
    }
    return [...byLink.entries()];
  }, [order.submittedDetails]);

  if (forms.length === 0) return null;

  return (
    <div className="space-y-4">
      {forms.map(([linkId, details]) => (
        <PendingForm
          key={linkId}
          order={order}
          linkId={linkId}
          details={details}
          onReviewed={onReviewed}
        />
      ))}
    </div>
  );
}

interface FormProps {
  order: Order;
  linkId: number;
  details: SubmittedOrderDetail[];
  onReviewed: () => Promise<unknown> | void;
}

function PendingForm({ order, linkId, details, onReviewed }: FormProps) {
  const [open, setOpen] = useState(details.length < COLLAPSE_FROM);
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);

  const total = order.details.length + details.length;
  const over = total > order.numberPieces;
  const plural = details.length === 1 ? "pieza" : "piezas";

  async function run(kind: "accept" | "reject") {
    const isAccept = kind === "accept";

    const confirm = await Swal.fire({
      title: isAccept ? "¿Aceptar piezas?" : "¿Rechazar piezas?",
      text: isAccept
        ? over
          ? `La orden pasará de ${order.numberPieces} piezas pedidas a ${total}.`
          : `Se agregarán ${details.length} ${plural} a la orden.`
        : "El cliente tendrá que capturarlas de nuevo con un link nuevo.",
      icon: isAccept ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: isAccept ? "Sí, aceptar" : "Sí, rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: isAccept ? "#059669" : "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!confirm.isConfirmed) return;

    setBusy(kind);
    try {
      if (isAccept) await acceptOrderDetails(linkId);
      else await rejectOrderDetails(linkId);
      await onReviewed();
      Swal.fire({
        title: isAccept ? "Piezas aceptadas" : "Piezas rechazadas",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({
        title: "No se pudo completar",
        text: getApiErrorMessage(e, "Inténtalo de nuevo."),
        icon: "error",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <Inbox size={18} className="mt-0.5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-slate-800">
              El cliente envió {details.length} {plural} por revisar
            </p>
            <p className={`text-xs ${over ? "text-amber-700" : "text-slate-500"}`}>
              {over
                ? `Excede lo pedido: quedarían ${total} de ${order.numberPieces}`
                : `Con estas piezas llegarías a ${total} de ${order.numberPieces}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {details.length >= COLLAPSE_FROM && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-100"
            >
              {open ? "Ocultar" : "Ver piezas"}
              <ChevronDown size={15} className={open ? "rotate-180" : ""} />
            </button>
          )}
          <button
            onClick={() => run("reject")}
            disabled={busy !== null}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <X size={15} /> {busy === "reject" ? "Rechazando..." : "Rechazar"}
          </button>
          <button
            onClick={() => run("accept")}
            disabled={busy !== null}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Check size={15} /> {busy === "accept" ? "Aceptando..." : "Aceptar piezas"}
          </button>
        </div>
      </div>

      {open && (
        <table className="min-w-full border-collapse">
          <thead className="border-b border-gray-200 bg-white text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Artículo</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Talla</th>
              <th className="px-4 py-3">Corte</th>
              <th className="px-4 py-3 text-left">Observación</th>
            </tr>
          </thead>
          <tbody>
            {details.map((d) => (
              <tr key={d.id} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  <div className="font-medium">{d.article}</div>
                  <div className="text-xs text-gray-500">{d.category}</div>
                </td>
                <td className="px-4 py-3">{d.nickname}</td>
                <td className="text-center">{d.number ?? "-"}</td>
                <td className="text-center">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    {d.size}
                  </span>
                </td>
                <td className="text-center">{GENDER_LABELS[d.gender]}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{d.observation || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
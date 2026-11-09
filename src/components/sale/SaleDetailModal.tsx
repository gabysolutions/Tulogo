import { FileText, Ban } from "lucide-react";
import type { SaleWithDetails } from "../../types/sale";
import { ModalShell, SaleStatusBadge, formatMoney } from "../sale/SaleUi";

interface Props {
  sale: SaleWithDetails | null;
  onClose: () => void;
  onNote: (sale: SaleWithDetails) => void;
  onCancelPayment: (sale: SaleWithDetails, paymentId: number) => void;
}

export function SaleDetailModal({ sale, onClose, onNote, onCancelPayment }: Props) {
  if (!sale) return null;

  const canCancelPayments = sale.status !== 0;

  return (
    <ModalShell title={`Venta V-${String(sale.id).padStart(4, "0")}`} onClose={onClose} maxWidth="max-w-3xl">
      <div className="space-y-5 overflow-y-auto px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-slate-800">{sale.clientName}</p>
            <p className="text-xs text-slate-400">
              Registrada: {sale.registrationDate} · Entrega: {sale.deliveryDate}
            </p>
          </div>
          <SaleStatusBadge status={sale.status} />
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Artículos</h4>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Artículo</th>
                  <th className="px-3 py-2 text-left">Tela</th>
                  <th className="px-3 py-2 text-center">Cant.</th>
                  <th className="px-3 py-2 text-right">Precio</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.details.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-800">{d.description}</p>
                      <p className="text-xs text-slate-400">{d.category}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{d.fabricType}</td>
                    <td className="px-3 py-2 text-center">{d.amount}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(d.unitPrice)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatMoney(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
          {sale.iva && <p className="text-right text-xs text-slate-400">Incluye IVA</p>}
          {sale.sending && (
            <div className="flex justify-between text-slate-500">
              <span>Envío</span>
              <span>{formatMoney(sale.shippingAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-800">
            <span>Total</span>
            <span>{formatMoney(sale.total)}</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Abonado</span>
            <span>{formatMoney(sale.advance)}</span>
          </div>
          <div className="flex justify-between font-semibold text-red-600">
            <span>Saldo</span>
            <span>{formatMoney(sale.balanceDue)}</span>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Pagos</h4>
          {sale.payments.length === 0 ? (
            <p className="text-sm text-slate-400">Sin pagos registrados.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {sale.payments.map((p) => {
                const active = p.status === 1;
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className={active ? "" : "text-slate-400 line-through"}>
                      <p className="font-semibold">{formatMoney(p.amount)}</p>
                      <p className="text-xs text-slate-400">
                        {p.paymentMethod === "EFECTIVO" ? "Efectivo" : "Transferencia"} · {p.registrationDate}
                      </p>
                    </div>
                    {active && canCancelPayments ? (
                      <button
                        type="button"
                        onClick={() => onCancelPayment(sale, p.id)}
                        className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Ban className="size-3.5" /> Cancelar
                      </button>
                    ) : (
                      !active && <span className="text-xs text-slate-400">Cancelado</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
        <button
          type="button"
          onClick={() => onNote(sale)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100"
        >
          <FileText className="size-4" /> Nota de venta
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Cerrar
        </button>
      </div>
    </ModalShell>
  );
}
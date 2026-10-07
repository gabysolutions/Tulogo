import { AlertTriangle, FileSearch, Receipt } from "lucide-react";
import type { BillingQuoteRow } from "../../types/invoice";
import { BILLING_STATE_META, formatDate, formatMoney, invoicedPercent } from "../../utils/invoiceUtils";
import { BillingStatusBadge } from "./BillingStatusBadge";

type Props = { rows: BillingQuoteRow[]; loading: boolean; onOpen: (quoteId: number) => void };

function Progress({ row }: { row: BillingQuoteRow }) {
  const pct = invoicedPercent(row.subtotal, row.invoiced);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-500 ${BILLING_STATE_META[row.state].bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-slate-500">{pct}%</span>
    </div>
  );
}

function FiscalWarning() {
  return (
    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
      <AlertTriangle className="h-3 w-3" /> Datos fiscales incompletos
    </span>
  );
}

function ActionButton({ row, onOpen }: { row: BillingQuoteRow; onOpen: (id: number) => void }) {
  const primary = row.remaining > 0.004;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onOpen(row.quoteId);
      }}
      className={
        primary
          ? "inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-blue-600 hover:shadow"
          : "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      }
    >
      {primary ? <Receipt className="h-3.5 w-3.5" /> : <FileSearch className="h-3.5 w-3.5" />}
      {primary ? "Facturar" : "Ver facturas"}
    </button>
  );
}

export function BillingTable({ rows, loading, onOpen }: Props) {
  if (loading && rows.length === 0) {
    return (
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <FileSearch className="h-14 w-14 text-slate-300" />
        <p className="mt-4 font-medium text-slate-700">No hay cotizaciones que coincidan</p>
        <p className="mt-1 text-sm text-slate-500">Ajusta la búsqueda o el filtro de estado.</p>
      </div>
    );
  }

  return (
    <div className={`transition-opacity ${loading ? "opacity-60" : ""}`}>
      {/* Escritorio */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3 text-right">Facturado</th>
              <th className="px-4 py-3 text-right">Pendiente</th>
              <th className="w-40 px-4 py-3">Avance</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.quoteId} onClick={() => onOpen(r.quoteId)} className="cursor-pointer transition hover:bg-blue-50/40">
                <td className="px-4 py-3 font-semibold text-slate-900">{r.folio}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-slate-800">{r.clientName}</span>
                    {!r.clientFiscalComplete && <FiscalWarning />}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(r.deliveryDate)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatMoney(r.subtotal)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatMoney(r.invoiced)}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">{formatMoney(r.remaining)}</td>
                <td className="px-4 py-3">
                  <Progress row={r} />
                </td>
                <td className="px-4 py-3">
                  <BillingStatusBadge state={r.state} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ActionButton row={r} onOpen={onOpen} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="grid gap-3 lg:hidden">
        {rows.map((r) => (
          <div
            key={r.quoteId}
            onClick={() => onOpen(r.quoteId)}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{r.folio}</p>
                <p className="text-sm text-slate-700">{r.clientName}</p>
                {!r.clientFiscalComplete && <FiscalWarning />}
              </div>
              <BillingStatusBadge state={r.state} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Subtotal</p>
                <p className="font-medium tabular-nums text-slate-800">{formatMoney(r.subtotal)}</p>
              </div>
              <div>
                <p className="text-slate-500">Facturado</p>
                <p className="font-medium tabular-nums text-slate-800">{formatMoney(r.invoiced)}</p>
              </div>
              <div>
                <p className="text-slate-500">Pendiente</p>
                <p className="font-semibold tabular-nums text-slate-900">{formatMoney(r.remaining)}</p>
              </div>
            </div>
            <div className="mt-3">
              <Progress row={r} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Entrega {formatDate(r.deliveryDate)}</span>
              <ActionButton row={r} onOpen={onOpen} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

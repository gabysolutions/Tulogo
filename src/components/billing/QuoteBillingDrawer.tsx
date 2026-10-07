import { useEffect, useState } from "react";
import { Ban, Receipt, X } from "lucide-react";
import type { BillingActions } from "../../hooks/useBilling";
import { useQuoteBilling } from "../../hooks/useBilling";
import { folioFromId, formatMoney, getBillingState, invoicedPercent } from "../../utils/invoiceUtils";
import { BillingStatusBadge } from "./BillingStatusBadge";
import { FiscalDataCard } from "./FiscalDataCard";
import { InvoiceHistory } from "./InvoiceHistory";
import { IssueInvoiceModal } from "./IssueInvoiceModal";

type Props = { quoteId: number | null; onClose: () => void; actions: BillingActions };

export function QuoteBillingDrawer({ quoteId, onClose, actions }: Props) {
  const { summary, loading, error, reload } = useQuoteBilling(quoteId);
  const [issueOpen, setIssueOpen] = useState(false);

  useEffect(() => {
    if (quoteId == null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !issueOpen && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quoteId, issueOpen, onClose]);

  if (quoteId == null) return null;

  const canIssue = !!summary && !summary.quoteCanceled && summary.remaining > 0.004;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl animate-in slide-in-from-right flex-col bg-slate-50 shadow-2xl duration-300">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Cotización</p>
            <h2 className="text-lg font-semibold text-slate-900">{folioFromId(quoteId)}</h2>
          </div>
          <div className="flex items-center gap-2">
            {summary && <BillingStatusBadge state={getBillingState(summary.subtotal, summary.invoiced)} />}
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {loading && !summary && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
              ))}
            </div>
          )}
          {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error.message}</div>}

          {summary && (
            <>
              {summary.quoteCanceled && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                  <Ban className="h-4 w-4" /> Cotización cancelada
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Subtotal</p>
                    <p className="font-semibold tabular-nums text-slate-900">{formatMoney(summary.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Facturado</p>
                    <p className="font-semibold tabular-nums text-emerald-700">{formatMoney(summary.invoiced)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pendiente</p>
                    <p className="font-semibold tabular-nums text-blue-700">{formatMoney(summary.remaining)}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${invoicedPercent(summary.subtotal, summary.invoiced)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Montos antes de IVA.</p>
              </div>

              <FiscalDataCard client={summary.client} />

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Artículo</th>
                      <th className="px-3 py-2 text-right">Cant.</th>
                      <th className="px-3 py-2 text-right">Facturado / Pendiente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.lines.map((l) => (
                      <tr key={l.detailId}>
                        <td className="px-3 py-2">
                          <p className="text-slate-800">{l.description}</p>
                          <p className="text-xs text-slate-500">
                            {formatMoney(l.unitPrice)} c/u · {l.productCode ? `SAT ${l.productCode}` : <span className="text-amber-600">Sin clave SAT</span>}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{l.quantity}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          <span className="text-emerald-700">{l.invoicedQuantity}</span>
                          <span className="text-slate-400"> / </span>
                          <span className="font-medium text-blue-700">{l.remainingQuantity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                disabled={!canIssue}
                onClick={() => setIssueOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-blue-600 hover:shadow disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
              >
                <Receipt className="h-4 w-4" /> Emitir factura
              </button>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Historial de facturas</h3>
                <InvoiceHistory invoices={summary.invoices} actions={actions} onChanged={reload} />
              </div>
            </>
          )}
        </div>
      </aside>

      {issueOpen && summary && (
        <IssueInvoiceModal summary={summary} onClose={() => setIssueOpen(false)} onIssue={actions.issue} onIssued={reload} />
      )}
    </div>
  );
}

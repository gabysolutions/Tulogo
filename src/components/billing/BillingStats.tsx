import { CircleDollarSign, FileClock, FileX2, ReceiptText } from "lucide-react";
import type { BillingStats as Stats } from "../../types/invoice";
import { formatMoney } from "../../utils/invoiceUtils";

type Props = { stats: Stats | null; loading: boolean };

export function BillingStats({ stats, loading }: Props) {
  const cards = [
    { label: "Por facturar", value: stats ? formatMoney(stats.pendingAmount) : "", icon: CircleDollarSign, tone: "from-blue-500 to-blue-600" },
    { label: "Facturado", value: stats ? formatMoney(stats.invoicedAmount) : "", icon: ReceiptText, tone: "from-emerald-500 to-emerald-600" },
    { label: "Cotizaciones pendientes", value: stats ? String(stats.pendingQuotes) : "", icon: FileClock, tone: "from-amber-500 to-amber-600" },
    { label: "Facturas canceladas", value: stats ? String(stats.canceledInvoices) : "", icon: FileX2, tone: "from-slate-500 to-slate-600" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-slate-500">{c.label}</p>
            <span className={`rounded-xl bg-gradient-to-br ${c.tone} p-2 text-white shadow-sm`}>
              <c.icon className="h-4 w-4" />
            </span>
          </div>
          {loading && !stats ? (
            <div className="mt-3 h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{c.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

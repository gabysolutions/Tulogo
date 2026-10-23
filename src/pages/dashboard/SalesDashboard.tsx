import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, Clock, Wallet, type LucideIcon } from "lucide-react";

import { getQuotes } from "../../services/quote.service"; 
import { QuoteStatus } from "../../types/quote";
import type { Quote } from "../../types/quote";
import { getApiErrorMessage } from "../../utils/apiError";

const STATUS_BADGE: Record<QuoteStatus, { label: string; classes: string }> = {
  [QuoteStatus.CANCELADA]: { label: "Cancelada", classes: "bg-red-50 text-red-700 border-red-200" },
  [QuoteStatus.PENDIENTE]: { label: "Pendiente", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  [QuoteStatus.ACEPTADA]: { label: "Aceptada", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  [QuoteStatus.LIQUIDADA]: { label: "Liquidada", classes: "bg-blue-50 text-blue-700 border-blue-200" },
};

interface StatCardProps {
  label: string;
  value: number | null;
  icon: LucideIcon;
  tone: string;
  to: string;
}

function StatCard({ label, value, icon: Icon, tone, to }: StatCardProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="size-6" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm text-slate-500">{label}</span>
        {value === null ? (
          <span className="mt-1 h-8 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          <span className="text-3xl font-semibold text-slate-800">{value}</span>
        )}
      </div>
    </Link>
  );
}

const SalesDashboard = () => {
  const [counts, setCounts] = useState<{ pending: number; accepted: number; settled: number } | null>(null);
  const [recent, setRecent] = useState<Quote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getQuotes({ status: QuoteStatus.PENDIENTE, page: 1 }),
      getQuotes({ status: QuoteStatus.ACEPTADA, page: 1 }),
      getQuotes({ status: QuoteStatus.LIQUIDADA, page: 1 }),
      getQuotes({ page: 1 }),
    ])
      .then(([pending, accepted, settled, all]) => {
        if (cancelled) return;
        setCounts({
          pending: pending.pagination.total,
          accepted: accepted.pagination.total,
          settled: settled.pagination.total,
        });
        setRecent(all.quotes.slice(0, 5));
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "No se pudo cargar el resumen de ventas."));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-800">Ventas</h1>
          <p className="text-sm text-slate-500">Resumen de tus cotizaciones</p>
        </header>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Pendientes" value={counts?.pending ?? null} icon={Clock} tone="bg-amber-50 text-amber-600" to="/cotizaciones" />
          <StatCard label="Aceptadas" value={counts?.accepted ?? null} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" to="/cotizaciones" />
          <StatCard label="Liquidadas" value={counts?.settled ?? null} icon={Wallet} tone="bg-blue-50 text-blue-600" to="/cotizaciones" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Últimas cotizaciones</h2>
            <Link to="/cotizaciones" className="flex items-center text-sm font-medium text-blue-600">
              Ver todas <ChevronRight className="size-4" />
            </Link>
          </div>

          {recent === null ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-slate-400">Sin cotizaciones todavía</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((q) => {
                const badge = STATUS_BADGE[q.status];
                return (
                  <li key={q.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 flex-col leading-tight">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-slate-800">{q.folio}</span>
                        {badge && (
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge.classes}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <span className="truncate text-sm text-slate-500">{q.clientName}</span>
                    </div>
                    <div className="flex flex-col items-end leading-tight">
                      <span className="text-sm font-medium text-slate-800">
                        {q.total.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                      </span>
                      <span className="text-xs text-slate-400">Entrega {q.deliveryDate}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default SalesDashboard;
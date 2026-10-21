import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { BillingQuotesQuery, BillingStatusFilter } from "../../types/invoice";
import { useBilling } from "../../hooks/useBilling";
import { BillingStats } from "../../components/billing/BillingStats";
import { BillingFilters } from "../../components/billing/BillingFilters";
import { BillingTable } from "../../components/billing/BillingTable";
import { QuoteBillingDrawer } from "../../components/billing/QuoteBillingDrawer";
import { Pagination } from "../../components/billing/Pagination";

const PAGE_SIZE = 8;

export default function Invoices() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BillingStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [openQuoteId, setOpenQuoteId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const query = useMemo<BillingQuotesQuery>(() => ({ search, status, page, pageSize: PAGE_SIZE }), [search, status, page]);
  const billing = useBilling(query);
  const { rows, stats, pagination, loading, error, refresh } = billing;

  const handleStatus = useCallback((s: BillingStatusFilter) => {
    setStatus(s);
    setPage(1);
  }, []);
  const closeDrawer = useCallback(() => setOpenQuoteId(null), []);

  return (
    <div className="mx-auto max-full space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-start justify-between gap-3 sm:items-end sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Facturación
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Emite y da seguimiento a las facturas de tus cotizaciones.
          </p>
        </div>

        <button
          onClick={() => void refresh()}
          aria-label="Actualizar"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      <BillingStats stats={stats} loading={loading} />
      <BillingFilters search={searchInput} onSearchChange={setSearchInput} status={status} onStatusChange={handleStatus} />

      {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error.message}</div>}

      <div>
        <BillingTable rows={rows} loading={loading} onOpen={setOpenQuoteId} />
        {pagination && pagination.total > 0 && <Pagination pagination={pagination} onPageChange={setPage} disabled={loading} />}
      </div>

      <QuoteBillingDrawer quoteId={openQuoteId} onClose={closeDrawer} actions={billing} />
    </div>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BillingPagination } from "../../types/invoice";

type Props = { pagination: BillingPagination; onPageChange: (p: number) => void; disabled?: boolean };

export function Pagination({ pagination, onPageChange, disabled }: Props) {
  const { page, totalPages, total, hasNext, hasPrev } = pagination;
  const btn =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-3 text-sm text-slate-500">
      <span>
        {total} {total === 1 ? "registro" : "registros"}
      </span>
      <div className="flex items-center gap-2">
        <button className={btn} disabled={!hasPrev || disabled} onClick={() => onPageChange(page - 1)} aria-label="Anterior">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-20 text-center">
          Página {page} de {totalPages}
        </span>
        <button className={btn} disabled={!hasNext || disabled} onClick={() => onPageChange(page + 1)} aria-label="Siguiente">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

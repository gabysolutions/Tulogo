import { Search, X } from "lucide-react";
import type { BillingSourceFilter, BillingStatusFilter } from "../../types/invoice";

const STATUS_SEGMENTS: { value: BillingStatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "none", label: "Sin facturar" },
  { value: "partial", label: "Parcial" },
  { value: "complete", label: "Facturada" },
];

const TYPE_SEGMENTS: { value: BillingSourceFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "quote", label: "Cotizaciones" },
  { value: "sale", label: "Ventas" },
];

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: BillingStatusFilter;
  onStatusChange: (v: BillingStatusFilter) => void;
  type: BillingSourceFilter;
  onTypeChange: (v: BillingSourceFilter) => void;
};

function Segments<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-x-auto rounded-xl bg-slate-100 p-1">
      {options.map((s) => (
        <button
          type="button"
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
            value === s.value ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function BillingFilters({ search, onSearchChange, status, onStatusChange, type, onTypeChange }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
          placeholder="Buscar por cliente…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Segments options={STATUS_SEGMENTS} value={status} onChange={onStatusChange} />
      <Segments options={TYPE_SEGMENTS} value={type} onChange={onTypeChange} />
    </div>
  );
}
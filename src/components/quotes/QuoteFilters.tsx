import { Search,  RotateCcw } from "lucide-react";

import { QuotePriority, QuoteStatus } from "../../types/quote";

interface Props {
  priority: QuotePriority | "all";
  search: string;
  status: number | "all";
  dateFrom: string;
  dateTo: string;
  onSearch: (value: string) => void;
  onStatusChange: (value: number | "all") => void;
  onPriorityChange: (value: QuotePriority | "all") => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function QuoteFilters({
  priority,
  search,
  status,
  dateFrom,
  dateTo,
  onSearch,
  onStatusChange,
  onPriorityChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Buscar */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por nombre de  cliente."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm transition-all outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Estado */}
        <select
          value={status}
          onChange={(e) =>
            onStatusChange(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
          className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="all">Todos los estados</option>
          <option value={QuoteStatus.PENDIENTE}>Pendiente</option>
          <option value={QuoteStatus.ACEPTADA}>Aceptada</option>
          <option value={QuoteStatus.CANCELADA}>Cancelada</option>
          <option value={QuoteStatus.LIQUIDADA}>Liquidada</option>
        </select>

        {/* Fecha desde */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Desde
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            max={dateTo || undefined}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Fecha hasta */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Hasta
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            min={dateFrom || undefined}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Prioridad (deshabilitado, sin lógica aún) */}
        <select value={priority}
          onChange={(e) => onPriorityChange(e.target.value as QuotePriority | "all")}
          className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="all">Todas las Prioridades</option>
          <option>{QuotePriority.ALTA}</option>
          <option>{QuotePriority.MEDIA}</option>
          <option>{QuotePriority.BAJA}</option>
        </select>

       

        {/* Limpiar */}
        <button
          onClick={onClearFilters}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <RotateCcw size={18} />
          Limpiar
        </button>
      </div>
    </div>
  );
}
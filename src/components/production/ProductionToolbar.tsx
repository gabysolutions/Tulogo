import { Search, X } from "lucide-react";
import { STAGES } from "../../types/order";
import type { Priority } from "../../types/order";
import type { ProductionFilters } from "../../hooks/useProduction";

export type SortKey = "delivery" | "priority" | "pieces";

export interface FilterOption {
  id: number;
  name: string;
}

interface Props {
  filters: ProductionFilters;
  sort: SortKey;
  onFilterChange: <K extends keyof ProductionFilters>(key: K, value: ProductionFilters[K]) => void;
  onSortChange: (sort: SortKey) => void;
  designers: FilterOption[];
  clients: FilterOption[];
  resultCount: number;
  hasActiveFilters: boolean;
  onReset: () => void;
}

const selectClass =
  "h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function ProductionToolbar({
  filters,
  sort,
  onFilterChange,
  onSortChange,
  designers,
  clients,
  resultCount,
  hasActiveFilters,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Buscar por nombre..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.priority ?? ""}
            onChange={(e) =>
              onFilterChange("priority", e.target.value ? (e.target.value as Priority) : undefined)
            }
            className={selectClass}
          >
            <option value="">Toda prioridad</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          {designers.length > 0 && (
            <select
              value={filters.designerId ?? ""}
              onChange={(e) =>
                onFilterChange("designerId", e.target.value ? Number(e.target.value) : undefined)
              }
              className={selectClass}
            >
              <option value="">Todo diseñador</option>
              {designers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {clients.length > 0 && (
            <select
              value={filters.clientId ?? ""}
              onChange={(e) =>
                onFilterChange("clientId", e.target.value ? Number(e.target.value) : undefined)
              }
              className={selectClass}
            >
              <option value="">Todo cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className={selectClass}
          >
            <option value="delivery">Ordenar: Entrega</option>
            <option value="priority">Ordenar: Prioridad</option>
            <option value="pieces">Ordenar: Piezas</option>
          </select>

          {(hasActiveFilters || sort !== "delivery") && (
            <button
              onClick={onReset}
              className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <X size={16} /> Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <div className="flex flex-nowrap gap-1.5">
          <button
            onClick={() => onFilterChange("status", undefined)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              filters.status === undefined
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Todos
          </button>

          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => onFilterChange("status", s.id)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                filters.status === s.id
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
          {resultCount} órdenes
        </span>
      </div>
    </div>
  );
}
import { Search } from "lucide-react";

import { STAGES } from "../../types/order";

export interface Filters {
  client: string;
  folio: string;
  designer: string; 
  priority: string;
  stage: string;
  onlyPending: boolean;
}

export const emptyFilters: Filters = {
  client: "",
  folio: "",
  designer: "all",
  priority: "all",
  stage: "all",
  onlyPending: false,
};

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  designers: string[];
}

const fieldClass =
  "h-10 rounded-lg border border-gray-300 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const inputClass = `${fieldClass} w-full pl-9 pr-3`;
const selectClass = `${fieldClass} px-3`;

export function AgendaFilters({ filters, onChange, designers }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Cliente */}
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filters.client}
          onChange={(e) => set("client", e.target.value)}
          placeholder="Buscar cliente"
          className={inputClass}
        />
      </div>

      {/* Folio */}
      <div className="relative min-w-[170px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filters.folio}
          onChange={(e) => set("folio", e.target.value)}
          placeholder="Buscar folio"
          className={inputClass}
        />
      </div>

      {/* Diseñador */}
      <select
        value={filters.designer}
        onChange={(e) => set("designer", e.target.value)}
        className={selectClass}
      >
        <option value="all">Todos los diseñadores</option>
        {designers.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {/* Prioridad */}
      <select
        value={filters.priority}
        onChange={(e) => set("priority", e.target.value)}
        className={selectClass}
      >
        <option value="all">Toda prioridad</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>

      {/* Estado */}
      <select
        value={filters.stage}
        onChange={(e) => set("stage", e.target.value)}
        className={selectClass}
      >
        <option value="all">Todos los estados</option>
        {STAGES.map((stage) => (
          <option key={stage.id} value={String(stage.id)}>
            {stage.label}
          </option>
        ))}
      </select>

      {/* Switch */}
      <label
        htmlFor="onlyPending"
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <input
          id="onlyPending"
          type="checkbox"
          checked={filters.onlyPending}
          onChange={(e) => set("onlyPending", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Solo pendientes
      </label>
    </div>
  );
}
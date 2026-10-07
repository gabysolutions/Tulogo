import type { ChangeEvent } from "react";
import type { CatalogOption } from "../../constants/sat-catalogs";

interface CatalogSelectProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: CatalogOption[];
}

const selectClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500";

export function CatalogSelect({ value, onChange, options }: CatalogSelectProps) {
  
  const isKnown = !value || options.some((o) => o.value === value);

  return (
    <select className={selectClass} value={value} onChange={onChange}>
      <option value="">Selecciona una opción</option>
      {!isKnown && <option value={value}>{value} (fuera de catálogo)</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.value} · {o.label}
        </option>
      ))}
    </select>
  );
}
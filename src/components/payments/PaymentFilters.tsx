import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import type { PaymentFilters as Filters } from "../../types/payment";

/* ───────────────────────── UI local (Tailwind) ───────────────────────── */

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border bg-card px-3 text-sm outline-none",
        "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

function Button({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-card px-4 text-sm font-medium whitespace-nowrap transition-colors hover:bg-secondary",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

/* ───────────────────────── PaymentFilters ───────────────────────── */

const STATUS_TABS: { label: string; value: number | undefined }[] = [
  { label: "Todos", value: undefined },
  { label: "Activos", value: 1 },
  { label: "Cancelados", value: 0 },
];

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

export function PaymentFilters({ filters, onChange, onReset }: Props) {
  return (
    <section className="card-elevated space-y-4 p-5">
      <div role="tablist" className="flex w-full rounded-xl bg-secondary p-1 sm:w-fit">
        {STATUS_TABS.map((tab) => {
          const selected = filters.status === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange({ status: tab.value })}
              className={cn(
                "flex-1 rounded-lg px-4 py-1.5 text-sm transition-colors sm:flex-none",
                selected
                  ? "bg-card font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <label htmlFor="p-initial" className="text-sm leading-none font-medium">
            Fecha inicial
          </label>
          <Input
            id="p-initial"
            type="date"
            value={filters.initialDate ?? ""}
            onChange={(e) => onChange({ initialDate: e.target.value || undefined })}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="p-final" className="text-sm leading-none font-medium">
            Fecha final
          </label>
          <Input
            id="p-final"
            type="date"
            value={filters.finalDate ?? ""}
            onChange={(e) => onChange({ finalDate: e.target.value || undefined })}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="p-quote" className="text-sm leading-none font-medium">
            No. de cotización
          </label>
          <Input
            id="p-quote"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="Ej. 9"
            value={filters.quoteId ?? ""}
            onChange={(e) =>
              onChange({ quoteId: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onReset}>Limpiar filtros</Button>
      </div>
    </section>
  );
}
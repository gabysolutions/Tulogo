import { useState, type InputHTMLAttributes } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import type { Payment } from "../../types/finance";
import { money, shortDate } from "../../utils/format";



const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");


function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 rounded-md border bg-card text-sm outline-none",
        "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}



const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Lunes de la semana actual
const weekStartISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toISO(d);
};



type Filter = "hoy" | "semana" | "mes" ;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
 
];

interface Props {
  payments: Payment[];
  total: number;
}

export function PaymentsList({ payments, total }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("mes");
  


  const inPeriod = (date: string) => {
    if (filter === "hoy") return date === toISO(new Date());
    if (filter === "semana") return date >= weekStartISO();
    return true;
  };

  const visible = payments
    .filter((p) => inPeriod(p.registration_date))
    .filter((p) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [`cotizacion ${p.quoteId}`, p.payment_method, p.register_user]
        .join(" ")
        .toLowerCase()
        .includes(q);
    })
    .sort((a, b) => b.registration_date.localeCompare(a.registration_date) || b.id - a.id);

  const filtered = filter !== "mes" || query.trim() !== "";
  const shownTotal = filtered ? visible.reduce((sum, p) => sum + p.amount, 0) : total;

  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Pagos y anticipos recibidos</h2>
          <p className="text-sm text-muted-foreground">Historial del dinero recibido por ventas.</p>
        </div>
        <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success">
          {money(shownTotal)}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div role="tablist" className="flex w-full rounded-xl bg-secondary p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-sm transition-colors",
                filter === f.value
                  ? "bg-card font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

       

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-full pr-3 pl-9"
            placeholder="Buscar cotización, método o usuario"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <ul className="mt-4 divide-y">
        {visible.map((p) => (
          <li key={p.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{shortDate(p.registration_date)}</p>
              <p className="truncate font-medium">Cotización #{p.quoteId}</p>
              <p className="truncate text-sm text-muted-foreground capitalize">
                {p.payment_method} · {p.register_user}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1 font-semibold text-success">
              <ArrowUpRight className="size-4" />+{money(p.amount)}
            </span>
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Sin ingresos registrados en este periodo.
        </p>
      )}
    </div>
  );
}
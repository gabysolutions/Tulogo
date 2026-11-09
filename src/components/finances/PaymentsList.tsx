import { useState, type InputHTMLAttributes } from "react";
import { ArrowUpRight, Search, ChevronLeft, ChevronRight,} from "lucide-react";
import type { Payment } from "../../types/finance";
import { money, shortDate } from "../../utils/format";
 const PAGE_SIZE = 10;
 
const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        // text-base en móvil evita el zoom automático de iOS al enfocar el input
        "h-10 rounded-md border bg-card text-base outline-none sm:h-9 sm:text-sm",
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

type Filter = "hoy" | "semana" | "mes";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
];
 const documentLabel = (p: Payment) =>
  `${p.type === "sale" ? "Venta" : "Cotización"} #${p.documentId}`;

interface Props {
  payments: Payment[];
  total: number;
}

export function PaymentsList({ payments, total }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("mes");
 
  const [page, setPage] = useState(1);

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
      return [documentLabel(p), p.payment_method, p.register_user]
      .join(" ")
      .toLowerCase()
      .includes(q);
    })
    .sort(
  (a, b) =>
    b.registration_date.localeCompare(a.registration_date) ||
    b.id - a.id ||
    a.type.localeCompare(b.type),
);

const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
const currentPage = Math.min(page, totalPages);
const pageItems = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const filtered = filter !== "mes" || query.trim() !== "";
  const shownTotal = filtered
  ? visible
      .filter((p) => Number(p.status) !== 0)
      .reduce((sum, p) => sum + Number(p.amount), 0)
  : total;

  return (
    <div className="card-elevated p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold sm:text-lg">Pagos y anticipos recibidos</h2>
          <p className="text-sm text-muted-foreground">Historial del dinero recibido por ventas.</p>
        </div>
        <span className="w-fit shrink-0 rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success">
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
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={cn(
                "flex-1 whitespace-nowrap rounded-lg px-2 py-2 text-xs transition-colors sm:px-3 sm:py-1.5 sm:text-sm",
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
            placeholder="Buscar folio, método o usuario"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <ul className="mt-4 divide-y">
        {pageItems.map((p) => {
          const cancelled = Number(p.status) === 0;

          return (
            <li key={`${p.type}-${p.id}`} className="flex items-start justify-between gap-3 py-3">
              <div className={cn("min-w-0", cancelled && "opacity-60")}>
                <p className="text-xs text-muted-foreground">{shortDate(p.registration_date)}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("truncate font-medium", cancelled && "line-through")}>
                    {documentLabel(p)}
                  </p>
                  {cancelled && (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                      Cancelado
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground capitalize">
                  {p.payment_method} · {p.register_user}
                </p>
              </div>

              {cancelled ? (
                <span className="shrink-0 text-sm font-semibold text-muted-foreground line-through sm:text-base">
                  {money(p.amount)}
                </span>
              ) : (
                <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-success sm:text-base">
                  <ArrowUpRight className="size-4" />+{money(p.amount)}
                </span>
              )}
            </li>
          );
        })}
      </ul>

       {visible.length === 0 && (
            <p className="mt-4 rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Sin ingresos registrados en este periodo.
            </p>
          )}

          {visible.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Página {currentPage} de {totalPages} · {visible.length} pagos
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-secondary disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" /> Anterior
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-secondary disabled:opacity-40"
                >
                  Siguiente <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>   
      );
    }
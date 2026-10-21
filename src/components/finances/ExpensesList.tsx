import type { ButtonHTMLAttributes } from "react";
import { ArrowDownRight, Plus, Trash } from "lucide-react";
import type { Expense } from "../../types/finance";
import { money, shortDate } from "../../utils/format";

/* ───────────────────────── Button local (Tailwind) ───────────────────────── */

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border bg-card hover:bg-secondary",
  ghost: "hover:bg-secondary",
};

const buttonSizes = {
  default: "h-10 px-4 text-sm sm:h-9",
  // h-9 en móvil para que sea fácil de tocar, h-8 desde sm
  sm: "h-9 px-3 text-xs sm:h-8",
};

function Button({
  variant = "default",
  size = "default",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

/* ───────────────────────── ExpensesList ───────────────────────── */

interface Props {
  expenses: Expense[];
  total: number;
  onCancel: (id: number) => void;
  onAdd: () => void;
}

export function ExpensesList({ expenses, total, onCancel, onAdd }: Props) {
  const sorted = [...expenses].sort(
    (a, b) => b.registration_date.localeCompare(a.registration_date) || b.id - a.id,
  );

  return (
    <div className="card-elevated p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold sm:text-lg">Gastos</h2>
          <p className="text-sm text-muted-foreground">Control de gastos e insumos del negocio.</p>
        </div>
        <span className="w-fit shrink-0 rounded-full bg-danger-soft px-3 py-1 text-sm font-semibold text-danger">
          {money(total)}
        </span>
      </div>

      <ul className="mt-4 divide-y">
        {sorted.map((e) => {
          const active = e.status === 1;
          return (
            <li
              key={e.id}
              className={`flex items-start justify-between gap-3 py-3 ${active ? "" : "opacity-50"}`}
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{shortDate(e.registration_date)}</p>
                <p className="truncate font-medium capitalize">{e.type}</p>
                <p className="truncate text-sm text-muted-foreground capitalize">
                  {e.payment_method} · {e.register_user}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`flex items-center gap-1 text-sm font-semibold text-danger sm:text-base ${
                    active ? "" : "line-through"
                  }`}
                >
                  <ArrowDownRight className="size-4" />-{money(e.amount)}
                </span>
                {active ? (
                  <Button variant="ghost" size="sm" onClick={() => onCancel(e.id)}>
                    <Trash size={16} className="text-red-600" />
                    Cancelar
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Cancelado</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {sorted.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">Sin gastos registrados en este periodo.</p>
          <Button className="mt-3 w-full sm:w-auto" size="sm" onClick={onAdd}>
            <Plus /> Registrar gasto
          </Button>
        </div>
      )}
    </div>
  );
}
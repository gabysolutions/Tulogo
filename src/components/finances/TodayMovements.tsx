import { Wallet } from "lucide-react";
import type { CurrentDay } from "../../types/finance";
import { money } from "../../utils/format";

interface Props {
  currentDay: CurrentDay;
}

export function TodayMovements({ currentDay }: Props) {
  const { date, currentMovements, paymentsTotal, expensesTotal, utility } = currentDay;

  return (
    <section className="card-elevated p-5">
      <div className="flex items-center gap-2">
        <Wallet className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Movimientos de hoy</h2>
      </div>
      <p className="text-sm text-muted-foreground capitalize">{date}</p>

      <ul className="mt-4 space-y-4">
        {currentMovements.map((m) => {
          const income = m.amount > 0; // positivo = ingreso, negativo = egreso

          return (
            <li
              key={`${m.id}-${m.registration_date}-${m.amount}`}
              className="flex items-start gap-3"
            >
              <span
                className={`mt-1.5 size-2.5 shrink-0 rounded-full ${income ? "bg-success" : "bg-danger"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{m.description}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      income ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                    }`}
                  >
                    {income ? "Ingreso" : "Egreso"}
                  </span>
                </div>

                <p className="truncate text-sm text-muted-foreground capitalize">
                  {m.payment_method} · {m.register_user}
                </p>
              </div>
              <span
                className={`shrink-0 font-semibold ${income ? "text-success" : "text-danger"}`}
              >
                {income ? "+" : "-"}
                {money(Math.abs(m.amount))}
              </span>
            </li>
          );
        })}
      </ul>

      {currentMovements.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">Sin movimientos registrados hoy.</p>
      )}

      <div className="mt-5 grid gap-3 border-t pt-4 sm:grid-cols-3">
        <Total label="Ingresos de hoy" value={money(paymentsTotal)} className="text-success" />
        <Total label="Gastos de hoy" value={money(expensesTotal)} className="text-danger" />
        <Total label="Utilidad del día" value={money(utility)} className="text-foreground" />
      </div>
    </section>
  );
}

function Total({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="rounded-lg bg-secondary px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold ${className}`}>{value}</p>
    </div>
  );
}
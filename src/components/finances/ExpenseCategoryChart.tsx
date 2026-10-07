import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { MonthlyExpenses } from "../../types/finance";
import { money } from "../../utils/format";

const LABELS: Record<keyof MonthlyExpenses, string> = {
  rent: "Renta",
  material: "Material",
  transport: "Transporte",
  publicity: "Publicidad",
  maintenance: "Mantenimiento",
  service: "Servicios",
};

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];

export function ExpenseCategoryChart({ monthlyExpenses }: { monthlyExpenses: MonthlyExpenses }) {
  const data = (Object.keys(monthlyExpenses) as (keyof MonthlyExpenses)[])
    .map((key) => ({ nombre: LABELS[key], total: monthlyExpenses[key] }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div className="card-elevated p-5">
      <h2 className="text-lg font-semibold">Categorías de gastos</h2>
      <p className="text-sm text-muted-foreground">En qué se está gastando el dinero.</p>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Sin gastos registrados en este periodo.</p>
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-2">
          <div className="mt-2 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="nombre"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => money(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {data.map((c, i) => (
              <li key={c.nombre} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="flex-1 truncate">{c.nombre}</span>
                <span className="font-medium">{money(c.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
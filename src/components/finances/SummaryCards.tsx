import type { ReactNode } from "react";
import { PiggyBank, Receipt, Scale, TrendingUp } from "lucide-react";
import { money, monthLabel } from "../../utils/format";

interface Props {
  utility: number;
  payments: number;
  expenses: number;
  month: string;
}

export function SummaryCards({ utility, payments, expenses, month }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        icon={<TrendingUp className="size-5" />}
        value={money(utility)}
        title="Utilidad del mes"
        note="Ingresos menos gastos"
        highlight
      />
      <Card
        icon={<PiggyBank className="size-5" />}
        value={money(payments)}
        title="Ingresos del mes"
        note="Pagos y anticipos recibidos"
        tone="success"
      />
      <Card
        icon={<Receipt className="size-5" />}
        value={money(expenses)}
        title="Gastos del mes"
        note="Gastos registrados"
        tone="danger"
      />
      <Card
        icon={<Scale className="size-5" />}
        value={money(utility)}
        title="Balance"
        note={`Periodo: ${monthLabel(month)}`}
      />
    </section>
  );
}

function Card({
  icon,
  value,
  title,
  note,
  tone,
  highlight,
}: {
  icon: ReactNode;
  value: string;
  title: string;
  note: string;
  tone?: "success" | "danger";
  highlight?: boolean;
}) {
  const color = tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "";
  return (
    <div className={`card-elevated p-5 ${highlight ? "!border-transparent !bg-primary text-primary-foreground" : ""}`}>
      <span
        className={`flex size-9 items-center justify-center rounded-lg ${
          highlight ? "bg-primary-foreground/15" : "bg-secondary"
        }`}
      >
        {icon}
      </span>
      <p className={`mt-4 text-3xl font-bold tracking-tight ${highlight ? "" : color}`}>{value}</p>
      <p className="mt-1 font-medium">{title}</p>
      <p className={`text-sm ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{note}</p>
    </div>
  );
}
import type { ReactNode } from "react";
import { Ban, PiggyBank, Receipt } from "lucide-react";
import type { Payment } from "../../types/finance";
import { money } from "../../utils/format";

interface Props {
  payments: Payment[]; // los de la página actual
  total: number; // total de pagos que cumplen los filtros (todas las páginas)
}

export function PaymentsSummary({ payments, total }: Props) {
  const collected = payments.filter((p) => p.status === 1).reduce((sum, p) => sum + p.amount, 0);
  const cancelled = payments.filter((p) => p.status !== 1).length;

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <Card
        icon={<PiggyBank className="size-5" />}
        value={money(collected)}
        title="Cobrado en esta página"
        note="Suma de pagos activos"
        highlight
      />
      <Card
        icon={<Receipt className="size-5" />}
        value={String(total)}
        title="Pagos encontrados"
        note="Según los filtros aplicados"
      />
      <Card
        icon={<Ban className="size-5" />}
        value={String(cancelled)}
        title="Cancelados en esta página"
        note="Pagos con estado cancelado"
        danger
      />
    </section>
  );
}

function Card({
  icon,
  value,
  title,
  note,
  highlight,
  danger,
}: {
  icon: ReactNode;
  value: string;
  title: string;
  note: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className={`card-elevated p-5 ${highlight ? "!border-transparent !bg-primary text-primary-foreground" : ""}`}>
      <span
        className={`flex size-9 items-center justify-center rounded-lg ${
          highlight ? "bg-primary-foreground/15" : "bg-secondary"
        }`}
      >
        {icon}
      </span>
      <p className={`mt-4 text-3xl font-bold tracking-tight ${danger ? "text-danger" : ""}`}>{value}</p>
      <p className="mt-1 font-medium">{title}</p>
      <p className={`text-sm ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{note}</p>
    </div>
  );
}
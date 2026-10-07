import type { ButtonHTMLAttributes } from "react";
import type { Payment } from "../../types/finance";
import { money, shortDateTime } from "../../utils/format";
import {  Trash,Eye  } from "lucide-react";

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

function RowButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors hover:bg-secondary",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

interface Props {
  payments: Payment[];
  onView: (id: number) => void;
  onCancel: (id: number) => void;
}

export function PaymentsTable({ payments, onView, onCancel }: Props) {
  if (payments.length === 0) {
    return (
      <div className="card-elevated p-5">
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No hay pagos con estos filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Cotización</th>
              <th className="px-5 py-3 font-medium">Método</th>
              <th className="px-5 py-3 font-medium">Registrado por</th>
              <th className="px-5 py-3 text-right font-medium">Monto</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const active = p.status === 1;
              return (
                <tr key={p.id} className={cn("border-b last:border-b-0", !active && "opacity-60")}>
                  <td className="px-5 py-3 whitespace-nowrap">{shortDateTime(p.registration_date)}</td>
                  <td className="px-5 py-3 font-medium whitespace-nowrap">#{p.quoteId}</td>
                  <td className="px-5 py-3 capitalize">{p.payment_method}</td>
                  <td className="px-5 py-3">{p.register_user}</td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right font-semibold whitespace-nowrap",
                      active ? "text-success" : "text-muted-foreground line-through",
                    )}
                  >
                    {money(p.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        active ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
                      )}
                    >
                      {active ? "Activo" : "Cancelado"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <RowButton className="text-blue-600" onClick={() => onView(p.id)}> <Eye size={16} className="text-blue-600"/> </RowButton>
                    {active && (
                      <RowButton className="text-red-600" onClick={() => onCancel(p.id)}>
                        <Trash size={16} className="text-red-600" />
                      </RowButton>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
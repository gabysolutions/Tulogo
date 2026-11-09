import type { ButtonHTMLAttributes } from "react";
import type { Payment, PaymentRef } from "../../types/payment";
import { money, shortDateTime } from "../../utils/format";
import { folioFromId } from "../../utils/folio";
import { Trash, Eye } from "lucide-react";

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

const documentLabel = (p: Payment) =>
  p.type === "sale" ? folioFromId(p.documentId) : `#${p.documentId}`;

interface Props {
  payments: Payment[];
  onView: (ref: PaymentRef) => void;
  onCancel: (ref: PaymentRef) => void;
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
              <th className="px-5 py-3 font-medium">Documento</th>
              <th className="px-5 py-3 font-medium">Método</th>
              <th className="px-5 py-3 font-medium">Registrado por</th>
              <th className="px-5 py-3 text-right font-medium">Monto</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const active = Number(p.status) === 1;
              const ref: PaymentRef = { id: p.id, type: p.type };
              return (
                <tr
                  key={`${p.type}-${p.id}`}
                  className={cn("border-b last:border-b-0", !active && "opacity-60")}
                >
                  <td className="px-5 py-3 whitespace-nowrap">{shortDateTime(p.registration_date)}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{documentLabel(p)}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          p.type === "sale"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700",
                        )}
                      >
                        {p.type === "sale" ? "Venta" : "Cotización"}
                      </span>
                    </div>
                  </td>
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
                    <RowButton className="text-blue-600" onClick={() => onView(ref)}>
                      <Eye size={16} className="text-blue-600" />
                    </RowButton>
                    {active && (
                      <RowButton className="text-red-600" onClick={() => onCancel(ref)}>
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
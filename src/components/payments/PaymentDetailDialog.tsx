import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { paymentService } from "../../services/payment.service";
import type { Payment } from "../../types/finance";
import { money, shortDateTime } from "../../utils/format";

/* ───────────────────────── UI local (Tailwind) ───────────────────────── */

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

function Button({
  variant = "outline",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outline" | "danger" }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium whitespace-nowrap transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        variant === "outline" && "border bg-card hover:bg-secondary",
        variant === "danger" && "bg-danger text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

/* ───────────────────────── PaymentDetailDialog ───────────────────────── */

interface Props {
  paymentId: number | null; // null = cerrado
  onClose: () => void;
  onCancel: (id: number) => void;
}

export function PaymentDetailDialog({ paymentId, onClose, onCancel }: Props) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (paymentId === null) return;
    let active = true;
    setPayment(null);
    setError("");
    setLoading(true);
    paymentService
      .getPaymentById(paymentId)
      .then((res) => active && setPayment(res))
      .catch(() => active && setError("No se pudo cargar el pago."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [paymentId]);

  useEffect(() => {
    if (paymentId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [paymentId, onClose]);

  if (paymentId === null) return null;

  const active = payment?.status === 1;

  return createPortal(
    <div className="finance-theme fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 grid w-full max-w-md gap-4 rounded-xl border bg-card p-6 shadow-xl"
      >
        <div className="pr-6">
          <h2 className="text-lg font-semibold">Detalle del pago #{paymentId}</h2>
          <p className="text-sm text-muted-foreground">Información registrada del pago.</p>
        </div>

        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-secondary"
        >
          <X className="size-4" />
        </button>

        {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {error && <p className="text-sm text-danger">{error}</p>}

        {payment && (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Monto">
              <span className={active ? "text-success" : "text-muted-foreground line-through"}>
                {money(payment.amount)}
              </span>
            </Field>
            <Field label="Estado">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  active ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
                )}
              >
                {active ? "Activo" : "Cancelado"}
              </span>
            </Field>
            <Field label="Cotización">#{payment.quoteId}</Field>
            <Field label="Método de pago">
              <span className="capitalize">{payment.payment_method}</span>
            </Field>
            <Field label="Fecha de registro">{shortDateTime(payment.registration_date)}</Field>
            <Field label="Registrado por">{payment.register_user}</Field>
          </dl>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose}>Cerrar</Button>
          {active && (
            <Button variant="danger" onClick={() => onCancel(payment!.id)}>
              Cancelar pago
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
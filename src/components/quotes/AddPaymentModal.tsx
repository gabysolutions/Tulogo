import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";

import type { Quote } from "../../types/quote";
import { PaymentMethod } from "../../types/payment";
import { addPayment } from "../../services/payment.service";

interface Props {
  quote: Quote | null;
  onClose: () => void;
  onSaved: () => void;
}

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.EFECTIVO]: "Efectivo",
  [PaymentMethod.TRANSFERENCIA]: "Transferencia",
};

const fmt = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function AddPaymentModal({ quote, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.EFECTIVO);
  const [saving, setSaving] = useState(false);
  
  const [hidden, setHidden] = useState(false);

  if (!quote || hidden) return null;

  const amountNumber = Number(amount) || 0;
  const exceedsBalance = amountNumber > quote.balanceDue;
  const canSave = amountNumber > 0 && !exceedsBalance;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setHidden(true); 

    Swal.fire({
      title: "Registrando abono…",
      text: "Por favor espera un momento.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await addPayment({
        quoteId: quote.id,
        amount: amountNumber,
        paymentMethod,
      });

      const remaining = quote.balanceDue - amountNumber;

      Swal.fire({
        icon: "success",
        title: "¡Abono registrado!",
        html:
          `Se aplicaron <b>${fmt(amountNumber)}</b> a la cotización <b>${quote.folio}</b>.<br/>` +
          (remaining > 0
            ? `Saldo pendiente: <b>${fmt(remaining)}</b>`
            : "La cotización quedó <b>liquidada</b>."),
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      setAmount("");
      onSaved();
      onClose();
      setHidden(false);
    } catch {
      await Swal.fire({
        icon: "error",
        title: "No se pudo registrar el abono",
        text: "Intenta de nuevo en unos segundos.",
      });
      setHidden(false); // el modal vuelve con el monto y método que ya habías capturado
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Registrar abono</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {quote.folio} · {quote.clientName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-5">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo pendiente</span>
                <span className="font-semibold text-amber-700">{fmt(quote.balanceDue)}</span>
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Monto</span>
              <input
                autoFocus
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {exceedsBalance && (
                <p className="mt-1 text-xs text-red-500">
                  El abono no puede ser mayor al saldo pendiente ({fmt(quote.balanceDue)}).
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Método de pago</span>
              <select
                className={inputCls}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                {Object.values(PaymentMethod).map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !canSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Registrar abono"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
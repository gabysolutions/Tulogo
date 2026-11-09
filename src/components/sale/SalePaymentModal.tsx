import { useEffect, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import type { AddSalePaymentPayload, PaymentMethod, Sale } from "../../types/sale";
import { ModalFooter, ModalShell, formatMoney, getErrorMessage, inputClass } from "../sale/SaleUi";

interface Props {
  sale: Sale | null;
  onClose: () => void;
  onSave: (id: number, payload: AddSalePaymentPayload) => Promise<void>;
}

export function SalePaymentModal({ sale, onClose, onSave }: Props) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sale) return;
    setAmount("");
    setPaymentMethod("EFECTIVO");
  }, [sale]);

  if (!sale) return null;

  const amountNum = Number(amount);
  const amountValid = amountNum > 0 && amountNum <= sale.balanceDue;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(sale.id, { paymentMethod, amount: amountNum });
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar el abono",
        text: getErrorMessage(err, "Intenta de nuevo en unos segundos."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Registrar abono · ${sale.clientName}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm">
            <div>
              <p className="text-xs text-slate-400">Total</p>
              <p className="font-semibold text-slate-800">{formatMoney(sale.total)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Abonado</p>
              <p className="font-semibold text-emerald-600">{formatMoney(sale.advance)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Saldo</p>
              <p className="font-semibold text-red-600">{formatMoney(sale.balanceDue)}</p>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Monto</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            {amount !== "" && !amountValid && (
              <span className="mt-1 block text-[11px] text-red-600">
                Debe ser mayor a 0 y no superar el saldo ({formatMoney(sale.balanceDue)}).
              </span>
            )}
            <button
              type="button"
              onClick={() => setAmount(String(sale.balanceDue))}
              className="mt-1 text-[11px] font-medium text-blue-600 hover:underline"
            >
              Liquidar saldo completo
            </button>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Método de pago</span>
            <select
              className={inputClass}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </label>
        </div>

        <ModalFooter onClose={onClose} saving={saving} disabled={!amountValid} submitLabel="Registrar abono" />
      </form>
    </ModalShell>
  );
}
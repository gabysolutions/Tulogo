
import { useEffect, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import type { Sale, UpdateSalePayload } from "../../types/sale";
import { ModalFooter, ModalShell, getErrorMessage, inputClass } from "../sale/SaleUi";

interface Props {
  sale: Sale | null;
  onClose: () => void;
  onSave: (id: number, payload: UpdateSalePayload) => Promise<void>;
}

export function SaleEditModal({ sale, onClose, onSave }: Props) {
  const [iva, setIva] = useState(false);
  const [sending, setSending] = useState(false);
  const [shippingAmount, setShippingAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sale) return;
    setIva(sale.iva);
    setSending(sale.sending);
    setShippingAmount(sale.shippingAmount ? String(sale.shippingAmount) : "");
  }, [sale]);

  if (!sale) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(sale.id, {
        iva,
        sending,
        shippingAmount: sending ? Number(shippingAmount) || 0 : 0,
      });
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar la venta",
        text: getErrorMessage(err, "Intenta de nuevo en unos segundos."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Editar venta V-${String(sale.id).padStart(4, "0")}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 px-5 py-5">
          <p className="text-xs text-slate-400">
            Aquí solo se modifican IVA y envío. Los artículos de la venta no se editan.
          </p>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={iva} onChange={(e) => setIva(e.target.checked)} />
            Incluir IVA
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={sending} onChange={(e) => setSending(e.target.checked)} />
            Con envío
          </label>

          {sending && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Costo de envío</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={shippingAmount}
                onChange={(e) => setShippingAmount(e.target.value)}
              />
            </label>
          )}
        </div>

        <ModalFooter onClose={onClose} saving={saving} disabled={false} submitLabel="Guardar cambios" />
      </form>
    </ModalShell>
  );
}
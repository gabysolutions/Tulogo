import { useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import type { ClientAddress, ClientAddressPayload } from "../../types/client";

interface ClientAddressFormModalProps {
  open: boolean;
  address: ClientAddress | null; // null = creando
  onClose: () => void;
  onSave: (payload: ClientAddressPayload) => Promise<void>;
}

const EMPTY_FORM: ClientAddressPayload = {
  state: "",
  city: "",
  zipCode: "",
  neighborhood: "",
  street: "",
  number: "",
};

const inputClass =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500";

export function ClientAddressFormModal({ open, address, onClose, onSave }: ClientAddressFormModalProps) {
  const [form, setForm] = useState<ClientAddressPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (address) {
      const { state, city, zipCode, neighborhood, street, number } = address;
      setForm({ state, city, zipCode, neighborhood, street, number });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [address, open]);

  if (!open) return null;

  const handleChange = (field: keyof ClientAddressPayload) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      Swal.fire({
        icon: "error",
        title: address ? "No se pudo actualizar la dirección" : "No se pudo agregar la dirección",
        text: "Intenta de nuevo en unos segundos.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">
            {address ? "Editar dirección" : "Agregar dirección"}
          </h3>
          <button type="button" onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Estado">
                <input className={inputClass} value={form.state} onChange={handleChange("state")} />
              </Field>
              <Field label="Ciudad">
                <input className={inputClass} value={form.city} onChange={handleChange("city")} />
              </Field>
              <Field label="Colonia">
                <input className={inputClass} value={form.neighborhood} onChange={handleChange("neighborhood")} />
              </Field>
              <Field label="Código postal">
                <input className={inputClass} value={form.zipCode} onChange={handleChange("zipCode")} />
              </Field>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <Field label="Calle">
                <input className={inputClass} value={form.street} onChange={handleChange("street")} />
              </Field>
              <Field label="Número">
                <input className={`${inputClass} w-24`} value={form.number} onChange={handleChange("number")} />
              </Field>
            </div>
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
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : address ? "Guardar cambios" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
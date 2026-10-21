import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import type { DesignDetailById } from "../../types/design";

interface Props {
  open: boolean;
  initialDetail: DesignDetailById;
  onClose: () => void;
  onSave: (detail: DesignDetailById) => void;
}

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const readOnlyCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500">Este campo es obligatorio.</p>
      )}
    </div>
  );
}

export function DesignDetailModal({ open, initialDetail, onClose, onSave }: Props) {
  const [detail, setDetail] = useState<DesignDetailById>(initialDetail);
  const [attemptedSave, setAttemptedSave] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDetail(initialDetail);
    setAttemptedSave(false);
  }, [open, initialDetail]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const set = <K extends keyof DesignDetailById>(key: K, value: DesignDetailById[K]) =>
    setDetail((d) => ({ ...d, [key]: value }));

  const requiredMissing = {
    teamName: !detail.teamName?.trim(),
  };
  const hasErrors = Object.values(requiredMissing).some(Boolean);

  const handleSave = () => {
    setAttemptedSave(true);
    if (hasErrors) return;
    onSave(detail);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-800">Detalle del diseño</h3>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <input className={readOnlyCls} value={detail.category ?? "—"} disabled readOnly />
            </Field>

            <Field label="Artículo">
              <input className={readOnlyCls} value={detail.description ?? "—"} disabled readOnly />
            </Field>
          </div>

          <Field
            label="Nombre del equipo"
            required
            error={attemptedSave && requiredMissing.teamName}
          >
            <input
              className={inputCls}
              value={detail.teamName ?? ""}
              onChange={(e) => set("teamName", e.target.value)}
              placeholder="Ej. Halcones FC"
            />
          </Field>

          <Field label="Tipo de impresora">
            <select
              className={inputCls}
              value={detail.printerType ?? ""}
              onChange={(e) => set("printerType", e.target.value)}
            >
              <option value="">Seleccionar...</option>
              <option value="NEGRA">Negra</option>
              <option value="ROJA">Roja</option>
            </select>
          </Field>

          <Field label="Observaciones">
            <textarea
              className={`${inputCls} min-h-[100px] resize-y`}
              value={detail.observations ?? ""}
              onChange={(e) => set("observations", e.target.value)}
              placeholder="Notas para el diseñador..."
            />
          </Field>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
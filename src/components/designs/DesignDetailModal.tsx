import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Loader2, X } from "lucide-react";

import type { DesignDetail } from "../../types/design";
import { uploadToCloudinary } from "../../lib/cloudinary";

interface Props {
  open: boolean;
  initialDetail: DesignDetail;
  onClose: () => void;
  onSave: (detail: DesignDetail) => void;
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

function LogoUploadField({
  label,
  value,
  required,
  error,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  value: string | null;
  required?: boolean;
  error?: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Field label={label} required={required} error={error}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={uploading}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
          <img
            src={value}
            alt={label}
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-xs text-slate-500">{value}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {uploading ? "Subiendo..." : "Reemplazar"}
              </button>
              <button
                type="button"
                onClick={onRemove}
                disabled={uploading}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-4 text-sm text-slate-500 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Subiendo...
            </>
          ) : (
            <>
              <ImagePlus size={16} /> Subir imagen
            </>
          )}
        </button>
      )}
    </Field>
  );
}

export function DesignDetailModal({ open, initialDetail, onClose, onSave }: Props) {
  const [detail, setDetail] = useState<DesignDetail>(initialDetail);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingReverse, setUploadingReverse] = useState(false);

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

  const set = <K extends keyof DesignDetail>(key: K, value: DesignDetail[K]) =>
    setDetail((d) => ({ ...d, [key]: value }));

  const requiredMissing = {
    teamName: !detail.teamName?.trim(),
    mainColor: !detail.mainColor?.trim(),
    secondaryColor: !detail.secondaryColor?.trim(),
   
  };
  const hasErrors = Object.values(requiredMissing).some(Boolean);

  const handleSave = () => {
    setAttemptedSave(true);
    if (hasErrors) return;
    onSave(detail);
  };

  const handleUploadFrontLogo = async (file: File) => {
    setUploadingFront(true);
    try {
      const result = await uploadToCloudinary(file);
      set("frontLogo", result.url);
    } catch (err) {
      
      console.error("Error al subir logo principal", err);
    } finally {
      setUploadingFront(false);
    }
  };

  const handleUploadReverseLogo = async (file: File) => {
    setUploadingReverse(true);
    try {
      const result = await uploadToCloudinary(file);
      set("reverseLogo", result.url);
    } catch (err) {
      console.error("Error al subir logo trasero", err);
    } finally {
      setUploadingReverse(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
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

          <Field label="Nombre del equipo" required error={attemptedSave && requiredMissing.teamName}>
            <input
              className={inputCls}
              value={detail.teamName ?? ""}
              onChange={(e) => set("teamName", e.target.value)}
              placeholder="Ej. Halcones FC"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Color principal" required error={attemptedSave && requiredMissing.mainColor}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={detail.mainColor || "#000000"}
                  onChange={(e) => set("mainColor", e.target.value)}
                  className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-slate-200"
                />
                <input
                  className={inputCls}
                  value={detail.mainColor ?? ""}
                  onChange={(e) => set("mainColor", e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </Field>

            <Field label="Color secundario" required error={attemptedSave && requiredMissing.secondaryColor}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={detail.secondaryColor || "#FFFFFF"}
                  onChange={(e) => set("secondaryColor", e.target.value)}
                  className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-slate-200"
                />
                <input
                  className={inputCls}
                  value={detail.secondaryColor ?? ""}
                  onChange={(e) => set("secondaryColor", e.target.value)}
                  placeholder="#FFFFFF"
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <LogoUploadField
              label="Logo principal"
              value={detail.frontLogo}
             
              uploading={uploadingFront}
              onUpload={handleUploadFrontLogo}
              onRemove={() => set("frontLogo", null)}
            />

            <LogoUploadField
              label="Logo trasero"
              value={detail.reverseLogo}
              uploading={uploadingReverse}
              onUpload={handleUploadReverseLogo}
              onRemove={() => set("reverseLogo", null)}
            />
          </div>

          <Field label="Tipo de impresión">
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
            disabled={uploadingFront || uploadingReverse}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
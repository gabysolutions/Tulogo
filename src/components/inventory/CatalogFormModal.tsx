import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";

interface CatalogItem {
  id: number;
  description: string;
}

interface CatalogFormModalProps {
  open: boolean;
  title: string;
  item: CatalogItem | null; // null = creando
  onClose: () => void;
  onSave: (description: string) => Promise<void>;
}

export function CatalogFormModal({ open, title, item, onClose, onSave }: CatalogFormModalProps) {
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDescription(item?.description ?? "");
  }, [item, open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(description.trim());
      onClose();
    } catch {
      Swal.fire({
        icon: "error",
        title: item ? "No se pudo actualizar" : "No se pudo agregar",
        text: "Intenta de nuevo en unos segundos.",
      });
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
          <h3 className="text-sm font-semibold text-slate-800">{item ? `Editar ${title}` : `Nuevo ${title}`}</h3>
          <button type="button" onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-5">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Descripción</span>
              <input
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
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
              disabled={saving || !description.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : item ? "Guardar cambios" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
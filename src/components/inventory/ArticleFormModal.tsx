import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import type { ArticleListItem, ArticlePayload, Category } from "../../types/inventory";

interface ArticleFormModalProps {
  open: boolean;
  article: ArticleListItem | null; // null = creando
  categories: Category[];
  onClose: () => void;
  onSave: (payload: ArticlePayload) => Promise<void>;
}

interface FormState {
  description: string;
  categoryId: string;
  price: string;
  cost: string;
  satProductCode: string;
  satUnitCode: string;
}

const DEFAULT_UNIT_CODE = "H87"; // Pieza

const EMPTY_FORM: FormState = {
  description: "",
  categoryId: "",
  price: "",
  cost: "",
  satProductCode: "",
  satUnitCode: DEFAULT_UNIT_CODE,
};

// Sugerencias comunes (el campo acepta cualquier clave del catálogo SAT)
const SAT_UNITS = [
  { code: "H87", label: "Pieza" },
  { code: "E48", label: "Unidad de servicio" },
  { code: "KGM", label: "Kilogramo" },
  { code: "MTR", label: "Metro" },
  { code: "LTR", label: "Litro" },
  { code: "XBX", label: "Caja" },
  { code: "SET", label: "Conjunto" },
];

const inputClass =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500";

export function ArticleFormModal({ open, article, categories, onClose, onSave }: ArticleFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (article) {
      const matchedCategory = categories.find((c) => c.description === article.category);
      setForm({
        description: article.description,
        categoryId: matchedCategory ? String(matchedCategory.id) : "",
        price: article.price,
        cost: article.cost,
        satProductCode: article.satProductCode ?? "",
        satUnitCode: article.satUnitCode ?? DEFAULT_UNIT_CODE,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [article, categories, open]);

  if (!open) return null;

  const productCodeValid = /^\d{8}$/.test(form.satProductCode);
  const unitCodeValid = /^[A-Z0-9]{2,3}$/.test(form.satUnitCode);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        category: Number(form.categoryId),
        description: form.description.trim(),
        price: Number(form.price),
        cost: Number(form.cost),
        satProductCode: form.satProductCode,
        satUnitCode: form.satUnitCode,
      });
      onClose();
    } catch {
      Swal.fire({
        icon: "error",
        title: article ? "No se pudo actualizar el artículo" : "No se pudo agregar el artículo",
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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">{article ? "Editar artículo" : "Nuevo artículo"}</h3>
          <button type="button" onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-5">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Descripción</span>
              <input
                className={inputClass}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Categoría</span>
              <select
                className={inputClass}
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.description}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Precio</span>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Costo</span>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.cost}
                  onChange={(e) => setForm((prev) => ({ ...prev, cost: e.target.value }))}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Clave producto/servicio SAT</span>
                <input
                  className={`${inputClass} font-mono`}
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="53103000"
                  value={form.satProductCode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, satProductCode: e.target.value.replace(/\D/g, "").slice(0, 8) }))
                  }
                />
                {form.satProductCode && !productCodeValid && (
                  <span className="mt-1 block text-[11px] text-red-600">Debe tener 8 dígitos.</span>
                )}
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Clave unidad SAT</span>
                <input
                  className={`${inputClass} font-mono uppercase`}
                  list="sat-units"
                  maxLength={3}
                  placeholder="H87"
                  value={form.satUnitCode}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      satUnitCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3),
                    }))
                  }
                />
                <datalist id="sat-units">
                  {SAT_UNITS.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.label}
                    </option>
                  ))}
                </datalist>
                {form.satUnitCode && !unitCodeValid && (
                  <span className="mt-1 block text-[11px] text-red-600">Debe tener 2 o 3 caracteres.</span>
                )}
              </label>
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
              disabled={
                saving ||
                !form.categoryId ||
                !form.description.trim() ||
                !productCodeValid ||
                !unitCodeValid
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : article ? "Guardar cambios" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
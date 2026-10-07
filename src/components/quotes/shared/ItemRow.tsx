import { Trash2 } from "lucide-react";

import type { ArticleListItem, FabricType } from "../../../types/inventory";
import Field from "./Field";
import { inputCls, selectCls } from "./inputStyles";

interface LineItem {
  id: number;
  articleId: number | null;
  category: string;
  fabricTypeId: number | null;
  desc: string;
  qty: number;
  price: number;
}

interface Props {
  item: LineItem;
  index: number;
  articles: ArticleListItem[];
  fabricTypes: FabricType[];
  onChange: (
    id: number,
    field: keyof LineItem,
    value: string | number | null
  ) => void;
  onRemove: (id: number) => void;
}

export default function ItemRow({
  item,
  index,
  articles,
  fabricTypes,
  onChange,
  onRemove,
}: Props) {
  const subtotal = item.qty * item.price;

  const categories = Array.from(new Set(articles.map((a) => a.category)));

  const filteredArticles = item.category
    ? articles.filter((a) => a.category === item.category)
    : [];

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Artículo #{index + 1}
        </span>
        <button
          onClick={() => onRemove(item.id)}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Eliminar artículo"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Categoría">
          <select
            className={selectCls}
            value={item.category}
            onChange={(e) => {
              onChange(item.id, "category", e.target.value);
              onChange(item.id, "articleId", null);
              onChange(item.id, "price", 0);
            }}
          >
            <option value="">Seleccionar...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Artículo">
          <select
            className={selectCls}
            value={item.articleId ?? ""}
            disabled={!item.category}
            onChange={(e) => {
              const selected = filteredArticles.find(
                (a) => a.id === Number(e.target.value)
              );

              onChange(item.id, "articleId", selected?.id ?? null);
              onChange(
                item.id,
                "price",
                selected ? Number(selected.price) : 0
              );
            }}
          >
            <option value="">Seleccionar...</option>
            {filteredArticles.map((a) => (
              <option key={a.id} value={a.id}>
                {a.description}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tipo de tela">
        <select
          className={selectCls}
          value={item.fabricTypeId ?? ""}
          onChange={(e) =>
            onChange(
              item.id,
              "fabricTypeId",
              e.target.value ? Number(e.target.value) : null
            )
          }
        >
          <option value="">Seleccionar...</option>
          {fabricTypes.map((f) => (
            <option key={f.id} value={f.id}>
              {f.description}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Notas (tallas, colores, diseño)">
        <textarea
          className={`${inputCls} min-h-[56px] resize-y`}
          placeholder="Ej: Color azul marino con franja blanca."
          value={item.desc}
          onChange={(e) => onChange(item.id, "desc", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Cantidad">
          <input
            className={inputCls}
            type="number"
            min={0}
            placeholder="0"
            value={item.qty || ""}
            onChange={(e) => onChange(item.id, "qty", +e.target.value || 0)}
          />
        </Field>

        <Field label="Precio unitario">
          <input
            className={inputCls}
            type="number"
            min={0}
            placeholder="0.00"
            value={item.price || ""}
            onChange={(e) => onChange(item.id, "price", +e.target.value || 0)}
          />
        </Field>

        <Field label="Subtotal">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            {subtotal.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}
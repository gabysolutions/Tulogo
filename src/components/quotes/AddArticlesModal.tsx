"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Minus, Plus } from "lucide-react";

import type { ArticleListItem, FabricType } from "../../types/inventory";
import type { Quote } from "../../types/quote";

import { inputCls } from "./shared/inputStyles";

export interface AddArticlesSavePayload {
  quoteId: number;
  totalAdded: number;
  items: {
    articleId: number | null;
    fabricTypeId: number | null;
    qty: number;
    price: number;
  }[];
}

interface Props {
  quote: Quote | null;
  articles: ArticleListItem[];
  fabricTypes: FabricType[];
  onClose: () => void;
  onSave: (payload: AddArticlesSavePayload) => Promise<void>;
}

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function AddArticlesModal({
  quote,
  articles,
  fabricTypes,
  onClose,
  onSave,
}: Props) {
  // piezas a agregar por detalle: { [detailId]: cantidad }
  const [qtys, setQtys] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  // Solo se reinicia al abrir otra cotización
  useEffect(() => {
    setQtys({});
  }, [quote?.id]);

  // Filas derivadas de los artículos que ya tiene la cotización
  const rows = useMemo(() => {
    if (!quote) return [];

    return quote.details.map((d) => {
      const article = articles.find(
        (a) => a.description === d.description && a.category === d.category
      );
      const fabric = fabricTypes.find((f) => f.description === d.fabricType);

      return {
        detailId: d.detailId,
        description: d.description,
        category: d.category,
        fabricType: d.fabricType,
        currentQty: d.amount,
        unitPrice: d.unitPrice,
        articleId: d.articleId ?? article?.id ?? null,
        fabricTypeId: d.fabricTypeId ?? fabric?.id ?? null,
      };
    });
  }, [quote, articles, fabricTypes]);

  if (!quote) return null;

  const setQty = (detailId: number, value: number) => {
    setQtys((prev) => ({ ...prev, [detailId]: Math.max(0, Math.floor(value) || 0) }));
  };

  const selected = rows.filter((r) => (qtys[r.detailId] ?? 0) > 0);
  const totalAdded = selected.reduce(
    (acc, r) => acc + (qtys[r.detailId] ?? 0) * r.unitPrice,
    0
  );
  const piecesAdded = selected.reduce((acc, r) => acc + (qtys[r.detailId] ?? 0), 0);
  const newTotal = quote.total + totalAdded;

  const canSave =
    selected.length > 0 &&
    selected.every((r) => r.articleId && r.fabricTypeId) &&
    !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        quoteId: quote.id,
        totalAdded,
        items: selected.map((r) => ({
          articleId: r.articleId,
          fabricTypeId: r.fabricTypeId,
          qty: qtys[r.detailId],
          price: r.unitPrice,
        })),
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
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Agregar piezas
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Cotización {quote.folio} · {quote.clientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Artículos de la cotización
            </p>

            <div className="space-y-3">
              {rows.map((r) => {
                const qty = qtys[r.detailId] ?? 0;
                const unresolved = qty > 0 && (!r.articleId || !r.fabricTypeId);

                return (
                  <div
                    key={r.detailId}
                    className={`rounded-xl border p-4 ${
                      qty > 0
                        ? "border-violet-200 bg-violet-50/40"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {r.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {r.category} · {r.fabricType}
                        </p>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>Actual: {r.currentQty} pzas</p>
                        <p>{fmt(r.unitPrice)} c/u</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Piezas a agregar
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setQty(r.detailId, qty - 1)}
                            disabled={qty === 0}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-100 disabled:opacity-40"
                          >
                            <Minus className="size-4" />
                          </button>
                          <input
                            className={`${inputCls} w-20 text-center`}
                            type="number"
                            min={0}
                            placeholder="0"
                            value={qty || ""}
                            onChange={(e) => setQty(r.detailId, +e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setQty(r.detailId, qty + 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-100"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        {qty > 0 ? (
                          <>
                            <p className="text-slate-500">
                              {r.currentQty} → {r.currentQty + qty} pzas
                            </p>
                            <p className="text-sm font-semibold text-emerald-600">
                              + {fmt(qty * r.unitPrice)}
                            </p>
                          </>
                        ) : (
                          <p className="text-slate-400">Sin cambios</p>
                        )}
                      </div>
                    </div>

                    {unresolved && (
                      <p className="mt-2 text-xs text-red-500">
                        No se pudo identificar el artículo o la tela de esta fila.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total actual</span>
                <span>{fmt(quote.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Piezas agregadas ({piecesAdded})
                </span>
                <span className="font-medium text-emerald-600">
                  + {fmt(totalAdded)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-medium">
                <span>Nuevo total</span>
                <span>{fmt(newTotal)}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Agregar piezas"}
          </button>
        </div>
      </div>
    </div>
  );
}
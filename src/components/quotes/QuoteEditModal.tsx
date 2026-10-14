"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Plus, Check } from "lucide-react";

import type { ArticleListItem, FabricType } from "../../types/inventory";
import { QuotePriority, QuoteStatus, type Quote } from "../../types/quote";

import Field from "./shared/Field";
import Toggle from "./shared/Toggle";
import ItemRow from "./shared/ItemRow";
import { inputCls, selectCls } from "./shared/inputStyles";

const DEFAULT_COSTO_ENVIO = 500;

// Cuando se permita editar cotizaciones aceptadas, cambiar a true
const ACCEPTED_FULL_EDIT_ENABLED = false;

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
  open: boolean;
  isAdmin: boolean;
  quote: Quote | null;
  articles: ArticleListItem[];
  fabricTypes: FabricType[];
  onAddIva: (quote: Quote) => void;
  onClose: () => void;
  onSave?: (payload: {
    quoteId: number;
    deliveryDate: string;
    priority: QuotePriority;
    items: LineItem[];
    subtotal: number;
    iva: boolean;
    sending: boolean;
    shippingAmount: number;
    total: number;
    advance: number;
    balanceDue: number;
  }) => void;
}

interface ValidationErrors {
  deliveryDate?: string;
  items?: string;
  shipping?: string;
  itemErrors: Record<number, string>;
}

let nextId = 1;

// Acepta true, 1 o "1" (según lo que mande el backend)
const toBool = (v: unknown): boolean => v === true || v === 1 || v === "1";

function detailsToItems(
  quote: Quote,
  articles: ArticleListItem[],
  fabricTypes: FabricType[]
): LineItem[] {
  return quote.details.map((detail) => {
    const article = articles.find(
      (a) => a.description === detail.description && a.category === detail.category
    );
    const fabricType = fabricTypes.find((f) => f.description === detail.fabricType);

    return {
      id: nextId++,
      articleId: article?.id ?? null,
      category: detail.category,
      fabricTypeId: fabricType?.id ?? null,
      desc: "",
      qty: detail.amount,
      price: detail.unitPrice,
    };
  });
}

function getInitialShippingCost(quote: Quote): number {
  if (quote.shippingAmount > 0) return quote.shippingAmount;

  if (!toBool(quote.sending)) return DEFAULT_COSTO_ENVIO;

  const detailsSubtotal = quote.details.reduce(
    (acc, d) => acc + d.amount * d.unitPrice,
    0
  );
  const derived = Math.round((quote.total - detailsSubtotal) * 100) / 100;

  return derived > 0 ? derived : DEFAULT_COSTO_ENVIO;
}

export default function QuoteEditModal({
  open,
  isAdmin,
  quote,
  articles,
  fabricTypes,
  onClose,
  onAddIva,
  onSave,
}: Props) {
  const [deliveryDate, setDeliveryDate] = useState("");
  const [priority, setPriority] = useState<QuotePriority>(QuotePriority.MEDIA);
  const [items, setItems] = useState<LineItem[]>([]);
  const [ivaEnabled, setIvaEnabled] = useState(false);
  const [envioEnabled, setEnvioEnabled] = useState(false);
  const [shippingCost, setShippingCost] = useState<number>(DEFAULT_COSTO_ENVIO);

  useEffect(() => {
    if (!open || !quote) return;

    setDeliveryDate(quote.deliveryDate);
    setPriority(quote.priority);
    setItems(detailsToItems(quote, articles, fabricTypes));
    setIvaEnabled(toBool(quote.iva));
    setEnvioEnabled(toBool(quote.sending));
    setShippingCost(getInitialShippingCost(quote));
  }, [open, quote, articles, fabricTypes]);

  function validateForm(): ValidationErrors {
    const errors: ValidationErrors = { itemErrors: {} };

    if (!deliveryDate) {
      errors.deliveryDate = "La fecha de entrega es obligatoria.";
    }

    if (items.length === 0) {
      errors.items = "Agrega al menos un artículo.";
    }

    if (envioEnabled && shippingCost < 0) {
      errors.shipping = "El costo de envío no puede ser negativo.";
    }

    items.forEach((item) => {
      if (!item.category) {
        errors.itemErrors[item.id] = "Selecciona una categoría.";
      } else if (!item.articleId) {
        errors.itemErrors[item.id] = "Selecciona un artículo.";
      } else if (!item.fabricTypeId) {
        errors.itemErrors[item.id] = "Selecciona un tipo de tela.";
      } else if (item.qty <= 0) {
        errors.itemErrors[item.id] = "La cantidad debe ser mayor a 0.";
      } else if (item.price <= 0) {
        errors.itemErrors[item.id] = "El precio debe ser mayor a 0.";
      }
    });

    return errors;
  }

  const subtotal = items.reduce((acc, i) => acc + i.qty * i.price, 0);
  // Si no lleva envío, shippingAmount siempre es 0
  const shippingAmount = envioEnabled ? shippingCost : 0;

  const total = subtotal + shippingAmount;

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const errors = validateForm();

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: nextId++,
        articleId: null,
        category: "",
        fabricTypeId: null,
        desc: "",
        qty: 0,
        price: 0,
      },
    ]);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateItem = useCallback(
    (id: number, field: keyof LineItem, value: string | number | null) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
      );
    },
    []
  );

  const canSave =
    items.length > 0 &&
    items.every((i) => i.articleId && i.fabricTypeId) &&
    !errors.shipping;

  const handleSave = () => {
    if (!canSave || !quote) return;

    onSave?.({
      quoteId: quote.id,
      deliveryDate,
      priority,
      items,
      subtotal,
      iva: ivaEnabled,
      sending: envioEnabled,
      shippingAmount,
      total,
      advance: quote.advance,
      balanceDue: Math.max(0, total - quote.advance),
    });

    onClose();
  };

  if (!open || !quote) return null;

  // Pendiente: edición completa. Aceptada: solo cuando se habilite.
  // Aceptada/liquidada hoy: únicamente facturación (agregar IVA).
  const fullEdit =
    quote.status === QuoteStatus.PENDIENTE ||
    (ACCEPTED_FULL_EDIT_ENABLED && quote.status === QuoteStatus.ACEPTADA);

  if (!fullEdit) {
    const hasIva = toBool(quote.iva);
    const canAddIva = !hasIva && quote.status !== QuoteStatus.CANCELADA;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="flex w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Facturación
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

          <div className="space-y-4 px-5 py-5">
            <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-medium">{fmt(quote.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Anticipo</span>
                <span>{fmt(quote.advance)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-medium">
                <span>Saldo pendiente</span>
                <span>{fmt(quote.balanceDue)}</span>
              </div>
            </div>

            {hasIva ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Esta cotización ya incluye IVA.
              </p>
            ) : (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Esta cotización no incluye IVA. Al agregarlo se recalculan el
                total y el saldo, y no se puede deshacer.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors hover:bg-slate-100"
            >
              Cerrar
            </button>
            {canAddIva && (
              <button
                onClick={() => onAddIva(quote)}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700"
              >
                Agregar IVA
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

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
              Editar cotización
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Modificando la cotización {quote.folio}
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
              Datos del cliente
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Cliente
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <Check size={16} className="text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-700">
                      {quote.clientName}
                    </p>
                    <p className="text-xs text-slate-400">
                      El cliente no se puede cambiar una vez creada la cotización.
                    </p>
                  </div>
                </div>
              </div>

              <Field label="Fecha de entrega">
                <input
                  className={inputCls}
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </Field>

              <Field label="Prioridad">
                <select
                  className={selectCls}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as QuotePriority)}
                >
                  <option value={QuotePriority.BAJA}>Baja</option>
                  <option value={QuotePriority.MEDIA}>Media</option>
                  <option value={QuotePriority.ALTA}>Alta</option>
                </select>
              </Field>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Artículos
              </p>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs transition-colors hover:bg-slate-100"
              >
                <Plus className="size-3.5" />
                Añadir artículo
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={idx}
                  articles={articles}
                  fabricTypes={fabricTypes}
                  onChange={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <div className="mb-4 flex flex-col gap-3">
              <Toggle
                checked={ivaEnabled}
                onChange={setIvaEnabled}
                label="Requiere factura"
              />
              <Toggle
                checked={envioEnabled}
                onChange={setEnvioEnabled}
                label="Envío"
              />

              {envioEnabled && isAdmin && (
                <Field label="Costo de envío" className="max-w-[200px]">
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={shippingCost || ""}
                    onChange={(e) => setShippingCost(+e.target.value || 0)}
                  />
                </Field>
              )}
            </div>

            <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{fmt(subtotal)}</span>
              </div>

              {envioEnabled && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Envío</span>
                  <span>{fmt(shippingAmount)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-200 pt-2 font-medium">
                <span>Total</span>
                <span>{fmt(total)}</span>
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
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
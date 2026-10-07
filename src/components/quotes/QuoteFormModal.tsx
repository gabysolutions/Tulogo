"use client";

import { useState, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";

import type { Client } from "../../types/client";
import type { ArticleListItem, FabricType } from "../../types/inventory";
import type { QuotePriority } from "../../types/quote";
import ClientSearchField, {
  type NewClientData,
} from "./ClientSearchField";

const DEFAULT_COSTO_ENVIO = 500;

interface LineItem {
  id: number;
  articleId: number | null;
  fabricTypeId: number | null;
  category: string;
  desc: string;
  qty: number;
  price: number;
}

export interface QuoteFormSavePayload {
  clientId: number | null;
  newClient: NewClientData | null;
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
}

interface Props {
  open: boolean;
  isAdmin: boolean;
  clients: Client[];
  articles: ArticleListItem[];
  fabricTypes: FabricType[];
  onClose: () => void;
  onSave?: (payload: QuoteFormSavePayload) => void | Promise<void>;
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-3">
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="h-5 w-9 rounded-full bg-slate-200 transition-colors peer-checked:bg-blue-600" />
        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </div>
      <span className="text-sm text-slate-600">{label}</span>
    </label>
  );
}

const PRIORITY_OPTIONS: {
  value: QuotePriority;
  label: string;
  activeClasses: string;
}[] = [
  { value: "ALTA", label: "Alta", activeClasses: "border-red-300 bg-red-50 text-red-700" },
  { value: "MEDIA", label: "Media", activeClasses: "border-amber-300 bg-amber-50 text-amber-700" },
  { value: "BAJA", label: "Baja", activeClasses: "border-green-300 bg-green-50 text-green-700" },
];

function PrioritySelector({
  value,
  onChange,
}: {
  value: QuotePriority;
  onChange: (p: QuotePriority) => void;
}) {
  return (
    <div className="flex gap-2">
      {PRIORITY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            value === opt.value
              ? opt.activeClasses
              : "border-slate-200 text-slate-500 hover:bg-slate-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors";

const selectCls = `${inputCls} disabled:cursor-not-allowed disabled:opacity-40`;

let nextId = 1;

function ItemRow({
  item,
  index,
  articles,
  fabricTypes,
  onChange,
  onRemove,
}: {
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
}) {
  const subtotal = item.qty * item.price;

  const categories = Array.from(
    new Set(articles.map((a) => a.category))
  );

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              onChange(item.id, "price", selected?.price ?? 0);
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
            {fabricTypes.map((ft) => (
              <option key={ft.id} value={ft.id}>
                {ft.description}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notas ">
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
            onChange={(e) =>
              onChange(item.id, "qty", +e.target.value || 0)
            }
          />
        </Field>

        <Field label="Precio unitario">
          <input
            className={inputCls}
            type="number"
            min={0}
            placeholder="0.00"
            value={item.price || ""}
            onChange={(e) =>
              onChange(item.id, "price", +e.target.value || 0)
            }
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

export default function QuoteFormModal({
  open,
  isAdmin,
  clients,
  articles,
  fabricTypes,
  onClose,
  onSave,
}: Props) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState<NewClientData>({
    name: "",
    lastNameP: "",
    lastNameM: "",
  });
  const [deliveryDate, setDeliveryDate] = useState("");
  const [priority, setPriority] = useState<QuotePriority>("MEDIA");
  const [items, setItems] = useState<LineItem[]>([
    {
      id: nextId++,
      articleId: null,
      fabricTypeId: null,
      category: "",
      desc: "",
      qty: 0,
      price: 0,
    },
  ]);
  const [ivaEnabled, setIvaEnabled] = useState(false);
  const [envioEnabled, setEnvioEnabled] = useState(false);
  const [shippingCost, setShippingCost] = useState<number>(DEFAULT_COSTO_ENVIO);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [saving, setSaving] = useState(false);

  interface ValidationErrors {
    client?: string;
    deliveryDate?: string;
    items?: string;
    shipping?: string;
    itemErrors: Record<number, string>;
  }

  function validateForm(): ValidationErrors {
    const errors: ValidationErrors = { itemErrors: {} };

    if (!selectedClient && !(isNewClient && newClientData.name.trim())) {
      errors.client = "Selecciona un cliente o agrega uno nuevo.";
    }

    if (isNewClient && !newClientData.name.trim()) {
      errors.client = "El nombre del cliente nuevo es obligatorio.";
    }

    if (isNewClient && (newClientData.phone?.length ?? 0) !== 10) {
      errors.client = "El teléfono del cliente nuevo debe tener 10 dígitos.";
    }

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
  
  const shippingAmount = envioEnabled ? shippingCost : 0;
 
  const total = subtotal + shippingAmount;
  const minAnticipo = total * 0.5;

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const errors = validateForm();

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: nextId++,
        articleId: null,
        fabricTypeId: null,
        category: "",
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
    !errors.client &&
    !errors.deliveryDate &&
    !errors.items &&
    !errors.shipping &&
    Object.keys(errors.itemErrors).length === 0;

  const resetForm = () => {
    setSelectedClient(null);
    setIsNewClient(false);
    setNewClientData({ name: "", lastNameP: "", lastNameM: "" });
    setDeliveryDate("");
    setPriority("MEDIA");
    setItems([
      {
        id: nextId++,
        articleId: null,
        fabricTypeId: null,
        category: "",
        desc: "",
        qty: 0,
        price: 0,
      },
    ]);
    setIvaEnabled(false);
    setEnvioEnabled(false);
    setShippingCost(DEFAULT_COSTO_ENVIO);
    setAttemptedSave(false);
  };

  const handleSave = async () => {
    setAttemptedSave(true);

    if (!canSave || saving) return;

    setSaving(true);

    try {
      await onSave?.({
        clientId: selectedClient?.id ?? null,
        newClient: isNewClient
          ? {
              name: newClientData.name.toUpperCase(),
              lastNameP: newClientData.lastNameP.toUpperCase(),
              lastNameM: newClientData.lastNameM.toUpperCase(),
              phone: newClientData.phone,
            }
          : null,
        deliveryDate,
        priority,
        items,
        subtotal,
        iva: ivaEnabled,
        sending: envioEnabled,
        shippingAmount,
        total,
        advance: 0,
        balanceDue: total,
      });

      resetForm();
      onClose();
    } catch {
     
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Nueva cotización
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Completa los datos para generar una nueva cotización
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* Cliente */}
          <section>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Datos del cliente
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <ClientSearchField
                  clients={clients}
                  selectedClient={selectedClient}
                  onSelectClient={setSelectedClient}
                  isNewClient={isNewClient}
                  onIsNewClientChange={setIsNewClient}
                  newClientData={newClientData}
                  onNewClientDataChange={setNewClientData}
                />
                {attemptedSave && errors.client && (
                  <p className="mt-1 text-xs text-red-600">{errors.client}</p>
                )}
              </div>

              <Field label="Fecha de entrega">
                <input
                  className={inputCls}
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Prioridad" className="mt-4">
              <PrioritySelector value={priority} onChange={setPriority} />
            </Field>
          </section>

          {/* Artículos */}
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

          {/* Totales */}
          <section className="border-t border-slate-200 pt-5">
            <div className="mb-4 flex flex-col gap-3">
              <Toggle
                checked={ivaEnabled}
                onChange={setIvaEnabled}
                label="Requiere factura (IVA)"
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

              <p className="text-right text-xs text-slate-400">
                Mínimo si aplica anticipo (50%): {fmt(minAnticipo)}
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cotización"}
          </button>
        </div>
      </div>
    </div>
  );
}
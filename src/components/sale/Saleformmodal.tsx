import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import type { CreateSalePayload, PaymentMethod } from "../../types/sale";
import type { Client } from "../../types/client";
import ClientSearchField, { type NewClientData } from "../quotes/ClientSearchField";
import { ModalFooter, ModalShell, formatMoney, getErrorMessage, inputClass } from "../sale/SaleUi";
import type { ArticleListItem, FabricType } from "../../types/inventory";



interface Line {
  category: string;
  articleId: string;
  fabricType: string;
  amount: string;
  unitPrice: string;
}


export type SaleFormSavePayload = Omit<CreateSalePayload, "clientId"> & {
  clientId?: number;
  newClient?: NewClientData;
};

interface Props {
 open: boolean;
  articles: ArticleListItem[];
  fabricTypes: FabricType[];
  onClose: () => void;
  onSave: (payload: SaleFormSavePayload) => Promise<void>;
}



const EMPTY_LINE: Line = { category: "", articleId: "", fabricType: "", amount: "1", unitPrice: "" };
const EMPTY_NEW_CLIENT: NewClientData = { name: "", lastNameP: "", lastNameM: "" };


const IVA_RATE = 0.16;

export function SaleFormModal({ open, articles, fabricTypes, onClose, onSave }: Props) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState<NewClientData>(EMPTY_NEW_CLIENT);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [iva, setIva] = useState(false);
  const [sending, setSending] = useState(false);
  const [shippingAmount, setShippingAmount] = useState("");
  const [lines, setLines] = useState<Line[]>([{ ...EMPTY_LINE }]);
  const [advance, setAdvance] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedClient(null);
    setIsNewClient(false);
    setNewClientData(EMPTY_NEW_CLIENT);
    setDeliveryDate("");
    setIva(false);
    setSending(false);
    setShippingAmount("");
    setLines([{ ...EMPTY_LINE }]);
    setAdvance("");
    setPaymentMethod("EFECTIVO");
  }, [open]);

  const subtotal = useMemo(
    () => lines.reduce((acc, l) => acc + (Number(l.amount) || 0) * (Number(l.unitPrice) || 0), 0),
    [lines]
  );
  const shipping = sending ? Number(shippingAmount) || 0 : 0;
  const estimatedTotal = subtotal + (iva ? subtotal * IVA_RATE : 0) + shipping;
  const advanceNum = Number(advance) || 0;

const categories = useMemo(
  () =>
    Array.from(new Set(articles.map((a) => a.category).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    ),
  [articles]
);
  if (!open) return null;

  const updateLine = (index: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));

 const handleCategoryChange = (index: number, value: string) =>
  updateLine(index, { category: value, articleId: "", unitPrice: "" });

const handleArticleChange = (index: number, value: string) => {
  const article = articles.find((a) => String(a.id) === value);
  updateLine(index, { articleId: value, unitPrice: article ? String(article.price) : "" });
};

  const linesValid =
    lines.length > 0 &&
    lines.every(
      (l) =>
        l.articleId &&
        l.fabricType &&
        Number.isInteger(Number(l.amount)) &&
        Number(l.amount) > 0 &&
        l.unitPrice !== "" &&
        Number(l.unitPrice) >= 0
    );
  const advanceValid = advanceNum >= 0 && (advanceNum === 0 || advanceNum <= estimatedTotal);
  const phoneLen = newClientData.phone?.length ?? 0;
  const clientValid =
    !!selectedClient ||
    (isNewClient && !!newClientData.name.trim() && !!newClientData.lastNameP.trim() && (phoneLen === 0 || phoneLen === 10));
  const canSubmit = clientValid && !!deliveryDate && linesValid && advanceValid;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        clientId: selectedClient?.id,
        newClient: isNewClient ? newClientData : undefined,
        deliveryDate,
        iva,
        sending,
        shippingAmount: shipping,
        articles: lines.map((l) => ({
          articleId: Number(l.articleId),
          fabricType: Number(l.fabricType),
          amount: Number(l.amount),
          unitPrice: Number(l.unitPrice),
        })),
        ...(advanceNum > 0 ? { advance: advanceNum, paymentMethod } : {}),
      });
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar la venta",
        text: getErrorMessage(err, "Intenta de nuevo en unos segundos."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Nueva venta" onClose={onClose} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ClientSearchField
              selectedClient={selectedClient}
              onSelectClient={setSelectedClient}
              isNewClient={isNewClient}
              onIsNewClientChange={setIsNewClient}
              newClientData={newClientData}
              onNewClientDataChange={setNewClientData}
            />

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Fecha de entrega</span>
              <input
                type="date"
                className={inputClass}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Artículos</span>
              <button
                type="button"
                onClick={() => setLines((prev) => [...prev, { ...EMPTY_LINE }])}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                <Plus className="size-3.5" /> Agregar artículo
              </button>
            </div>

            <div className="space-y-2">
                {lines.map((line, i) => {
                  const options = articles.filter((a) => a.category === line.category);

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-12 items-end gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2"
                    >
                      <label className="col-span-12 sm:col-span-4">
                        <span className="mb-1 block text-[11px] text-slate-400">Artículo</span>
                        <select
                          className={inputClass}
                          value={line.category}
                          onChange={(e) => handleCategoryChange(i, e.target.value)}
                        >
                          <option value="">Selecciona</option>
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="col-span-12 sm:col-span-5">
                        <span className="mb-1 block text-[11px] text-slate-400">Descripción</span>
                        <select
                          className={inputClass}
                          value={line.articleId}
                          disabled={!line.category}
                          onChange={(e) => handleArticleChange(i, e.target.value)}
                        >
                          <option value="">{line.category ? "Selecciona" : "Elige un artículo primero"}</option>
                          {options.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.description}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="col-span-12 sm:col-span-3">
                        <span className="mb-1 block text-[11px] text-slate-400">Tela</span>
                        <select
                          className={inputClass}
                          value={line.fabricType}
                          onChange={(e) => updateLine(i, { fabricType: e.target.value })}
                        >
                          <option value="">Selecciona</option>
                          {fabricTypes.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.description}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="col-span-4 sm:col-span-2">
                        <span className="mb-1 block text-[11px] text-slate-400">Cant.</span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          className={inputClass}
                          value={line.amount}
                          onChange={(e) => updateLine(i, { amount: e.target.value })}
                        />
                      </label>

                      <label className="col-span-8 sm:col-span-3">
                        <span className="mb-1 block text-[11px] text-slate-400">Precio</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={inputClass}
                          value={line.unitPrice}
                          onChange={(e) => updateLine(i, { unitPrice: e.target.value })}
                        />
                      </label>

                      <div className="col-span-12 flex items-center justify-between sm:col-span-7 sm:justify-end sm:gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {formatMoney((Number(line.amount) || 0) * (Number(line.unitPrice) || 0))}
                        </span>
                        <button
                          type="button"
                          disabled={lines.length === 1}
                          onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-30"
                          title="Quitar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
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

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Anticipo (opcional)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  value={advance}
                  onChange={(e) => setAdvance(e.target.value)}
                />
                {!advanceValid && (
                  <span className="mt-1 block text-[11px] text-red-600">El anticipo no puede superar el total.</span>
                )}
              </label>

              {advanceNum > 0 && (
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-500">Método de pago</span>
                  <select
                    className={inputClass}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </label>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {iva && (
              <div className="flex justify-between text-slate-500">
                <span>IVA (16%)</span>
                <span>{formatMoney(subtotal * IVA_RATE)}</span>
              </div>
            )}
            {sending && (
              <div className="flex justify-between text-slate-500">
                <span>Envío</span>
                <span>{formatMoney(shipping)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-800">
              <span>Total estimado</span>
              <span>{formatMoney(estimatedTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Saldo estimado</span>
              <span>{formatMoney(Math.max(estimatedTotal - advanceNum, 0))}</span>
            </div>
          </div>
        </div>

        <ModalFooter onClose={onClose} saving={saving} disabled={!canSubmit} submitLabel="Registrar venta" />
      </form>
    </ModalShell>
  );
}
import { useRef, useState } from "react";
import { Plus, Upload, Pencil, Trash2, X, Check, AlertTriangle, Download } from "lucide-react";
import Swal from "sweetalert2";
import type {
  Order,
  OrderDetailItem,
  OrderSize,
  OrderGender,
  AddOrderDetailPayload,
  UpdateOrderDetailPayload,
} from "../../types/order";
import { GenerateOrderLink } from "./GenerateOrderLink";
import { useArticles } from "../../hooks/useArticles";
import { downloadOrderDetailsTemplate, parseOrderDetailsFile } from "../../utils/orderDetailsExcel";
import { PendingDetailsReview } from "./PendingDetailsReview";


interface Props {
  order: Order;
  onAddDetail: (payload: AddOrderDetailPayload) => Promise<unknown>;
  onUpdateDetail: (detailId: number, payload: UpdateOrderDetailPayload) => Promise<unknown>;
  onRemoveDetail: (detailId: number) => Promise<unknown>;
   onRefresh: () => Promise<unknown> | void;
}

const SIZES: OrderSize[] = ["2","3","4","6","8","10","12","14","16","XCH", "CH", "M", "G", "XL","2XL","3XL","4XL","5XL","6XL"];
const GENDERS: { value: OrderGender; label: string }[] = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
];

const EMPTY_ADD_FORM = {
  articleId: "" as number | "",
  nickname: "",
  number: "",
  size: "" as OrderSize | "",
  gender: "" as OrderGender | "",
  observation: "",
};

const EMPTY_EDIT_FORM = {
  nickname: "",
  number: "",
  size: "" as OrderSize | "",
  gender: "" as OrderGender | "",
};

export default function OrderDetailsTable({ order, onAddDetail, onUpdateDetail, onRemoveDetail,onRefresh }: Props) {
  const { articles } = useArticles();
  const orderArticles = order.articles.map((a) => ({ id: a.articleId, article: a.article }));

  
  const orderArticleIds = new Set(order.articles.map((a) => a.articleId));
  const templateArticles = articles.filter((a) => orderArticleIds.has(a.id));

  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const [manualOpen, setManualOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    ...EMPTY_ADD_FORM,
    articleId: orderArticles.length === 1 ? orderArticles[0].id : ("" as number | ""),
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editError, setEditError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!order) return null;

  const isConfiguring = order.status <= 1;
  const missing = order.numberPieces - order.details.length;
  const complete = missing <= 0;
 
  function patchAddForm(patch: Partial<typeof EMPTY_ADD_FORM>) {
    setAddForm((prev) => ({ ...prev, ...patch }));
    setAddError(null);
  }

  async function handleAddSubmit() {
    if (!addForm.articleId) return setAddError("Selecciona el artículo.");
    if (!addForm.size) return setAddError("Selecciona la talla.");
    if (!addForm.gender) return setAddError("Selecciona el género.");

    setSubmitting(true);
    try {
      await onAddDetail({
        articleId: Number(addForm.articleId),
        nickname: addForm.nickname.trim(),
        number: addForm.number.trim() || undefined,
        size: addForm.size,
        gender: addForm.gender,
        observation: addForm.observation.trim() || undefined,
      });
      
      setAddForm({ ...EMPTY_ADD_FORM, articleId: addForm.articleId });
      setAddError(null);
      Swal.fire({
        title: "Pieza agregada",
        text: "La pieza se agregó correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      setAddError("No se pudo agregar la pieza. Verifica los datos.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(detail: OrderDetailItem) {
    setEditingId(detail.id);
    setEditForm({
      nickname: detail.nickname,
      number: detail.number ?? "",
      size: detail.size,
      gender: detail.gender,
    });
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(EMPTY_EDIT_FORM);
    setEditError(null);
  }

  async function handleEditSubmit() {
    if (editingId === null) return;
    if (!editForm.nickname.trim()) return setEditError("El apodo es obligatorio.");
    if (!editForm.size) return setEditError("Selecciona la talla.");
    if (!editForm.gender) return setEditError("Selecciona el género.");

    try {
      await onUpdateDetail(editingId, {
        nickname: editForm.nickname.trim(),
        number: editForm.number.trim() || undefined,
        size: editForm.size,
        gender: editForm.gender,
      });
      cancelEdit();
      Swal.fire({
        title: "Guardado",
        text: "La pieza se actualizó correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      setEditError("No se pudo actualizar la pieza.");
    }
  }

  async function handleRemove(detailId: number) {
    const result = await Swal.fire({
      title: "¿Eliminar pieza?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await onRemoveDetail(detailId);
      Swal.fire({
        title: "Eliminada",
        text: "La pieza se eliminó correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar la pieza.",
        icon: "error",
      });
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;

  setImporting(true);
  setImportErrors([]);
  setImportedCount(null);

  Swal.fire({
    title: "Subiendo archivo",
    html: 'Procesando piezas... <b id="import-progress"></b>',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const { details, errors } = await parseOrderDetailsFile(file, templateArticles);
    let successCount = 0;
    const failedRows: string[] = [...errors];

    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      try {
        await onAddDetail(detail);
        successCount++;
      } catch {
        failedRows.push(`No se pudo agregar la pieza "${detail.nickname}".`);
      }

      const progress = Swal.getHtmlContainer()?.querySelector("#import-progress");
      if (progress) progress.textContent = `${i + 1} de ${details.length}`;
    }

    setImportedCount(successCount);
    setImportErrors(failedRows);
  } catch {
    setImportErrors(["No se pudo leer el archivo. Verifica que sea un .xlsx válido y usa el machote."]);
  } finally {
    Swal.close();
    setImporting(false);
  }
}

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {isConfiguring && (
    <>

        <button
          onClick={() => setManualOpen((v) => !v)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
            manualOpen ? "border-slate-800 bg-slate-800 text-white" : "border-gray-300 bg-white hover:bg-gray-50"
          }`}
        >
          <Plus size={16} />
          Agregar manualmente
        </button>

        <GenerateOrderLink 
        orderId={order.id} 
        phone={order.phone}
        
         />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <Upload size={16} />
          {importing ? "Importando..." : "Importar archivo"}
        </button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />

        <button
          onClick={() => downloadOrderDetailsTemplate(templateArticles, order.quoteId)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-gray-100"
        >
          <Download size={16} />
          Descargar formato (machote)
        </button>
          </>
  )}
      </div>

      {/* FORMULARIO AGREGAR */}
      {isConfiguring && manualOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <select
              value={addForm.articleId}
              onChange={(e) => patchAddForm({ articleId: e.target.value ? Number(e.target.value) : "" })}
              className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:col-span-2"
            >
              <option value="">Artículo*</option>
              {orderArticles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.article}
                </option>
              ))}
            </select>
            <input
              value={addForm.nickname}
              onChange={(e) => patchAddForm({ nickname: e.target.value })}
              placeholder="Nombre en prenda*"
              className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:col-span-2"
            />
            <input
              value={addForm.number}
              onChange={(e) => patchAddForm({ number: e.target.value })}
              placeholder="Número"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <select
              value={addForm.size}
              onChange={(e) => patchAddForm({ size: e.target.value as OrderSize })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="">Talla*</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={addForm.gender}
              onChange={(e) => patchAddForm({ gender: e.target.value as OrderGender })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="">Corte*</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            <input
              value={addForm.observation}
              onChange={(e) => patchAddForm({ observation: e.target.value })}
              placeholder="Observación"
              className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:col-span-3"
            />
          </div>

          {addError && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
              <AlertTriangle size={13} /> {addError}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Se sigue mostrando el formulario para capturar la siguiente pieza.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setManualOpen(false)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-gray-100"
              >
                <X size={15} /> Terminar
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
              >
                <Check size={15} /> {submitting ? "Agregando..." : "Agregar pieza"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTADO DE IMPORTACIÓN */}
      {importedCount !== null && importedCount > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Se importaron <b>{importedCount}</b> piezas correctamente.
        </div>
      )}
      {importErrors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="mb-1 font-medium">
            {importErrors.length} fila{importErrors.length === 1 ? "" : "s"} con problemas:
          </p>
          <ul className="list-disc space-y-0.5 pl-5">
            {importErrors.slice(0, 8).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {importErrors.length > 8 && <li>y {importErrors.length - 8} más...</li>}
          </ul>
        </div>
      )}

      <PendingDetailsReview order={order} onReviewed={onRefresh} />

      {/* ALERTA DE PIEZAS FALTANTES */}
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          complete
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-yellow-300 bg-yellow-50 text-yellow-800"
        }`}
      >
        {complete ? (
          <>Configuración completa: <b>{order.details.length}</b> de <b>{order.numberPieces}</b> piezas capturadas.</>
        ) : (
          <>Faltan <b>{missing}</b> piezas por capturar de <b>{order.numberPieces}</b> totales</>
        )}
      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-2xl border bg-white border-gray-200 shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-white text-xs uppercase text-gray-500 border-b border-gray-200">
            <tr className="border-gray-200 border-b">
              <th className="px-4 py-3 text-left">Artículo</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Talla</th>
              <th className="px-4 py-3">Corte</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {order.details.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400 border-b border-gray-200">
                  Aún no hay prendas capturadas.
                </td>
              </tr>
            ) : (
              order.details.map((detail) =>
                editingId === detail.id ? (
                  <tr key={detail.id} className="border-t border-gray-200 bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{detail.article}</div>
                      <div className="text-xs text-gray-500">{detail.category}</div>
                    </td>

                    <td className="px-2 py-3">
                      <input
                        value={editForm.nickname}
                        onChange={(e) => setEditForm((p) => ({ ...p, nickname: e.target.value }))}
                        placeholder="Nombre en prenda*"
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                      />
                    </td>

                    <td className="px-2 py-3">
                      <input
                        value={editForm.number}
                        onChange={(e) => setEditForm((p) => ({ ...p, number: e.target.value }))}
                        placeholder="Número"
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-center outline-none focus:border-slate-500"
                      />
                    </td>

                    <td className="px-2 py-3">
                      <select
                        value={editForm.size}
                        onChange={(e) => setEditForm((p) => ({ ...p, size: e.target.value as OrderSize }))}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                      >
                        <option value="">Talla*</option>
                        {SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-2 py-3">
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value as OrderGender }))}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                      >
                        <option value="">Corte*</option>
                        {GENDERS.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex justify-center gap-2">
                        <button onClick={cancelEdit} title="Cancelar">
                          <X size={16} className="text-gray-500" />
                        </button>
                        <button onClick={handleEditSubmit} title="Guardar">
                          <Check size={16} className="text-emerald-600" />
                        </button>
                      </div>
                      {editError && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
                          <AlertTriangle size={11} /> {editError}
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  <tr key={detail.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">
                      <div className="font-medium">{detail.article}</div>
                      <div className="text-xs text-gray-500">{detail.category}</div>
                    </td>
                    <td className="px-4 py-3">{detail.nickname}</td>
                    <td className="text-center">{detail.number ?? "-"}</td>
                    <td className="text-center">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {detail.size}
                      </span>
                    </td>
                    <td className="text-center">{detail.gender}</td>
                    <td>
                      {isConfiguring && (
                      <div className="flex justify-center gap-3">
                        <button onClick={() => startEdit(detail)}>
                          <Pencil size={15} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleRemove(detail.id)}>
                          <Trash2 size={15} className="text-red-500" />
                        </button>
                      </div>
                      )}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
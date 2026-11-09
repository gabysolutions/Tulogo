import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import Swal from "sweetalert2";

import { useSales } from "../../hooks/useSales";
import type { Sale, SaleStatus, SaleWithDetails } from "../../types/sale";

import SaleTable from "../../components/sale/SaleTable";
import { SaleFormModal, type SaleFormSavePayload } from "../../components/sale/Saleformmodal";
import { SaleEditModal } from "../../components/sale/SaleEditModal";
import { SalePaymentModal } from "../../components/sale/SalePaymentModal";
import { SaleDetailModal } from "../../components/sale/SaleDetailModal";
import { getErrorMessage } from "../../components/sale/SaleUi";
import { useArticleCatalog } from "../../hooks/useArticleCatalog";
import { useFabricTypes } from "../../hooks/useFabricTypes";
import { createQuickClient } from "../../services/client.service";



const toast = (title: string) =>
  Swal.fire({ icon: "success", title, timer: 1600, showConfirmButton: false, toast: true, position: "top-end" });

const showError = (title: string, err: unknown) =>
  Swal.fire({ icon: "error", title, text: getErrorMessage(err, "Intenta de nuevo en unos segundos.") });

export default function SalePage() {
  const {
    sales,
    pagination,
    loading,
    error,
  
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    detail,
    openDetail,
    closeDetail,
    createSale,
    updateSale,
    addPayment,
    cancelPayment,
    cancelSale,
    openNote,
  } = useSales(10);

  const { articles, refetch: refetchArticles } = useArticleCatalog();
  const { fabricTypes } = useFabricTypes();

  

  
  const [createOpen, setCreateOpen] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [paySale, setPaySale] = useState<Sale | null>(null);

  useEffect(() => {
    if (error) Swal.fire({ icon: "error", title: "No se pudieron cargar las ventas", text: error });
  }, [error]);

  const handleOpenCreate = () => {
    refetchArticles();
    setCreateOpen(true);
  };

  const handleCreate = async (payload: SaleFormSavePayload) => {
    const { newClient, clientId: existingId, ...rest } = payload;
    let clientId = existingId;

    if (newClient) {
      const created = await createQuickClient({
        name: newClient.name,
        paternal_last_name: newClient.lastNameP,
        maternal_last_name: newClient.lastNameM,
        phone: newClient.phone,
      });
      clientId = created.id;
    }

    if (clientId === undefined) throw new Error("Selecciona o crea un cliente.");

    await createSale({ ...rest, clientId });
    toast("Venta registrada");
  };

  const handlePreview = async (sale: Sale) => {
    try {
      await openDetail(sale.id);
    } catch (err) {
      showError("No se pudo abrir la venta", err);
    }
  };

  const handleNote = async (sale: Pick<Sale, "id">) => {
    try {
      await openNote(sale.id);
    } catch (err) {
      showError("No se pudo generar la nota", err);
    }
  };

    const handleCancelSale = async (sale: Sale) => {
   const { isConfirmed } = await Swal.fire({
    icon: "warning",
    title: `¿Cancelar la venta V-${String(sale.id).padStart(4, "0")}?`,
    text: "Esta acción no se puede deshacer.",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, cancelar venta",
    cancelButtonText: "No, volver",
  });

        if (!isConfirmed) return;

  try {
    const res = await cancelSale(sale.id);
    toast(res.message);
  } catch (err) {
    showError("No se pudo cancelar la venta", err);
  }
};

  const handleCancelPayment = async (sale: SaleWithDetails, paymentId: number) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "¿Cancelar este pago?",
      text: "El saldo de la venta se recalculará.",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar pago",
      cancelButtonText: "No",
    });
    if (!isConfirmed) return;

    try {
      const res = await cancelPayment(sale.id, paymentId);
      toast(res.message);
    } catch (err) {
      showError("No se pudo cancelar el pago", err);
    }
  };

  return (
    <main className="mx-auto w-full space-y-5 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Ventas</h1>
          <p className="text-sm text-slate-400">Registra ventas, abonos y notas de venta.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700"
        >
          <Plus className="size-4" /> Nueva venta
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Buscar por numero de venta  "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          value={String(status)}
          onChange={(e) => setStatus(e.target.value === "all" ? "all" : (Number(e.target.value) as SaleStatus))}
        >
          <option value="all">Todos los estados</option>
          <option value="1">Pendientes</option>
          <option value="2">Liquidadas</option>
          <option value="0">Canceladas</option>
        </select>
      </div>

      <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <SaleTable
          sales={sales}
          onPreview={handlePreview}
          onEdit={setEditSale}
          onPay={setPaySale}
          onCancel={handleCancelSale}
        />
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} ventas
          </span>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="size-4" /> Anterior
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-40"
            >
              Siguiente <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

          <SaleFormModal
          open={createOpen}
          articles={articles}
          fabricTypes={fabricTypes}
          onClose={() => setCreateOpen(false)}
          onSave={handleCreate}
        />
      <SaleEditModal
        sale={editSale}
        onClose={() => setEditSale(null)}
        onSave={async (id, payload) => {
          const res = await updateSale(id, payload);
          toast(res.message);
        }}
      />
      <SalePaymentModal
        sale={paySale}
        onClose={() => setPaySale(null)}
        onSave={async (id, payload) => {
          const res = await addPayment(id, payload);
          toast(res.message);
        }}
      />
      <SaleDetailModal
        sale={detail}
        onClose={closeDetail}
        onNote={handleNote}
        onCancelPayment={handleCancelPayment}
      />
    </main>
  );
}
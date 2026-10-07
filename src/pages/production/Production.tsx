import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader2, PackageSearch } from "lucide-react";

import { useProductionOrders } from "../../hooks/useProduction";
import { useOrderMovements } from "../../hooks/Useordermovements";
import { useOrderPdf } from "../../hooks/Useorderpdf";
import { updateOrderStatusService } from "../../services/orders.service";
import type { Priority, ProductionOrderListItem } from "../../types/order";

import { SummaryCards } from "../../components/production/SummaryCards";
import {
  ProductionToolbar,
  type FilterOption,
  type SortKey,
} from "../../components/production/ProductionToolbar";
import { OrderCard } from "../../components/production/OrderCard";
import { UpdateStatusDialog } from "../../components/production/UpdateStatusDialog";
import { HistoryDrawer } from "../../components/production/HistoryDrawer";
import { daysUntil } from "../../utils/productionUtils";

// Ajusta si tu ruta de producción es distinta
const PRODUCTION_PATH = "/production";

const PRIORITY_WEIGHT: Record<Priority, number> = { alta: 0, media: 1, baja: 2 };

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

// TODO: reemplaza por tus hooks reales (necesitan id + nombre).
// Mientras estén vacíos, el toolbar oculta esos selects.
const clientOptions: FilterOption[] = [];
const designerOptions: FilterOption[] = [];

const Production = () => {
  const navigate = useNavigate();

  const {
    orders,
    cards,
    pagination,
    loading,
    error,
    filters,
    hasActiveFilters,
    setFilter,
    setPage,
    clearFilters,
    refetch,
  } = useProductionOrders();

  const [sort, setSort] = useState<SortKey>("delivery");

  // Dialog de estado
  const [statusOrder, setStatusOrder] = useState<ProductionOrderListItem | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  // Historial
  const [historyOrder, setHistoryOrder] = useState<ProductionOrderListItem | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const {
    movements,
    loading: historyLoading,
    error: historyError,
  } = useOrderMovements(historyOrder?.id, historyOpen);

  // PDF de la orden (GET /order/:id/PDF)
  const { openPdf, loadingId: printingId } = useOrderPdf();

  // Ordenamiento local (solo sobre la página cargada; el API no soporta sort)
  const sortedOrders = useMemo(() => {
    const list = [...orders];
    list.sort((a, b) => {
      if (sort === "priority") return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (sort === "pieces") return b.numberPieces - a.numberPieces;
      return daysUntil(a.deliveryDate) - daysUntil(b.deliveryDate);
    });
    return list;
  }, [orders, sort]);

  function handleReset() {
    clearFilters();
    setSort("delivery");
  }

  // El endpoint recibe el status ACTUAL y el backend avanza la orden.
  // Devuelve true si se actualizó para que el dialog sepa si cerrarse
  async function handleUpdateStatus(): Promise<boolean> {
    if (!statusOrder) return false;
    try {
      const res = await updateOrderStatusService(statusOrder.id, { status: statusOrder.status });
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: res.message || "Etapa actualizada",
        showConfirmButton: false,
        timer: 2500,
      });
      await refetch();
      return true;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar la etapa",
        text: getErrorMessage(err, "Intenta de nuevo"),
      });
      return false;
    }
  }

  function openDetails(order: ProductionOrderListItem) {
    navigate(`${PRODUCTION_PATH}/${order.id}`);
  }
  function openStatus(order: ProductionOrderListItem) {
    setStatusOrder(order);
    setStatusOpen(true);
  }
  function openHistory(order: ProductionOrderListItem) {
    setHistoryOrder(order);
    setHistoryOpen(true);
  }
  function handlePrint(order: ProductionOrderListItem) {
    openPdf(order.id);
  }

  const showInitialLoader = loading && orders.length === 0;
  const showEmpty = !loading && !error && sortedOrders.length === 0;

  return (
    <main className="mx-auto w-full px-6 py-8">
      <div className="flex w-full flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Producción</h1>
            <p className="text-sm text-slate-500">
              Administra el proceso de fabricación de todas las órdenes.
            </p>
          </div>
        </header>

        <SummaryCards cards={cards} />

        <ProductionToolbar
          filters={filters}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
          designers={designerOptions}
          clients={clientOptions}
          resultCount={pagination.total}
          hasActiveFilters={hasActiveFilters}
          onReset={handleReset}
        />

        {error && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Reintentar
            </button>
          </div>
        )}

        {showInitialLoader && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}

        {showEmpty && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <PackageSearch className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-slate-800">Sin órdenes que coincidan</p>
              <p className="text-sm text-slate-500">
                Ajusta los filtros o la búsqueda para ver más resultados.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {sortedOrders.length > 0 && (
          <div
            className={`grid grid-cols-1 gap-5 transition-opacity md:grid-cols-2 xl:grid-cols-4 ${
              loading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {sortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                printing={printingId === order.id}
                onViewDetails={openDetails}
                onUpdateStatus={openStatus}
                onViewHistory={openHistory}
                onPrint={handlePrint}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="font-mono text-xs text-slate-500">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}

        <UpdateStatusDialog
          order={statusOrder}
          open={statusOpen}
          onOpenChange={setStatusOpen}
          onConfirm={handleUpdateStatus}
        />
        <HistoryDrawer
          order={historyOrder}
          movements={movements}
          loading={historyLoading}
          error={historyError}
          open={historyOpen}
          onOpenChange={setHistoryOpen}
        />
      </div>
    </main>
  );
};

export default Production;
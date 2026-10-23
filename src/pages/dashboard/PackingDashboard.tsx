import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Shirt,
  Store,
  Truck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getUserPrivilegesService } from "../../services/user.service";
import {
  getProductionOrdersService,
  updateOrderStatusService,
  type GetProductionOrdersResult,
} from "../../services/orders.service";
import { canMoveFromStage, getProductionStatuses } from "../../constants/permissions";
import { getStage, PRIORITY_META } from "../../types/order";
import type { ProductionOrderListItem } from "../../types/order";
import { deliveryLabel, deliveryStatus, formatDate } from "../../utils/productionUtils";
import { getApiErrorMessage, getApiErrorStatus } from "../../utils/apiError";
import { UpdateStatusDialog } from "../../components/production/UpdateStatusDialog"; 

const PACKING_STAGE = 9;

interface StatCardProps {
  label: string;
  value: number | null;
  icon: LucideIcon;
  tone: string;
}

function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="size-6" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm text-slate-500">{label}</span>
        {value === null ? (
          <span className="mt-1 h-8 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          <span className="text-3xl font-semibold text-slate-800">{value}</span>
        )}
      </div>
    </div>
  );
}

function PackingRow({
  order,
  canAdvance,
  onAdvance,
}: {
  order: ProductionOrderListItem;
  canAdvance: boolean;
  onAdvance: (order: ProductionOrderListItem) => void;
}) {
  const priority = PRIORITY_META[order.priority];
  const dStatus = deliveryStatus(order);
  const withShipping = Number(order.sending) === 1;
  const thumb = order.images[0];

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-300">
          {thumb ? (
            <img src={thumb} alt={`ORD-${order.id}`} className="size-full object-cover" />
          ) : (
            <Shirt className="size-6" />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1 leading-tight">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-800">
              ORD-{String(order.id).padStart(4, "0")}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${priority.classes}`}>
              {priority.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                withShipping ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {withShipping ? <Truck className="size-3" /> : <Store className="size-3" />}
              {withShipping ? "Con envío" : "Recoge en tienda"}
            </span>
          </div>
          <span className="truncate text-sm text-slate-600">{order.client}</span>
          <span
            className={`text-xs font-medium ${
              dStatus === "overdue" ? "text-red-600" : dStatus === "soon" ? "text-amber-600" : "text-slate-400"
            }`}
          >
            Entrega {formatDate(order.deliveryDate)} · {deliveryLabel(order)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <Link
          to={`/production/${order.id}`}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Ver detalle
        </Link>
        {canAdvance && (
          <button
            onClick={() => onAdvance(order)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <ArrowRight size={16} />
            Avanzar a {getStage(order.status + 1).label}
          </button>
        )}
      </div>
    </li>
  );
}

const PackingDashboard = () => {
  const { user } = useAuth();

  const [data, setData] = useState<GetProductionOrdersResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [allowed, setAllowed] = useState<number[]>([]);
  const [selected, setSelected] = useState<ProductionOrderListItem | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      setData(await getProductionOrdersService({ status: PACKING_STAGE, page }));
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron cargar las órdenes de empaque."));
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Permisos: una sola vez para toda la lista
  useEffect(() => {
    if (!user) return;
    getUserPrivilegesService(user.id)
      .then((privileges) => setAllowed(getProductionStatuses(privileges)))
      .catch(console.error);
  }, [user]);

  // Las más urgentes primero
  const orders = useMemo(
    () => [...(data?.orders ?? [])].sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate)),
    [data]
  );

  const canAdvance = canMoveFromStage(allowed, PACKING_STAGE);

  const handleConfirm = async (): Promise<boolean> => {
    if (!selected) return false;
    try {
      await updateOrderStatusService(selected.id, { status: selected.status });
    } catch (err) {
      if ([403, 409, 422].includes(getApiErrorStatus(err) ?? 0)) await fetchData();
      throw err; // el diálogo muestra el mensaje
    }
    await fetchData();
    return true;
  };

  const pagination = data?.pagination;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-800">Empaque</h1>
          <p className="text-sm text-slate-500">Órdenes listas para empacar y entregar</p>
        </header>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="En empaque"
            value={pagination ? pagination.total : null}
            icon={PackageCheck}
            tone="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Entregas de hoy"
            value={data ? data.cards.todaysDeliveries : null}
            icon={CalendarClock}
            tone="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Entregadas"
            value={data ? data.cards.delivered : null}
            icon={CheckCircle2}
            tone="bg-emerald-50 text-emerald-600"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-slate-800">Pendientes de empaque</h2>

          {data === null ? (
            <div className="mt-3 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No hay órdenes en empaque</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((o) => (
                <PackingRow key={o.id} order={o} canAdvance={canAdvance} onAdvance={setSelected} />
              ))}
            </ul>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="size-4" /> Anterior
              </button>
              <span className="text-xs text-slate-400">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                Siguiente <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </section>
      </div>

      <UpdateStatusDialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        onConfirm={handleConfirm}
        order={selected}
      />
    </main>
  );
};

export default PackingDashboard;
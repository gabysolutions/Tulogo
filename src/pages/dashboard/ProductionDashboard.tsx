import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; 
import { getUserPrivilegesService } from "../../services/user.service";
import { getProductionOrdersService } from "../../services/orders.service";
import { STAGES } from "../../types/order";
import type { ProductionOrderListItem } from "../../types/order";
import type { ActivityColor } from "../../types/dashboard"; 

const PRODUCTION_KEY = "PRODUCTION_PERMISSION";


const STAGE_COLOR: Record<number, ActivityColor> = {
  1: "blue",
  2: "purple",
  3: "cyan",
  4: "indigo",
  5: "pink",
  6: "orange",
  7: "yellow",
  8: "red",
  9: "green",
  10: "gray",
};

// Clases completas para que Tailwind las detecte (no se pueden armar con strings dinámicos)
const COLOR_STYLES: Record<
  ActivityColor,
  { header: string; badge: string }
> = {
  blue: { header: "bg-blue-50 border-blue-200 text-blue-800", badge: "bg-blue-100 text-blue-700" },
  green: { header: "bg-green-50 border-green-200 text-green-800", badge: "bg-green-100 text-green-700" },
  orange: { header: "bg-orange-50 border-orange-200 text-orange-800", badge: "bg-orange-100 text-orange-700" },
  red: { header: "bg-red-50 border-red-200 text-red-800", badge: "bg-red-100 text-red-700" },
  purple: { header: "bg-purple-50 border-purple-200 text-purple-800", badge: "bg-purple-100 text-purple-700" },
  yellow: { header: "bg-yellow-50 border-yellow-200 text-yellow-800", badge: "bg-yellow-100 text-yellow-700" },
  pink: { header: "bg-pink-50 border-pink-200 text-pink-800", badge: "bg-pink-100 text-pink-700" },
  cyan: { header: "bg-cyan-50 border-cyan-200 text-cyan-800", badge: "bg-cyan-100 text-cyan-700" },
  indigo: { header: "bg-indigo-50 border-indigo-200 text-indigo-800", badge: "bg-indigo-100 text-indigo-700" },
  gray: { header: "bg-slate-50 border-slate-200 text-slate-800", badge: "bg-slate-100 text-slate-700" },
};

const orderCode = (id: number) => `ORD-${String(id).padStart(4, "0")}`;

const ProductionDashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<Set<number>>(new Set());
  const [orders, setOrders] = useState<ProductionOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [privileges, res] = await Promise.all([
        getUserPrivilegesService(user.id),
        getProductionOrdersService(),
      ]);

      const statuses =
        privileges
          .find((p) => p.key === PRODUCTION_KEY)
          ?.detail?.map((d) => d.status) ?? [];

      setAllowed(new Set(statuses));
      setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

 
  const myOrders = useMemo(
    () => orders.filter((o) => allowed.has(o.status)),
    [orders, allowed]
  );

  
  const grouped = useMemo(
    () =>
      STAGES.filter((s) => allowed.has(s.id)).map((s) => ({
        stage: s,
        orders: myOrders.filter((o) => o.status === s.id),
      })),
    [myOrders, allowed]
  );

  if (!hasPermission(PRODUCTION_KEY)) {
    return (
      <p className="p-6 text-sm text-slate-500">
        No tienes acceso a esta sección.
      </p>
    );
  }

  if (loading) return <p className="p-6 text-sm text-slate-500">Cargando...</p>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Producción</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bienvenido, {user?.name}. Tienes {myOrders.length} orden(es) en tus etapas.
        </p>
      </div>

      {allowed.size === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Aún no tienes etapas asignadas. Pídele a un administrador que te dé
          permisos.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {grouped.map(({ stage, orders }) => {
            const styles = COLOR_STYLES[STAGE_COLOR[stage.id] ?? "gray"];

            return (
              <section
                key={stage.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <header
                  className={`flex items-center justify-between border-b px-4 py-3 ${styles.header}`}
                >
                  <h2 className="text-sm font-semibold">{stage.label}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                  >
                    {orders.length}
                  </span>
                </header>

                <ul className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <li className="px-4 py-6 text-center text-xs text-slate-400">
                      Sin órdenes
                    </li>
                  ) : (
                    orders.map((o) => (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`/production/${o.id}`)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800">
                              {orderCode(o.id)}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {o.client} · {o.numberPieces} pzas · Entrega{" "}
                              {o.deliveryDate}
                            </p>
                          </div>
                          <ChevronRight className="size-4 shrink-0 text-slate-400" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductionDashboard;
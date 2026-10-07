import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { cn } from "../../lib/utils";
import { isCompleted, type OrderListItem } from "../../types/order";
import type { Design } from "../../types/design";
import { useCalendarOrders } from "../../hooks/Usecalendarorders";
import { useCalendarDesigns } from "../../hooks/useCalendarDesigns";
import { quoteFolio } from "../../utils/productionUtils";

import { designFolio } from "./DesignEventCard";
import { AgendaFilters, emptyFilters, type Filters } from "./AgendaFilters";
import { dayKey, DayView, MonthView, WeekView } from "./CalendarViews";
import { SummaryPanel } from "./SummaryPanel";

const PRODUCTION_PATH = "/production";
const DESIGNS_PATH = "/diseños";

type ViewMode = "month" | "week" | "day";

const VIEW_LABEL: Record<ViewMode, string> = {
  month: "Mes",
  week: "Semana",
  day: "Día",
};

export function OrdersCalendar() {
  const navigate = useNavigate();

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useCalendarOrders();
  const {
    designs,
    loading: designsLoading,
    error: designsError,
    refetch: refetchDesigns,
  } = useCalendarDesigns();

  const loading = ordersLoading || designsLoading;
  const error = ordersError ?? designsError;
  const refetch = () => {
    refetchOrders();
    refetchDesigns();
  };

  const [view, setView] = useState<ViewMode>("month");
  const [date, setDate] = useState(new Date());
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  // Las opciones del filtro salen de las órdenes y los diseños reales
  const designers = useMemo(
    () =>
      Array.from(
        new Set(
          [...orders.map((o) => o.designer), ...designs.map((d) => d.designerName)].filter(Boolean),
        ),
      ).sort(),
    [orders, designs],
  );

  const filteredOrders = useMemo(() => {
    const client = filters.client.trim().toLowerCase();
    const folio = filters.folio.trim().toLowerCase();

    return orders.filter((o) => {
      if (client && !o.client.toLowerCase().includes(client)) return false;
      if (folio && !quoteFolio(o.quoteId).toLowerCase().includes(folio)) return false;
      if (filters.designer !== "all" && o.designer !== filters.designer) return false;
      if (filters.priority !== "all" && o.priority !== filters.priority) return false;
      if (filters.stage !== "all" && o.status !== Number(filters.stage)) return false;
      if (filters.onlyPending && isCompleted(o)) return false;
      return true;
    });
  }, [orders, filters]);

  const byDay = useMemo(() => {
    const map = new Map<string, OrderListItem[]>();
    for (const o of filteredOrders) {
      const key = o.deliveryDate;
      const list = map.get(key);
      if (list) list.push(o);
      else map.set(key, [o]);
    }
    return map;
  }, [filteredOrders]);

  const designsByDay = useMemo(() => {
    const map = new Map<string, Design[]>();

    // Los diseños no tienen cliente, prioridad ni etapa de producción:
    // si alguno de esos filtros está activo, no se muestran.
    if (filters.client.trim() || filters.priority !== "all" || filters.stage !== "all") return map;

    // Si la cotización ya tiene orden, se muestra como orden y no como diseño
    const quotesWithOrder = new Set(orders.map((o) => o.quoteId));
    const folio = filters.folio.trim().toLowerCase();

    for (const d of designs) {
      if (!d.deliveryDate || quotesWithOrder.has(d.quoteId)) continue;
      if (filters.designer !== "all" && d.designerName !== filters.designer) continue;
      if (
        folio &&
        !`${designFolio(d.id)} ${quoteFolio(d.quoteId)}`.toLowerCase().includes(folio)
      )
        continue;

      const key = d.deliveryDate.slice(0, 10);
      const list = map.get(key);
      if (list) list.push(d);
      else map.set(key, [d]);
    }
    return map;
  }, [designs, orders, filters]);

  const todayKey = dayKey(new Date());
  const tomorrowKey = dayKey(addDays(new Date(), 1));

  const next7 = useMemo(() => {
    return filteredOrders
      .filter((o) => {
        const diff = differenceInCalendarDays(parseISO(o.deliveryDate), new Date());
        return diff >= 0 && diff <= 7;
      })
      .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
  }, [filteredOrders]);

  const weekOrders = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    return filteredOrders.filter((o) => {
      const d = parseISO(o.deliveryDate);
      return d >= weekStart && d <= weekEnd;
    });
  }, [filteredOrders]);

  const goPrev = () => {
    if (view === "month") setDate((d) => subMonths(d, 1));
    else if (view === "week") setDate((d) => subWeeks(d, 1));
    else setDate((d) => addDays(d, -1));
  };

  const goNext = () => {
    if (view === "month") setDate((d) => addMonths(d, 1));
    else if (view === "week") setDate((d) => addWeeks(d, 1));
    else setDate((d) => addDays(d, 1));
  };

  const goToday = () => setDate(new Date());

  // El detalle de la orden y del diseño viven en su propia ruta
  const handleSelect = (order: OrderListItem) => {
    navigate(`${PRODUCTION_PATH}/${order.id}`);
  };

  const handleSelectDesign = (design: Design) => {
    navigate(`${DESIGNS_PATH}/${design.id}`);
  };

  const navTitle = useMemo(() => {
    if (view === "month") return format(date, "MMMM yyyy", { locale: es });
    if (view === "day") return format(date, "d 'de' MMMM yyyy", { locale: es });
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(weekStart, "d MMM", { locale: es })} – ${format(weekEnd, "d MMM yyyy", { locale: es })}`;
  }, [date, view]);

  const showInitialLoader = loading && orders.length === 0 && designs.length === 0;

  const viewProps = {
    date,
    byDay,
    designsByDay,
    onSelect: handleSelect,
    onSelectDesign: handleSelectDesign,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
            <CalendarDays className="size-5 text-foreground" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Agenda de Entregas</h1>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center rounded-full border border-gray-300 bg-muted/40 px-1.5 py-1">
            <button
              type="button"
              onClick={goPrev}
              className="grid size-9 place-items-center rounded-l-full text-muted-foreground hover:bg-blue-200 hover:text-black"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[8.5rem] px-1 text-center text-sm font-medium text-foreground capitalize">
              {navTitle}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="grid size-9 place-items-center rounded-r-full text-muted-foreground hover:bg-blue-200 hover:text-black"
              aria-label="Siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-3">
            <button
              type="button"
              onClick={goToday}
              className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-blue-200 hover:text-black"
            >
              Hoy
            </button>
            <span className="h-4 w-px bg-border" />
            {(Object.keys(VIEW_LABEL) as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-blue-200 text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {VIEW_LABEL[v]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AgendaFilters filters={filters} onChange={setFilters} designers={designers} />

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            Reintentar
          </button>
        </div>
      )}

      {showInitialLoader ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity lg:grid-cols-[1fr_20rem]",
            loading && "pointer-events-none opacity-60",
          )}
        >
          <div>
            {view === "month" && <MonthView {...viewProps} />}
            {view === "week" && <WeekView {...viewProps} />}
            {view === "day" && <DayView {...viewProps} />}
          </div>

          <SummaryPanel
            orders={filteredOrders}
            todayKey={todayKey}
            tomorrowKey={tomorrowKey}
            next7={next7}
            weekOrders={weekOrders}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}

export default OrdersCalendar;
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "../../lib/utils";
import { PRIORITY_META, type OrderListItem, type Priority } from "../../types/order";
import { quoteFolio } from "../../utils/productionUtils";
import { EventCard } from "../calendar/EventCard";

interface Props {
  orders: OrderListItem[];
  todayKey: string;
  tomorrowKey: string;
  next7: OrderListItem[];
  weekOrders: OrderListItem[];
  onSelect: (order: OrderListItem) => void;
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {count}
        </span>
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

const empty = <p className="text-xs text-muted-foreground">Sin entregas programadas.</p>;

export function SummaryPanel({
  orders,
  todayKey,
  tomorrowKey,
  next7,
  weekOrders,
  onSelect,
}: Props) {
  const today = orders.filter((o) => o.deliveryDate === todayKey);
  const tomorrow = orders.filter((o) => o.deliveryDate === tomorrowKey);
  const pieces = weekOrders.reduce((sum, o) => sum + o.numberPieces, 0);
  const byPriority = (["alta", "media", "baja"] as Priority[]).map((p) => ({
    p,
    n: weekOrders.filter((o) => o.priority === p).length,
  }));

  return (
    // 1 columna en móvil, 2 en tablet, 1 en pantallas grandes (panel lateral)
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
      <Section title="Hoy" count={today.length}>
        {today.length ? (
          today.map((o) => <EventCard key={o.id} order={o} onSelect={onSelect} variant="full" />)
        ) : (
          empty
        )}
      </Section>

      <Section title="Mañana" count={tomorrow.length}>
        {tomorrow.length ? (
          tomorrow.map((o) => <EventCard key={o.id} order={o} onSelect={onSelect} variant="full" />)
        ) : (
          empty
        )}
      </Section>

      <Section title="Próximos 7 días" count={next7.length}>
        {next7.length
          ? next7.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => onSelect(o)}
                className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left transition-colors hover:bg-muted sm:gap-3 sm:py-1.5"
              >
                <span className={cn("size-2 shrink-0 rounded-full", PRIORITY_META[o.priority].dot)} />
                <span className="w-16 shrink-0 text-[11px] capitalize text-muted-foreground sm:w-14">
                  {format(parseISO(o.deliveryDate), "EEE d", { locale: es })}
                </span>
                <span className="min-w-0 flex-1 text-xs font-medium text-foreground line-clamp-2 sm:line-clamp-none sm:truncate">
                  {quoteFolio(o.quoteId)} · {o.client}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {o.numberPieces} pz
                </span>
              </button>
            ))
          : empty}
      </Section>

      <Section title="Resumen de la semana" count={weekOrders.length}>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted/60 p-3">
            <p className="text-lg font-semibold text-foreground">{weekOrders.length}</p>
            <p className="text-[11px] text-muted-foreground">Pedidos</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <p className="text-lg font-semibold text-foreground">{pieces}</p>
            <p className="text-[11px] text-muted-foreground">Piezas por entregar</p>
          </div>
        </div>
        <div className="space-y-1.5 pt-1">
          {byPriority.map(({ p, n }) => (
            <div key={p} className="flex items-center gap-2 text-xs">
              <span className={cn("size-2 rounded-full", PRIORITY_META[p].dot)} />
              <span className="flex-1 text-muted-foreground">{PRIORITY_META[p].label}</span>
              <span className="font-semibold text-foreground">{n}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
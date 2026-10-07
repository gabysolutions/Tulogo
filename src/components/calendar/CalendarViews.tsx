import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "../../lib/utils";
import { PRIORITY_META, type OrderListItem } from "../../types/order";
import type { Design } from "../../types/design";
import { EventCard } from "./EventCard";
import { DesignEventCard } from "./DesignEventCard";

export const dayKey = (date: Date) => format(date, "yyyy-MM-dd");

interface ViewProps {
  date: Date;
  byDay: Map<string, OrderListItem[]>;
  designsByDay: Map<string, Design[]>;
  onSelect: (order: OrderListItem) => void;
  onSelectDesign: (design: Design) => void;
}

type Entry =
  | { kind: "order"; order: OrderListItem }
  | { kind: "design"; design: Design };

const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const MAX_VISIBLE = 3;

const getEntries = (
  key: string,
  byDay: ViewProps["byDay"],
  designsByDay: ViewProps["designsByDay"],
): Entry[] => [
  ...(byDay.get(key) ?? []).map((order): Entry => ({ kind: "order", order })),
  ...(designsByDay.get(key) ?? []).map((design): Entry => ({ kind: "design", design })),
];

const entryKey = (e: Entry) => (e.kind === "order" ? `o-${e.order.id}` : `d-${e.design.id}`);

function EntryCard({
  entry,
  onSelect,
  onSelectDesign,
  variant,
}: Pick<ViewProps, "onSelect" | "onSelectDesign"> & {
  entry: Entry;
  variant?: "compact" | "full";
}) {
  return entry.kind === "order" ? (
    <EventCard order={entry.order} onSelect={onSelect} variant={variant} />
  ) : (
    <DesignEventCard design={entry.design} onSelect={onSelectDesign} variant={variant} />
  );
}

function DayIndicator({ entries }: { entries: Entry[] }) {
  const priorities = Array.from(
    new Set(entries.flatMap((e) => (e.kind === "order" ? [e.order.priority] : []))),
  );
  const hasDesigns = entries.some((e) => e.kind === "design");
  return (
    <span className="flex items-center gap-0.5">
      {priorities.map((p) => (
        <span key={p} className={cn("size-1.5 rounded-full", PRIORITY_META[p].dot)} />
      ))}
      {hasDesigns && <span className="size-1.5 rounded-full bg-violet-400" />}
    </span>
  );
}

export function MonthView({ date, byDay, designsByDay, onSelect, onSelectDesign }: ViewProps) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

  const open = (e: Entry) => (e.kind === "order" ? onSelect(e.order) : onSelectDesign(e.design));

  return (
    <div className="overflow-x-auto rounded-2xl border border-blue-200 bg-white shadow-soft">
      <div className="min-w-[640px] sm:min-w-0">
        <div className="grid grid-cols-7 border-b border-blue-200 bg-muted/40">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const items = getEntries(dayKey(day), byDay, designsByDay);
            const visible = items.slice(0, MAX_VISIBLE);
            const rest = items.length - visible.length;
            const outside = !isSameMonth(day, date);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[7rem] border-r border-b border-blue-200 p-1.5 last:border-r-0 sm:min-h-[8.5rem]",
                  outside && "bg-muted/25",
                )}
              >
                <div className="mb-1 flex items-center justify-between px-0.5">
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-xs font-medium",
                      outside ? "text-muted-foreground/60" : "text-foreground",
                      isToday(day) && "bg-primary text-primary-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {items.length > 0 && <DayIndicator entries={items} />}
                </div>
                <div className="space-y-1">
                  {visible.map((e) => (
                    <EntryCard
                      key={entryKey(e)}
                      entry={e}
                      onSelect={onSelect}
                      onSelectDesign={onSelectDesign}
                    />
                  ))}
                  {rest > 0 && (
                    <button
                      type="button"
                      onClick={() => open(items[visible.length]!)}
                      className="w-full rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      +{rest} más
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WeekView({ date, byDay, designsByDay, onSelect, onSelectDesign }: ViewProps) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => {
        const items = getEntries(dayKey(day), byDay, designsByDay);
        return (
          <div
            key={day.toISOString()}
            className={cn(
              "min-h-[10rem] rounded-2xl border border-blue-200 bg-white p-2.5 shadow-soft",
              isToday(day) && "border-primary/40 ring-1 ring-primary/20",
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: es })}
                </p>
                <p
                  className={cn(
                    "text-lg leading-none font-semibold",
                    isToday(day) ? "text-primary" : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </p>
              </div>
              {items.length > 0 && <DayIndicator entries={items} />}
            </div>
            <div className="space-y-1.5">
              {items.length ? (
                items.map((e) => (
                  <EntryCard
                    key={entryKey(e)}
                    entry={e}
                    onSelect={onSelect}
                    onSelectDesign={onSelectDesign}
                  />
                ))
              ) : (
                <p className="text-[11px] text-muted-foreground">Sin entregas</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DayView({ date, byDay, designsByDay, onSelect, onSelectDesign }: ViewProps) {
  const items = getEntries(dayKey(date), byDay, designsByDay);
  const orders = items.filter((e) => e.kind === "order");
  const designsCount = items.length - orders.length;
  const pieces = items.reduce((s, e) => (e.kind === "order" ? s + e.order.numberPieces : s), 0);

  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-soft">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
            {format(date, "EEEE", { locale: es })}
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            {format(date, "d 'de' MMMM yyyy", { locale: es })}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {orders.length} entregas · {designsCount} diseños · {pieces} piezas
        </p>
      </header>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.length ? (
          items.map((e) => (
            <EntryCard
              key={entryKey(e)}
              entry={e}
              onSelect={onSelect}
              onSelectDesign={onSelectDesign}
              variant="full"
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No hay entregas programadas este día.</p>
        )}
      </div>
    </div>
  );
}
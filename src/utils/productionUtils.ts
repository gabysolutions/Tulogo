import { STAGES } from "../types/order";
import type { Order } from "../types/order";


export function quoteFolio(quoteId: number): string {
  return `COT-${String(quoteId).padStart(4, "0")}`;
}

type DeliveryInfo = Pick<Order, "deliveryDate" | "status">;

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr + "T00:00:00");
  const diffMs = target.getTime() - today.getTime();

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function isToday(dateStr: string): boolean {
  return daysUntil(dateStr) === 0;
}

export type DeliveryStatus = "overdue" | "soon" | "onTrack";

export function deliveryStatus(order: DeliveryInfo): DeliveryStatus {
  if (order.status === 10) return "onTrack";

  const days = daysUntil(order.deliveryDate);
  if (days < 0) return "overdue";
  if (days <= 2) return "soon";
  return "onTrack";
}

export function deliveryLabel(order: DeliveryInfo): string {
  const days = daysUntil(order.deliveryDate);

  if (order.status === 10) return "Entregada";
  if (days === 0) return "Entrega hoy";
  if (days === 1) return "Entrega mañana";
  if (days < 0) return `Vencida hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`;
  return `Entrega en ${days} días`;
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";

  
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;

 
  const date = new Date(normalized.length === 10 ? `${normalized}T00:00:00` : normalized);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function progressPercent(status: number): number {
  return ((status - 1) / (STAGES.length - 1)) * 100;
}
import type { ApiError, BillingState, Invoice, InvoiceMode, InvoiceStatus } from "../types/invoice";

export const IVA_RATE = 0.16;

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const folioFromId = (id: number) => `COT-${String(id).padStart(4, "0")}`;

export const getBillingState = (subtotal: number, invoiced: number): BillingState => {
  if (invoiced <= 0.004) return "none";
  if (invoiced >= subtotal - 0.004) return "complete";
  return "partial";
};

export const calcTotals = (subtotal: number) => {
  const s = round2(Math.max(0, subtotal || 0));
  const iva = round2(s * IVA_RATE);
  return { subtotal: s, iva, total: round2(s + iva) };
};

export const invoicedPercent = (subtotal: number, invoiced: number) =>
  subtotal <= 0 ? 0 : Math.min(100, Math.round((invoiced / subtotal) * 100));

export const canCancel = (invoice: Invoice) => invoice.status === "active";

const moneyFmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
export const formatMoney = (n: number) => moneyFmt.format(n || 0);

const dateFmt = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  
export const formatDate = (iso: string | null | undefined) => {
     if (!iso) return "—";
     const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
     return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
   };
   
export const shortUuid = (uuid: string | null) => (uuid ? `${uuid.slice(0, 8)}…${uuid.slice(-4)}` : "—");

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; className: string }> = {
  pending: { label: "Timbrando…", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  active: { label: "Vigente", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  cancel_pending: { label: "Cancelación pendiente", className: "bg-orange-50 text-orange-700 ring-orange-200" },
  canceled: { label: "Cancelada", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  failed: { label: "Error", className: "bg-red-50 text-red-700 ring-red-200" },
};

export const BILLING_STATE_META: Record<BillingState, { label: string; className: string; bar: string }> = {
  none: { label: "Sin facturar", className: "bg-slate-100 text-slate-700 ring-slate-200", bar: "bg-slate-300" },
  partial: { label: "Parcial", className: "bg-amber-50 text-amber-700 ring-amber-200", bar: "bg-amber-500" },
  complete: { label: "Facturada", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-500" },
};

export const INVOICE_MODE_LABEL: Record<InvoiceMode, string> = {
  full: "Completa (lo pendiente)",
  items: "Por artículos",
  amount: "Por monto",
};

export const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" && e !== null && "message" in e && "status" in e;

export const toApiError = (e: unknown): ApiError =>
  isApiError(e) ? e : { message: e instanceof Error ? e.message : "Error inesperado", status: 0 };

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

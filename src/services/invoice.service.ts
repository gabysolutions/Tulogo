import { isAxiosError } from "axios";
import { http } from "./http";
import { folioFromId, getBillingState } from "../utils/invoiceUtils";
import type {
  BillingQuotesResponse,
  BillingQuotesResponseDTO,
  BillingQuoteRow,
  BillingQuoteRowDTO,
  CancelInvoicePayload,
  CancelInvoiceResult,
  CfdiUseOption,
  GetBillingQuotesParams,
  Invoice,
  InvoiceDTO,
  InvoiceErrorDetails,
  InvoiceItem,
  InvoiceItemDTO,
  IssueInvoicePayload,
  QuoteBillingLine,
  QuoteBillingLineDTO,
  QuoteBillingSummary,
  QuoteBillingSummaryDTO,
  SendInvoicePayload,
  SendInvoiceResult,
} from "../types/invoice";

// ---------- Error de la API de facturación ----------
export class InvoiceApiError extends Error {
  status: number;
  details?: InvoiceErrorDetails;

  constructor(message: string, status: number, details?: InvoiceErrorDetails) {
    super(message);
    this.name = "InvoiceApiError";
    this.status = status;
    this.details = details;
  }
}

interface ErrorBody {
  message?: string;
  details?: InvoiceErrorDetails;
}

async function readErrorBody(data: unknown): Promise<ErrorBody | undefined> {
  // En descargas (responseType "blob") el error JSON llega como Blob
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()) as ErrorBody;
    } catch {
      return undefined;
    }
  }
  return data as ErrorBody | undefined;
}

async function toInvoiceError(error: unknown): Promise<InvoiceApiError> {
  if (isAxiosError(error)) {
    const body = await readErrorBody(error.response?.data);
    return new InvoiceApiError(
      body?.message ?? "No se pudo completar la operación de facturación",
      error.response?.status ?? 0,
      body?.details
    );
  }
  return new InvoiceApiError(error instanceof Error ? error.message : "Error inesperado", 0);
}

async function run<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    throw await toInvoiceError(error);
  }
}

// ---------- Utilidades de mapeo ----------
const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// Las fechas DATE llegan como ISO; nos quedamos con "YYYY-MM-DD" para evitar corrimientos de zona horaria
const toDateOnly = (value: string | null | undefined): string | null =>
  value ? String(value).slice(0, 10) : null;

// ---------- Mapeo DTO -> dominio ----------
function mapBillingQuoteRow(dto: BillingQuoteRowDTO): BillingQuoteRow {
  const subtotal = toNumber(dto.subtotal);
  const invoiced = toNumber(dto.invoiced);

  return {
    quoteId: dto.quote_id,
    folio: folioFromId(dto.quote_id),
    clientId: dto.client_id,
    clientName: dto.client_name,
    clientFiscalComplete: Boolean(dto.client_fiscal_complete),
    deliveryDate: toDateOnly(dto.delivery_date),
    subtotal,
    invoiced,
    remaining: toNumber(dto.remaining),
    state: getBillingState(subtotal, invoiced),
    requiresInvoice: Boolean(dto.requires_invoice),
    invoicesCount: toNumber(dto.invoices_count),
    lastInvoiceDate: dto.last_invoice_date ?? null,
  };
}

function mapInvoiceItem(dto: InvoiceItemDTO): InvoiceItem {
  return {
    id: dto.id,
    quoteDetailId: dto.quote_detail_id ?? null,
    description: dto.description,
    quantity: toNumber(dto.quantity),
    unitPrice: toNumber(dto.unit_price),
    subtotal: toNumber(dto.subtotal),
  };
}

function mapInvoice(dto: InvoiceDTO): Invoice {
  return {
    id: dto.id,
    status: dto.status,
    folio: dto.folio ?? null,
    uuid: dto.uuid ?? null,
    subtotal: toNumber(dto.subtotal),
    iva: toNumber(dto.iva),
    total: toNumber(dto.total),
    paymentMethod: dto.payment_method,
    paymentForm: dto.payment_form,
    errorMessage: dto.error_message ?? null,
    registrationDate: dto.registration_date,
    canceledDate: dto.canceled_date ?? null,
    items: (dto.items ?? []).map(mapInvoiceItem),
  };
}

function mapLine(dto: QuoteBillingLineDTO): QuoteBillingLine {
  return {
    detailId: dto.detailId,
    articleId: dto.articleId,
    description: dto.description,
    quantity: toNumber(dto.quantity),
    unitPrice: toNumber(dto.unitPrice),
    subtotal: toNumber(dto.subtotal),
    productCode: dto.productCode ?? null,
    unitCode: dto.unitCode ?? null,
    invoicedQuantity: toNumber(dto.invoicedQuantity),
    remainingQuantity: toNumber(dto.remainingQuantity),
  };
}

function mapSummary(dto: QuoteBillingSummaryDTO): QuoteBillingSummary {
  return {
    quoteId: dto.quoteId,
    folio: folioFromId(dto.quoteId),
    requiresInvoice: Boolean(dto.requiresInvoice),
    quoteCanceled: Boolean(dto.quoteCanceled),
    subtotal: toNumber(dto.subtotal),
    invoiced: toNumber(dto.invoiced),
    remaining: toNumber(dto.remaining),
    client: dto.client
      ? {
          id: dto.client.id,
          name: dto.client.name,
          rfc: dto.client.rfc ?? null,
          fiscalName: dto.client.fiscalName ?? null,
          fiscalRegime: dto.client.fiscalRegime ?? null,
          fiscalZipCode: dto.client.fiscalZipCode ?? null,
          cfdiUse: dto.client.cfdiUse ?? null,
        }
      : null,
    lines: dto.lines.map(mapLine),
    invoices: dto.invoices.map(mapInvoice),
  };
}

// ---------- Llamadas a la API ----------

/** GET /invoice/quotes: lista de cotizaciones con factura, con estadísticas globales */
export function getBillingQuotes(params: GetBillingQuotesParams = {}): Promise<BillingQuotesResponse> {
  const { search, status, page = 1, pageSize = 10 } = params;

  return run(async () => {
    const { data } = await http.get<BillingQuotesResponseDTO>("/invoice/quotes", {
      params: {
        page,
        pageSize,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(status && status !== "all" ? { status } : {}),
      },
    });

    return {
      rows: data.data.map(mapBillingQuoteRow),
      stats: {
        pendingAmount: toNumber(data.stats.pending_amount),
        invoicedAmount: toNumber(data.stats.invoiced_amount),
        pendingQuotes: toNumber(data.stats.pending_quotes),
        canceledInvoices: toNumber(data.stats.canceled_invoices),
      },
      pagination: data.pagination,
    };
  });
}

/** GET /invoice/quote/:quoteId: resumen de facturación de una cotización */
export function getQuoteBilling(quoteId: number): Promise<QuoteBillingSummary> {
  return run(async () => {
    const { data } = await http.get<QuoteBillingSummaryDTO>(`/invoice/quote/${quoteId}`);
    return mapSummary(data);
  });
}

/** POST /invoice/quote/:quoteId: emite una factura ligada a la cotización */
export function issueInvoice(quoteId: number, payload: IssueInvoicePayload): Promise<Invoice> {
  return run(async () => {
    const { data } = await http.post<InvoiceDTO>(`/invoice/quote/${quoteId}`, payload);
    return mapInvoice(data);
  });
}

/** GET /invoice/:id/pdf */
export function getInvoicePdf(id: number): Promise<Blob> {
  return run(async () => {
    const { data } = await http.get<Blob>(`/invoice/${id}/pdf`, { responseType: "blob" });
    return data;
  });
}

/** GET /invoice/:id/xml */
export function getInvoiceXml(id: number): Promise<Blob> {
  return run(async () => {
    const { data } = await http.get<Blob>(`/invoice/${id}/xml`, { responseType: "blob" });
    return data;
  });
}

/** POST /invoice/:id/send */
export function sendInvoice(id: number, payload: SendInvoicePayload): Promise<SendInvoiceResult> {
  return run(async () => {
    const { data } = await http.post<SendInvoiceResult>(`/invoice/${id}/send`, payload);
    return data;
  });
}

/** DELETE /invoice/:id: cancela la factura ante el SAT */
export function cancelInvoice(id: number, payload: CancelInvoicePayload): Promise<CancelInvoiceResult> {
  return run(async () => {
    const { data } = await http.delete<CancelInvoiceResult>(`/invoice/${id}`, { data: payload });
    return data;
  });
}

/**
 * GET /invoice/catalogs/cfdi-uses
 * La forma del catálogo del proveedor aún no está confirmada: se aceptan varias formas
 * ({ Value, Name }, { value, name }, { Id, Description }).
 */
export function getCfdiUses(): Promise<CfdiUseOption[]> {
  return run(async () => {
    const { data } = await http.get<Record<string, unknown>[]>("/invoice/catalogs/cfdi-uses");

    return (Array.isArray(data) ? data : [])
      .map((raw) => {
        const value = String(raw.Value ?? raw.value ?? raw.Id ?? raw.id ?? "").trim();
        const name = String(raw.Name ?? raw.name ?? raw.Description ?? raw.description ?? value).trim();
        return { value, name };
      })
      .filter((option) => option.value !== "");
  });
}
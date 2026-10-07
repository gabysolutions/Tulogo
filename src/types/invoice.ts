
export const INVOICE_STATUSES = ["pending", "active", "cancel_pending", "canceled", "failed"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_MODES = ["full", "items", "amount"] as const;
export type InvoiceMode = (typeof INVOICE_MODES)[number];

export const BILLING_STATES = ["none", "partial", "complete"] as const;
export type BillingState = (typeof BILLING_STATES)[number];
export type BillingStatusFilter = BillingState | "all";

export const CANCEL_MOTIVES = [
  { value: "01", label: "Con errores, con relación (requiere UUID sustituto)" },
  { value: "02", label: "Con errores, sin relación" },
  { value: "03", label: "No se llevó a cabo la operación" },
  { value: "04", label: "Operación nominativa relacionada en una factura global" },
] as const;
export type CancelMotive = (typeof CANCEL_MOTIVES)[number]["value"];


export interface InvoiceErrorDetails {
 
  missing?: string[];
  
  articles?: string[];
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  status: number;
  details?: InvoiceErrorDetails;
}


export interface BillingQuoteRowDTO {
  quote_id: number;
  client_id: number;
  client_name: string;
  client_fiscal_complete: boolean;
  delivery_date: string | null;
  subtotal: number;
  invoiced: number;
  remaining: number;
  requires_invoice: boolean;
  invoices_count: number;
  last_invoice_date: string | null;
}

export interface BillingStatsDTO {
  pending_amount: number;
  invoiced_amount: number;
  pending_quotes: number;
  canceled_invoices: number;
}

export interface BillingPagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BillingQuotesResponseDTO {
  data: BillingQuoteRowDTO[];
  stats: BillingStatsDTO;
  pagination: BillingPagination;
}

export interface InvoiceItemDTO {
  id: number;
  quote_detail_id: number | null;
  description: string;
  quantity: string | number;
  unit_price: string | number;
  subtotal: string | number;
}


export interface InvoiceDTO {
  id: number;
  status: InvoiceStatus;
  folio: string | null;
  uuid: string | null;
  subtotal: string | number;
  iva: string | number;
  total: string | number;
  payment_method: string;
  payment_form: string;
  error_message?: string | null;
  registration_date: string;
  canceled_date: string | null;
  items?: InvoiceItemDTO[];
}

export interface QuoteBillingLineDTO {
  detailId: number;
  articleId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productCode?: string;
  unitCode?: string;
  invoicedQuantity: number;
  remainingQuantity: number;
}

export interface QuoteBillingClientDTO {
  id: number;
  name: string;
  rfc: string | null;
  fiscalName: string | null;
  fiscalRegime: string | null;
  fiscalZipCode: string | null;
  cfdiUse: string | null;
}

export interface QuoteBillingSummaryDTO {
  quoteId: number;
  requiresInvoice: boolean;
  quoteCanceled: boolean;
  subtotal: number;
  invoiced: number;
  remaining: number;
  client: QuoteBillingClientDTO | null;
  lines: QuoteBillingLineDTO[];
  invoices: InvoiceDTO[];
}


export interface BillingQuoteRow {
  quoteId: number;
 
  folio: string;
  clientId: number;
  clientName: string;
  clientFiscalComplete: boolean;
  deliveryDate: string | null;
  subtotal: number;
  invoiced: number;
  remaining: number;
  
  state: BillingState;
  requiresInvoice: boolean;
  invoicesCount: number;
  lastInvoiceDate: string | null;
}

export interface BillingStats {
  pendingAmount: number;
  invoicedAmount: number;
  pendingQuotes: number;
  canceledInvoices: number;
}

export interface BillingQuotesResponse {
  rows: BillingQuoteRow[];
  stats: BillingStats;
  pagination: BillingPagination;
}

export interface InvoiceItem {
  id: number;
  quoteDetailId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: number;
  status: InvoiceStatus;
  folio: string | null;
  uuid: string | null;
  subtotal: number;
  iva: number;
  total: number;
  paymentMethod: string;
  paymentForm: string;
  errorMessage: string | null;
  registrationDate: string;
  canceledDate: string | null;
  items: InvoiceItem[];
}

export interface QuoteBillingLine {
  detailId: number;
  articleId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productCode: string | null;
  unitCode: string | null;
  invoicedQuantity: number;
  remainingQuantity: number;
}

export interface QuoteBillingClient {
  id: number;
  name: string;
  rfc: string | null;
  fiscalName: string | null;
  fiscalRegime: string | null;
  fiscalZipCode: string | null;
  cfdiUse: string | null;
}

export interface QuoteBillingSummary {
  quoteId: number;
  
  folio: string;
  requiresInvoice: boolean;
  quoteCanceled: boolean;
  subtotal: number;
  invoiced: number;
  remaining: number;
  client: QuoteBillingClient | null;
  lines: QuoteBillingLine[];
  invoices: Invoice[];
}

export interface CfdiUseOption {
  value: string;
  name: string;
}


export interface GetBillingQuotesParams {
  search?: string;
  status?: BillingStatusFilter;
  page?: number;
  pageSize?: number;
}

export type BillingQuotesQuery = GetBillingQuotesParams;

export interface IssueInvoiceItem {
  detailId: number;
  quantity: number;
}

interface IssueInvoiceBase {
  
  cfdiUse?: string;
}

export type IssueInvoicePayload =
  | (IssueInvoiceBase & { mode: "full" })
  | (IssueInvoiceBase & { mode: "items"; items: IssueInvoiceItem[] })
  | (IssueInvoiceBase & { mode: "amount"; amount: number; description?: string });

export interface SendInvoicePayload {
  email: string;
  subject?: string;
  comments?: string;
}

export interface SendInvoiceResult {
  message: string;
}

export interface CancelInvoicePayload {
  motive: CancelMotive;
  
  uuidReplacement?: string;
}

export interface CancelInvoiceResult {
  status: "canceled" | "cancel_pending";
  message?: string;
}
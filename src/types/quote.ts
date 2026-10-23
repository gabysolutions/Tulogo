export interface QuoteDetail {
  detailId: number;
  articleId: number | null;
  description: string;
  category: string;
  fabricType: string;
  fabricTypeId: number | null; 
  amount: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quote {
  id: number;
  folio: string; 
  clientId: number; 
  clientName: string; 
  phone: string;
  deliveryDate: string;
  iva: boolean;
  sending: boolean;
  shippingAmount: number;
  total: number;
  advance: number;
  balanceDue: number;
  priority: QuotePriority;
  status: QuoteStatus;
  registrationDate: string;
  settledDate?: string;
  details: QuoteDetail[];
}

export const QuoteStatus = {
  CANCELADA: 0,
  PENDIENTE: 1,
  ACEPTADA: 2,
  LIQUIDADA: 3,
} as const;

export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const QuotePriority = {
  BAJA: "BAJA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
} as const;

export type QuotePriority = (typeof QuotePriority)[keyof typeof QuotePriority];

export interface QuotesPagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QuotesResponse {
  quotes: Quote[];
  pagination: QuotesPagination;
}

export interface QuoteArticlePayload {
  articleId: number;
  fabricType: number;
  amount: number;
  unitPrice: number;
  subtotal: number;
}

export interface QuoteCreatePayload {
  clientId: number;
  deliveryDate: string;
  iva: boolean;
  sending: boolean;
  shippingAmount: number;
  total: number;
  advance: number;
  priority: QuotePriority;
  articles: QuoteArticlePayload[];
}

export interface QuoteUpdatePayload {
  deliveryDate: string;
  iva: boolean;
  sending: boolean;
  shippingAmount: number;
  total: number;
  priority: QuotePriority;
  articles: QuoteArticlePayload[];
}

export interface QuoteAcceptResponse {
  message: string;
}

export interface QuoteIvaResponse {
  message: string;
}

export interface QuoteAddArticlesPayload {
  totalAdded: number;
  articles: QuoteArticlePayload[];
}

export interface QuoteAddArticlesResponse {
  message: string;
}
import { http } from "./http";
import type {
  Quote,
  QuotesResponse,
  QuotesPagination,
  QuoteCreatePayload,
  QuoteUpdatePayload,
  QuoteAddArticlesPayload,
  QuoteAddArticlesResponse,
  QuoteDetail,
  QuotePriority,
  QuoteStatus,
  QuoteAcceptResponse,
    QuoteIvaResponse,
} from "../types/quote";



interface QuoteDetailDTO {
  id: number;
  quoteId: number;
  description: string;
  category: string;
  fabric_type: string;
  amount: number;
  unit_price: string;
  subtotal: string;
}

interface QuoteListItemDTO {
  id: number;
  registration_date: string;
  delivery_date: string;
  clientId: number;
  phone: string;
  iva: number;
  sending: number;
  shippingAmount: string | number;
  total: string;
  advance: string;
  balance_due: string;
  priority: string;
  status: number;
  client: string;
  detail: QuoteDetailDTO[];
}

interface QuotesResponseDTO {
  quotes: QuoteListItemDTO[];
  pagination: QuotesPagination;
}



interface QuoteByIdDetailDTO {
  id: number;
  quoteId: number;
  articleId: number;
  description: string;
  category: string;
  fabricId: number;
  fabric_type: string;
  amount: number;
  unit_price: string;
  subtotal: string;
}

interface QuoteByIdDTO {
  id: number;
  registration_date: string;
  delivery_date: string;
  advance_date: string | null;
  clientId: number;
  phone: string;
  iva: number;
  sending: number;
  shippingAmount: string | number;
  total: string;
  advance: string;
  balance_due: string;
  priority: string;
  status: number;
  client: string;
  settled_date?: string | null;
  details: QuoteByIdDetailDTO[];
}

interface MessageResponse {
  message: string;
}

function folioFromId(id: number): string {
  return `COT-${String(id).padStart(4, "0")}`;
}



function mapDetail(dto: QuoteDetailDTO): QuoteDetail {
  return {
    detailId: dto.id,
    articleId: null,
    description: dto.description,
    category: dto.category,
    fabricType: dto.fabric_type,
    fabricTypeId: null,
    amount: dto.amount,
    unitPrice: Number(dto.unit_price),
    subtotal: Number(dto.subtotal),
  };
}

function mapByIdDetail(dto: QuoteByIdDetailDTO): QuoteDetail {
  return {
    detailId: dto.id,
    articleId: dto.articleId,
    description: dto.description,
    category: dto.category,
    fabricType: dto.fabric_type,
    fabricTypeId: dto.fabricId,
    amount: dto.amount,
    unitPrice: Number(dto.unit_price),
    subtotal: Number(dto.subtotal),
  };
}

function mapQuoteListItem(dto: QuoteListItemDTO): Quote {
  return {
    id: dto.id,
    folio: folioFromId(dto.id),
    clientId: dto.clientId,
    clientName: dto.client,
    phone: dto.phone,
    deliveryDate: dto.delivery_date,
    iva: Number(dto.iva) === 1,
    sending: Number(dto.sending) === 1,
    shippingAmount: Number(dto.shippingAmount ?? 0),
    total: Number(dto.total),
    advance: Number(dto.advance),
    balanceDue: Number(dto.balance_due),
    priority: dto.priority.toUpperCase() as QuotePriority,
    status: dto.status as QuoteStatus,
    registrationDate: dto.registration_date,
    details: dto.detail.map(mapDetail),
  };
}

function mapQuoteById(dto: QuoteByIdDTO): Quote {
  return {
    id: dto.id,
    folio: folioFromId(dto.id),
    clientId: dto.clientId,
    clientName: dto.client,
    phone: dto.phone,
    deliveryDate: dto.delivery_date,
    iva: Number(dto.iva) === 1,
    sending: Number(dto.sending) === 1,
    shippingAmount: Number(dto.shippingAmount ?? 0),
    total: Number(dto.total),
    advance: Number(dto.advance),
    balanceDue: Number(dto.balance_due),
    priority: dto.priority.toUpperCase() as QuotePriority,
    status: dto.status as QuoteStatus,
    registrationDate: dto.registration_date,
    settledDate: dto.settled_date ?? undefined,
    details: dto.details.map(mapByIdDetail),
  };
}



function buildCreateBody(payload: QuoteCreatePayload) {
  return {
    clientId: payload.clientId,
    deliveryDate: payload.deliveryDate,
    IVA: payload.iva ? 1 : 0,
    sending: payload.sending ? 1 : 0,
    shippingAmount: payload.sending ? payload.shippingAmount : 0,
    total: payload.total,
    advance: payload.advance,
    priority: payload.priority.toLowerCase(),
    articles: payload.articles,
  };
}

function buildUpdateBody(payload: QuoteUpdatePayload) {
  return {
    deliveryDate: payload.deliveryDate,
    IVA: payload.iva ? 1 : 0,
    sending: payload.sending ? 1 : 0,
    shippingAmount: payload.sending ? payload.shippingAmount : 0,
    total: payload.total,
    priority: payload.priority.toLowerCase(),
    articles: payload.articles,
  };
}
function buildAddArticlesBody(payload: QuoteAddArticlesPayload) {
  return {
    totalAdded: payload.totalAdded,
    articles: payload.articles,
  };
}


export interface GetQuotesParams {
  search?: string;
  initialDate?: string;
  finalDate?: string;
  priority?: string;
  status?: number;
  page?: number;
}

export async function getQuotes(params: GetQuotesParams = {}): Promise<QuotesResponse> {
  const { data } = await http.get<QuotesResponseDTO>("/quote", { params });
  return {
    quotes: data.quotes.map(mapQuoteListItem),
    pagination: data.pagination,
  };
}

export async function getQuoteById(id: number): Promise<Quote> {
  const { data } = await http.get<QuoteByIdDTO>(`/quote/${id}`);
  return mapQuoteById(data);
}

export async function createQuote(payload: QuoteCreatePayload): Promise<MessageResponse> {
  const { data } = await http.post<MessageResponse>("/quote", buildCreateBody(payload));
  return data;
}

export async function updateQuote(id: number, payload: QuoteUpdatePayload): Promise<MessageResponse> {
  const { data } = await http.put<MessageResponse>(`/quote/${id}`, buildUpdateBody(payload));
  return data;
}

export async function addQuoteArticles(
  id: number,
  payload: QuoteAddArticlesPayload
): Promise<QuoteAddArticlesResponse> {
  const { data } = await http.put<QuoteAddArticlesResponse>(
    `/quote/${id}/articles`,
    buildAddArticlesBody(payload)
  );
  return data;
}

export async function getQuotePdf(id: number): Promise<Blob> {
  const { data } = await http.get<Blob>(`/quote/${id}/PDF`, {
    responseType: "blob",
  });
  return data;
}

export async function deleteQuote(id: number): Promise<MessageResponse> {
  const { data } = await http.delete<MessageResponse>(`/quote/${id}`);
  return data;
}

export async function acceptQuote(id: number): Promise<QuoteAcceptResponse> {
  const { data } = await http.patch<QuoteAcceptResponse>(`/quote/${id}/accept`);
  return data;
}

export async function addQuoteIva(id: number): Promise<QuoteIvaResponse> {
  const { data } = await http.patch<QuoteIvaResponse>(`/quote/${id}/iva`);
  return data;
}

export async function createQuoteShareLink(id: number): Promise<string> {
  const { data } = await http.post<{ url: string }>(`/quote/${id}/share-link`);
  return data.url;
}


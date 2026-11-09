export type SaleStatus = 0 | 1 | 2; 
export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA";

export interface SaleDetail {
  id: number;
  articleId: number;
  category: string;
  description: string;
  fabricTypeId: number;
  fabricType: string;
  amount: number;
  unitPrice: number;
  subtotal: number;
}

export interface SalePayment {
  id: number;
  saleId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  registrationDate: string;
  userId: number;
  status: 0 | 1; 
}

export interface Sale {
  folio: string;
  id: number;
  clientId: number;
  clientName: string;
  phone:string;
  deliveryDate: string;
  iva: boolean;
  sending: boolean;
  shippingAmount: number;
  total: number;
  advance: number;
  balanceDue: number;
  advanceDate: string | null;
  userId: number;
  registrationDate: string;
  status: SaleStatus;
}

export interface SaleWithDetails extends Sale {
  details: SaleDetail[];
  payments: SalePayment[];
}

export interface SalesPagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SalesResponse {
  sales: Sale[];
  pagination: SalesPagination;
}

export interface SalesFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: SaleStatus | "all";
}

export interface SaleArticlePayload {
  articleId: number;
  fabricType: number; 
  amount: number;
  unitPrice: number;
}

export interface CreateSalePayload {
  clientId: number;
  deliveryDate: string; 
  iva: boolean;
  sending: boolean;
  shippingAmount: number;
  articles: SaleArticlePayload[];
  advance?: number;
  paymentMethod?: PaymentMethod; 
}

export interface UpdateSalePayload {
  iva?: boolean;
  sending?: boolean;
  shippingAmount?: number;
}

export interface AddSalePaymentPayload {
  paymentMethod: PaymentMethod;
  amount: number;
}

export interface SaleActionResponse {
  message: string;
  sale: SaleWithDetails;
}


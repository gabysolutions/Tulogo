export const PaymentMethod = {
  EFECTIVO: "efectivo",
  TRANSFERENCIA: "transferencia",
  CHEQUE: "cheque",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface PaymentRef {
  id: number;
  type: PaymentSource;
}
export type PaymentSource = "quote" | "sale";

export interface QuotePayment {
  id: number;
  amount: number;
  paymentMethod: PaymentMethod;
  registrationDate: string;
}

export interface QuoteBalance {
  payments: QuotePayment[];
  total: number;
  advance: number;
  balanceDue: number;
}

export interface PaymentPayload {
  quoteId: number;
  amount: number;
  paymentMethod: string;
}

export interface Payment {
  id: number;
  type: PaymentSource;
  documentId: number;
  quoteId: number | null; 
  saleId: number | null;
  client_id: number;
  client_name: string;
  amount: number;
  payment_method: string;
  registration_date: string;
  register_user: string;
  status: number;
}

export interface PaymentPagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaymentsResponse {
  payments: Payment[];
  pagination: PaymentPagination;
}

export interface PaymentFilters {
  status?: number;
  initialDate?: string;
  finalDate?: string;
  type?: PaymentSource;
  documentId?: number;
  saleId?: number;
  quoteId?: number; 
  page?: number;
  order?: "asc" | "desc";
}
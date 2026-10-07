export const PaymentMethod = {
  EFECTIVO: "efectivo",
  TRANSFERENCIA: "transferencia",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];



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
  quoteId: number;
  amount: number;
  payment_method: PaymentMethod;
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
  quoteId?: number;
  page?: number;
}
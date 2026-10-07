import { http } from "./http";
import type {
  PaymentMethod,
  QuoteBalance,
  PaymentPayload,
  Payment,
  PaymentFilters,
  PaymentsResponse,
} from "../types/payment";

interface QuotePaymentDTO {
  id: number;
  amount: number;
  payment_method: string;
  registration_date: string;
}

interface QuoteBalanceDTO {
  payments: QuotePaymentDTO[];
  total: string;
  advance: string;
  balanceDue: string;
}

interface MessageResponse {
  message: string;
}

export async function getQuoteBalance(quoteId: number): Promise<QuoteBalance> {
  const { data } = await http.get<QuoteBalanceDTO>(`/quote/${quoteId}/balance`);
  return {
    payments: data.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentMethod: p.payment_method as PaymentMethod,
      registrationDate: p.registration_date,
    })),
    total: Number(data.total),
    advance: Number(data.advance),
    balanceDue: Number(data.balanceDue),
  };
}

export async function addPayment(payload: PaymentPayload): Promise<MessageResponse> {
  const { data } = await http.post<MessageResponse>("/payment", {
    quoteId: payload.quoteId,
    amount: payload.amount,
    paymentMethod: payload.paymentMethod,
  });
  return data;
}

async function getPayments(filters: PaymentFilters): Promise<PaymentsResponse> {
  
  const { data } = await http.get<PaymentsResponse>("/payment", { params: filters });
  return data;
}

async function getPaymentById(id: number): Promise<Payment> {
  const { data } = await http.get<Payment>(`/payment/${id}`);
  return data;
}

async function cancelPayment(id: number): Promise<MessageResponse> {
  const { data } = await http.delete<MessageResponse>(`/payment/${id}`);
  return data;
}

export const paymentService = {
  getQuoteBalance,
  addPayment,
  getPayments,
  getPaymentById,
  cancelPayment,
};
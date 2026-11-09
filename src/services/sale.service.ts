import { http } from "./http";
import type {
  AddSalePaymentPayload,
  CreateSalePayload,
  SaleActionResponse,
  SalesFilters,
  SalesResponse,
  SaleWithDetails,
  UpdateSalePayload,
} from "../types/sale";

function folioFromId(id: number): string {
  return `VENT-${String(id).padStart(4, "0")}`;
}

const withFolio = <T extends { id: number; folio?: string }>(sale: T): T & { folio: string } => ({
  ...sale,
  folio: sale.folio ?? folioFromId(sale.id),
});

export const getSalesService = async (filters: SalesFilters = {}): Promise<SalesResponse> => {
  const { page = 1, limit = 10, search, status } = filters;
  const { data } = await http.get<SalesResponse>("/sales", {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(status !== undefined && status !== "all" ? { status } : {}),
    },
  });
  return  { ...data, sales: data.sales.map(withFolio) };
};

export const getSaleByIdService = async (id: number): Promise<SaleWithDetails> => {
  const { data } = await http.get<SaleWithDetails>(`/sales/${id}`);
  return withFolio(data);
};

export const createSaleService = async (payload: CreateSalePayload): Promise<SaleWithDetails> => {
  const { data } = await http.post<SaleWithDetails>("/sales", payload);
  return data;
};

export const updateSaleService = async (
  id: number,
  payload: UpdateSalePayload
): Promise<SaleActionResponse> => {
  const { data } = await http.patch<SaleActionResponse>(`/sales/${id}`, payload);
  return data;
};

export const addSalePaymentService = async (
  id: number,
  payload: AddSalePaymentPayload
): Promise<SaleActionResponse> => {
  const { data } = await http.post<SaleActionResponse>(`/sales/${id}/payments`, payload);
  return data;
};

export const cancelSalePaymentService = async (
  saleId: number,
  paymentId: number
): Promise<SaleActionResponse> => {
  const { data } = await http.patch<SaleActionResponse>(
    `/sales/${saleId}/payments/${paymentId}/cancel`
  );
  return data;
};


export const getSalePDF = async (id: number): Promise<Blob> => {
  const { data } = await http.get<Blob>(`/sales/${id}/PDF`, { responseType: "blob" });
  return data;
};

export async function createSaleShareLink(id: number): Promise<string> {
  const { data } = await http.post<{ url: string }>(`/sales/${id}/share-link`);
  return data.url;
}


export const cancelSaleService = async (id: number): Promise<SaleActionResponse> => {
  const { data } = await http.patch<SaleActionResponse>(`/sales/${id}/cancel`);
  return data;
};
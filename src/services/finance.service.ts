import { http } from "./http";
import type {
  FinanceDashboard,
  CreateExpenseDto,
  ApiMessageResponse,
} from '../types/finance';

export const financeService = {
  
  getDashboard: async (date: string): Promise<FinanceDashboard> => {
    const { data } = await http.get<FinanceDashboard>('/finance/dashboard', {
      params: { date },
    });
    return data;
  },

  createExpense: async (body: CreateExpenseDto): Promise<ApiMessageResponse> => {
    const { data } = await http.post<ApiMessageResponse>('/expense', body);
    return data;
  },

  cancelExpense: async (id: number): Promise<ApiMessageResponse> => {
    const { data } = await http.patch<ApiMessageResponse>(`/expense/${id}`);
    return data;
  },
};
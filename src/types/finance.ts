import type { Payment, PaymentMethod } from "./payment";


export type { Payment, PaymentMethod };


export type ExpenseType =
  | "servicio"
  | "renta"
  | "material"
  | "transporte"
  | "publicidad"
  | "mantenimiento";

export interface Expense {
  id: number;
  amount: number;
  type: ExpenseType;
  payment_method: PaymentMethod;
  registration_date: string;
  register_user: string;
  status: number;
  description?: string;
}

export interface MonthlyExpenses {
  rent: number;
  material: number;
  transport: number;
  publicity: number;
  maintenance: number;
  service: number;
}


export interface CurrentMovement {
  id: number;
  amount: number;
  payment_method: PaymentMethod;
  registration_date: string;
  register_user: string;
  description: string;
}

export interface CurrentDay {
  date: string; 
  currentMovements: CurrentMovement[]; 
  paymentsTotal: number;
  expensesTotal: number;
  utility: number;
}

export interface FinanceDashboard {
  paymentAmount: number;
  expenseAmount: number;
  utility: number;
  payments: Payment[];
  expenses: Expense[];
  monthlyExpenses: MonthlyExpenses;
  currentDay: CurrentDay;
}

export interface CreateExpenseDto {
  amount: number;
  type: ExpenseType;
  paymentMethod: PaymentMethod;
}

export interface ApiMessageResponse {
  message: string;
}
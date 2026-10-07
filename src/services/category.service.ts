import { http } from "./http";
import type { Category, CategoryPayload } from "../types/inventory";

interface MessageResponse {
  message: string;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await http.get<Category[]>("/category");
  return data;
}

export async function getCategoryById(id: number): Promise<Category> {
  const { data } = await http.get<Category>(`/category/${id}`);
  return data;
}

export async function createCategory(payload: CategoryPayload): Promise<MessageResponse> {
  const { data } = await http.post<MessageResponse>("/category", payload);
  return data;
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<MessageResponse> {
  const { data } = await http.put<MessageResponse>(`/category/${id}`, payload);
  return data;
}
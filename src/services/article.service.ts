import { http } from "./http";
import type { ArticlesResponse, ArticlePayload,ArticleActionResponse } from "../types/inventory";

interface MessageResponse {
  message: string;
}

export interface GetArticlesParams {
  category?: number;
  search?: string;
  page?: number;
}

export async function getArticles(params: GetArticlesParams = {}): Promise<ArticlesResponse> {
  const { data } = await http.get<ArticlesResponse>("/article", { params });
  return data;
}

export async function createArticle(payload: ArticlePayload): Promise<MessageResponse> {
  const { data } = await http.post<MessageResponse>("/article", payload);
  return data;
}

export async function updateArticle(id: number, payload: ArticlePayload): Promise<MessageResponse> {
  const { data } = await http.put<MessageResponse>(`/article/${id}`, payload);
  return data;
}

export const deleteArticle = async (id: number): Promise<ArticleActionResponse> => {
  const { data } = await http.delete<ArticleActionResponse>(`/article/${id}`);
  return data;
};

export const activateArticle = async (id: number): Promise<ArticleActionResponse> => {
  const { data } = await http.patch<ArticleActionResponse>(`/article/${id}`, {});
  return data;
};
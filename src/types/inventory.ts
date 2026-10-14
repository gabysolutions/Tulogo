export interface Category {
  id: number;
  description: string;
}

export interface CategoryPayload {
  description: string;
}

export interface FabricType {
  id: number;
  description: string;
  status: number;
}

export interface FabricTypePayload {
  description: string;
}

export interface ArticleListItem {
  id: number;
  description: string;
  category: string; 
  price: string;
  cost: string;
  status: number;
  satProductCode: string;
  satUnitCode: string;
}

export interface ArticlesPagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ArticlesResponse {
  articles: ArticleListItem[];
  pagination: ArticlesPagination;
}

export interface ArticlePayload {
  category: number; 
  description: string;
  price: number;
  cost: number;
  satProductCode: string;
  satUnitCode: string;
}

interface MessageResponse {
  message: string;
}

export type { MessageResponse };

export interface FabricTypeActionResponse {
  message: string;
}

export interface ArticleActionResponse {
  message: string;
}
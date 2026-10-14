export const DETAIL_GENDERS = ["M", "F"] as const;
export type DetailGender = (typeof DETAIL_GENDERS)[number];

export interface AddOrderLinkResponse {
  token: string;
}

export interface MessageResponse {
  message: string;
}

export interface OrderDetailItemPayload {
  articleId: number;
  nickname: string;
  number: string; 
  size: string;
  gender: DetailGender;
  observation: string;
}

export interface AddOrderDetailsPayload {
  details: OrderDetailItemPayload[];
}

export interface PublicOrderArticle {
  articleId: number;
  article: string;
  category: string;
  fabricType: string;
  designImg: string;
  amount: number;            
  piecesRegistered: number;  
}

export interface PublicOrder {
  id: number;
  client: string;
  articles: PublicOrderArticle[];
  expiresAt: string; 
}

export interface ArticleOption {
  id: number;
  name: string;
}

export interface GenderOption {
  value: DetailGender;
  label: string;
}

export interface DraftPiece {
  uid: string;
  articleId: number | null;
  nickname: string;
  number: string;
  size: string;
  gender: DetailGender;
  observation: string;
  sizeFlagged?: boolean;
}
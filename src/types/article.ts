export const ArticleCategory = {
  BASQUETBOL: "BASQUETBOL",
  FUTBOL: "FUTBOL",
  VOLEIBOL: "VOLEIBOL",
  PLAYERAS: "PLAYERAS",
  BEISBOL: "BEISBOL",
  ATLETISMO: "ATLETISMO",
  PESCA: "PESCA",
} as const;

export type ArticleCategory =
  (typeof ArticleCategory)[keyof typeof ArticleCategory];

export interface Article {
  id: number;
  category: ArticleCategory;
  description: string;
  price: number;
  cost: number;
  status: number;
  satProductCode: string;
  satUnitCode: string;
}

export interface ArticleActionResponse {
  message: string;
}



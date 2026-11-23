import { DETAIL_GENDERS, type DetailGender } from "../types/orderLink";


export const PIECE_SIZES: string[] = ["2", "3", "4", "6", "8", "10","12","14","16", "XCH","CH","M", "G","XL","2XL", "3XL","4XL","5XL","6XL"];
export const GENDER_LABELS: Record<DetailGender, string> = {
  Dama: "Dama",
  Caballero: "Caballero",
  Unisex: "Unisex",
};

export const GENDER_OPTIONS = DETAIL_GENDERS.map((value) => ({
  value,
  label: GENDER_LABELS[value],
}));
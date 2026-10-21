import { DETAIL_GENDERS, type DetailGender } from "../types/orderLink";


export const PIECE_SIZES: string[] = ["XS", "S", "M", "L", "XL", "XXL"];

export const GENDER_LABELS: Record<DetailGender, string> = {
  M: "Masculino",
  F: "Femenino",
};

export const GENDER_OPTIONS = DETAIL_GENDERS.map((value) => ({
  value,
  label: GENDER_LABELS[value],
}));
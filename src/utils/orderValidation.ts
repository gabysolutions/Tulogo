import { CONFIG_STAGE_ID, countPieces, type Order } from "../types/order";

export function isConfigComplete(order: Order): boolean {
  if (order.numberPieces <= 0) return true;
  if (countPieces(order.details) < order.numberPieces) return false;

  return order.details.every((d) => Boolean(d.size));
}

export const missingPiecesCount = (order: Order) =>
  Math.max(order.numberPieces - countPieces(order.details), 0);

export function canAdvanceStage(order: Order): boolean {
  if (order.status !== CONFIG_STAGE_ID) return true;
  return isConfigComplete(order);
}
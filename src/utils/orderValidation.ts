import type { Order } from "../types/order";
import { CONFIG_STAGE_ID } from "../types/order";


export function isConfigComplete(order: Order): boolean {
  if (order.numberPieces <= 0) return true;
  if (order.details.length < order.numberPieces) return false;

  return order.details.every((d) => d.nickname.trim() !== "" && Boolean(d.size) && Boolean(d.gender));
}

export function missingPiecesCount(order: Order): number {
  return Math.max(0, order.numberPieces - order.details.length);
}


export function canAdvanceStage(order: Order): boolean {
  if (order.status !== CONFIG_STAGE_ID) return true;
  return isConfigComplete(order);
}
import type { UserPrivilege } from "../types/user";

export const PERMISSIONS = {
  QUOTATIONS: "QUOTATION_PERMISSION",
  CALENDAR: "CALENDAR_PERMISSION",
  DESIGN: "DESIGN_PERMISSION",
  PRODUCTION: "PRODUCTION_PERMISSION",
  ORDERS: "ORDERS_PERMISSION",
  CLIENTS: "CLIENTS_PERMISSION",
  INVENTORY: "INVENTORY_PERMISSION",
  FINANCE: "FINANCE_PERMISSION",
  USERS: "USERS_PERMISSION",
  CONFIGURATION: "CONFIGURATION_PERMISSION",
  INVOICING: "INVOICING_PERMISSION",
  PAYMENTS: "PAYMENTS_PERMISSION",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];


export const getProductionStatuses = (privileges: UserPrivilege[]): number[] =>
  privileges
    .find((p) => p.key === PERMISSIONS.PRODUCTION)
    ?.detail?.map((d) => d.status) ?? [];


export const canMoveFromStage = (allowed: Iterable<number>, status: number): boolean =>
  new Set(allowed).has(status);
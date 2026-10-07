export type UserRole =
  | "administrador"
  | "ventas"
  | "diseñador"
  | "produccion"
  | "empaquetado";

export interface User {
  id: number;
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  role: UserRole;
  username: string;
  status: number;

  fullName?: string;
}

export interface UserTypeBreakdown {
  adminUsers: number;
  saleUsers: number;
  designerUsers: number;
  productionUsers: number;
  packingUsers: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  totalByUserType: UserTypeBreakdown;
}

export interface CreateUserPayload {
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  role: UserRole;
  username: string;
  password: string;
}

export interface CreateUserResponse {
  message: string;
  userId: number;
}

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "administrador", label: "Administrador" },
  { value: "ventas", label: "Ventas" },
  { value: "diseñador", label: "Diseñador" },
  { value: "produccion", label: "Producción" },
  { value: "empaquetado", label: "Empaquetado" },
];

export interface UpdateUserPayload {
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  role: UserRole;
  username: string;
  password?: string;
}

export interface SimpleMessageResponse {
  message: string;
}

export interface UserPrivilege {
  id: number;
  description: string;
  key: string;
}
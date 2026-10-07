import type { User, UserRole } from "./user";

export type AuthUser = User & {
  permissions: string[];
};

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (perm: string) => boolean;
  getToken: () => string | null;
  refreshPermissions: () => Promise<void>;
}
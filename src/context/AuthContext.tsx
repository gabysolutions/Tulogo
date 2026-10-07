import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginService } from "../services/auth.service";
import { getUserPrivilegesService } from "../services/user.service";
import type { UserRole } from "../types/user";
import type { AuthContextType, AuthUser } from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

const LS_USER = "vf_user";
const LS_TOKEN = "vf_token";

function clearAuthStorage() {
  localStorage.removeItem(LS_USER);
  localStorage.removeItem(LS_TOKEN);
  sessionStorage.removeItem(LS_USER);
  sessionStorage.removeItem(LS_TOKEN);
}

function readAuthFromStorage() {
  const ssUser = sessionStorage.getItem(LS_USER);
  const ssToken = sessionStorage.getItem(LS_TOKEN);
  const lsUser = localStorage.getItem(LS_USER);
  const lsToken = localStorage.getItem(LS_TOKEN);

  return {
    rawUser: ssUser || lsUser,
    rawToken: ssToken || lsToken,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // arranca en true mientras se lee el storage

  const getToken = () =>
    token || sessionStorage.getItem(LS_TOKEN) || localStorage.getItem(LS_TOKEN);

  const persistUser = (nextUser: AuthUser, remember: boolean) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(LS_USER, JSON.stringify(nextUser));
  };

  const refreshPermissions = async () => {
    const currentToken = getToken();
    if (!currentToken || !user) return;

    try {
      const privileges = await getUserPrivilegesService(user.id);
      const perms = privileges.map((p) => p.key);

      const nextUser: AuthUser = { ...user, permissions: perms };
      setUser(nextUser);

      const inSession = !!sessionStorage.getItem(LS_TOKEN);
      persistUser(nextUser, !inSession);
    } catch {
      // si falla, se conservan los permisos que ya había
    }
  };

  // Rehidratar sesión al cargar la app
  useEffect(() => {
    const { rawUser, rawToken } = readAuthFromStorage();

    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser) as AuthUser);
      } catch {
        clearAuthStorage();
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }
    }

    if (rawToken) {
      setToken(rawToken);
    }

    setLoading(false);
  }, []);

  // Refresca permisos cuando cambia el usuario logueado
  useEffect(() => {
    if (!user?.id) return;
    if (!getToken()) return;

    refreshPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

  const login = async (username: string, password: string) => {
    const remember = true; // si quieres exponer "recordarme", agrega un parámetro extra a login()
    const res = await loginService(username, password);

    clearAuthStorage();

    const nextUser: AuthUser = { ...res.user, permissions: [] };
    setUser(nextUser);
    setToken(res.token);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(LS_USER, JSON.stringify(nextUser));
    storage.setItem(LS_TOKEN, res.token);

    try {
      const privileges = await getUserPrivilegesService(res.user.id);
      const perms = privileges.map((p) => p.key);
      const withPerms: AuthUser = { ...nextUser, permissions: perms };

      setUser(withPerms);
      storage.setItem(LS_USER, JSON.stringify(withPerms));
    } catch {
      // el usuario queda logueado aunque falle la carga de permisos
    }
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    setToken(null);
  };

  const hasRole = (role: UserRole) => user?.role === role;
  const hasPermission = (perm: string) => !!user?.permissions?.includes(perm);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user && !!getToken(),
      login,
      logout,
      hasRole,
      hasPermission,
      getToken,
      refreshPermissions,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Palette,
  Factory,
  Wallet,
  Package,
  Boxes,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CalendarSearch,
  FileText,
  LogOut,
  Users,Banknote
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { PERMISSIONS, type PermissionKey } from "../constants/permissions";
import { ROLE_OPTIONS } from "../types/user";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  perm?: PermissionKey; 
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Cotizaciones", to: "/cotizaciones", icon: ClipboardList, perm: PERMISSIONS.QUOTATIONS },
  { label: "Calendario", to: "/calendario", icon: CalendarSearch, perm: PERMISSIONS.CALENDAR },
  { label: "Diseños", to: "/diseños", icon: Palette, perm: PERMISSIONS.DESIGN },
  { label: "Producción", to: "/produccion", icon: Factory, perm: PERMISSIONS.PRODUCTION },
  { label: "Pedidos", to: "/pedidos", icon: Package, perm: PERMISSIONS.ORDERS },
  { label: "Clientes", to: "/clientes", icon: Users, perm: PERMISSIONS.CLIENTS },
  { label: "Inventario", to: "/inventario", icon: Boxes, perm: PERMISSIONS.INVENTORY },
  { label: "Pagos", to: "/pagos", icon: Banknote, perm: PERMISSIONS.PAYMENTS },
  { label: "Finanzas", to: "/finanzas", icon: Wallet, perm: PERMISSIONS.FINANCE },
  { label: "Facturación", to: "/facturacion", icon: FileText, perm: PERMISSIONS.INVOICING },
  { label: "Usuarios", to: "/usuarios", icon: UserCog, perm: PERMISSIONS.USERS },
  { label: "Configuración", to: "/configuracion", icon: Settings, perm: PERMISSIONS.CONFIGURATION },
];

function getInitials(name: string, paternalLastName: string) {
  const first = name?.trim()?.[0] ?? "";
  const second = paternalLastName?.trim()?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

function getRoleLabel(role?: string) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? "";
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { user, hasPermission, logout } = useAuth();

  const isActive = (path: string) => currentPath === path;

  const visibleNavItems = navItems.filter(
    (item) => !item.perm || hasPermission(item.perm)
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user ? getInitials(user.name, user.paternal_last_name) : "";
  const roleLabel = getRoleLabel(user?.role);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-slate-900 shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:text-blue-600 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-black/10 shadow-2xl shadow-black/5 transition-all duration-300 ease-out lg:translate-x-0 ${
          collapsed ? "w-20" : "w-69"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#f2f2f2" }}
      >
        {/* Brand */}
        <div
          className={`flex h-20 items-center gap-3 border-b border-black/10 transition-all duration-300 ${
            collapsed ? "justify-center px-3" : "px-5"
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center transition-transform duration-300 hover:rotate-6 hover:scale-110">
            <img className="h-12 w-12" src="src\assets\logo1.png" alt="Logo" />
          </div>

          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            <span className="whitespace-nowrap bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-500 bg-clip-text text-transparent font-bold">
              Tu Logo en Todo
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium text-black/50">
              Producción Y Gestión
            </span>
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="ml-auto hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-black transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white lg:flex"
              aria-label="Colapsar menú"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-black transition-colors hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-24 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-[#f2f2f2] text-black shadow-md transition-all duration-200 hover:scale-110 hover:text-blue-600 lg:flex"
            aria-label="Expandir menú"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <ul className="space-y-1.5">
            {visibleNavItems.map((item) => {
              const active = isActive(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25"
                        : "text-black hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:shadow-md hover:shadow-blue-500/25"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <item.icon
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        active ? "text-white" : "text-black group-hover:text-white"
                      }`}
                    />
                    <span
                      className={`whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                        active ? "text-white" : "text-black group-hover:text-white"
                      } ${
                        collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>

                    {active && (
                      <span className="absolute right-3 h-2 w-2 rounded-full bg-white/80" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User mini profile + logout */}
        <div className="border-t border-black/10 p-4">
          <div
            className={`flex items-center gap-3 rounded-xl bg-black/5 p-2 transition-all duration-300 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {initials}
            </div>
            <div
              className={`flex flex-col overflow-hidden transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}
            >
              <span className="whitespace-nowrap text-sm font-medium text-black">
                {roleLabel}
              </span>
              <span className="whitespace-nowrap text-xs text-black/50">
                en línea
              </span>
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-black/60 transition-colors hover:bg-red-500 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="mt-2 flex h-9 w-full items-center justify-center rounded-xl text-black/60 transition-colors hover:bg-red-500 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Spacer for desktop */}
      <div
        className={`hidden shrink-0 transition-all duration-300 ease-out lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      />
    </>
  );
}
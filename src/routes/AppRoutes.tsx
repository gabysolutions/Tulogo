import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Clients from "../pages/clients/Clients";
import ProtectedRoute from "./ProtectedRoute";
import { PERMISSIONS } from "../constants/permissions";
import { AppLayout } from "../layouts/AppLayout";
import Quotes from "../pages/quotes/Quotes";
import Inventory from "../pages/inventory/Inventory";
import Finances from "../pages/finances/Finances";
import Design from "../pages/design/Design";
import DesignDetailPage from "../components/designs/DesignDetailPage";
import Invoices from "../pages/invoices/Invoices";
import Config from "../pages/config/config";
import Orders from "../pages/orders/Orders";
import OrderDetailPage from "../components/orders/OrderDetailPage";
import Production from "../pages/production/Production";
import Users from "../pages/users/Users";
import Calendar from "../pages/calendar/calendar";
import Unauthorized from "../pages/errors/Unauthorized";
import RequirePermission from "./RequirePermission";
import ProductionDetail from "../components/production/ProductionDetail";
import HistoryPayments from "../pages/payments/HistoryPayments";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/no-autorizado" element={<Unauthorized />} />

            <Route element={<RequirePermission perm={PERMISSIONS.CLIENTS} />}>
              <Route path="/clientes" element={<Clients />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.QUOTATIONS} />}>
              <Route path="/cotizaciones" element={<Quotes />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.INVENTORY} />}>
              <Route path="/inventario" element={<Inventory />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.FINANCE} />}>
              <Route path="/finanzas" element={<Finances />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.DESIGN} />}>
              <Route path="/diseños" element={<Design />} />
              <Route path="/diseños/:id" element={<DesignDetailPage />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.INVOICING} />}>
              <Route path="/facturacion" element={<Invoices />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.CONFIGURATION} />}>
              <Route path="/configuracion" element={<Config />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.ORDERS} />}>
              <Route path="/pedidos" element={<Orders />} />
              <Route path="/pedidos/:id" element={<OrderDetailPage />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.PRODUCTION} />}>
              <Route path="/produccion" element={<Production />} />
              <Route path="/production/:id" element={<ProductionDetail />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.USERS} />}>
              <Route path="/usuarios" element={<Users />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.CALENDAR} />}>
              <Route path="/calendario" element={<Calendar />} />
            </Route>

            <Route element={<RequirePermission perm={PERMISSIONS.PAYMENTS} />}>
              <Route path="/pagos" element={<HistoryPayments />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
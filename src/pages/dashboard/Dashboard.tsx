// pages/dashboard/Dashboard.tsx
import { useAuth } from "../../context/AuthContext";

import AdminDashboard from "./AdminDashboard";
import SalesDashboard from "./SalesDashboard";
import DesignerDashboard from "./DesignerDashboard";
import ProductionDashboard from "./ProductionDashboard";
import PackingDashboard from "./PackingDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case "administrador":
      return <AdminDashboard />;
    case "ventas":
      return <SalesDashboard />;
    case "diseñador":
      return <DesignerDashboard />;
    case "produccion":
      return <ProductionDashboard />;
    case "empaquetado":
      return <PackingDashboard />;
    default:
      return null; // o un fallback genérico
  }
}
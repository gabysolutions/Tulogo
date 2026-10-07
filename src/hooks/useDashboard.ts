import { useEffect, useState } from "react";
import { getDashboardService } from "../services/dashboard.service";
import type { DashboardData } from "../types/dashboard";

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await getDashboardService();
        if (active) setData(result);
      } catch (err) {
        if (active) setError("No se pudo cargar el dashboard");
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
};
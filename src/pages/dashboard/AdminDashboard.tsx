import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardStats from "../../components/dashboard/DashboardStats";
import ProductionTimeline from "../../components/dashboard/ProductionTimeline";
import RecentActivity from "../../components/dashboard/RecentActivity";
import Loader from "../../components/Loader";

import { useDashboard } from "../../hooks/useDashboard";

export default function Dashboard() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-500">{error ?? "Error al cargar"}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full px-6 py-8">
      <div className="flex flex-col gap-4 bg-gray-50">
        <DashboardHeader />

        <DashboardStats stats={data.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ProductionTimeline timeline={data.productionTimeline} />
          </div>

          <RecentActivity activity={data.recentActivity} />
        </div>
      </div>
    </main>
  );
}
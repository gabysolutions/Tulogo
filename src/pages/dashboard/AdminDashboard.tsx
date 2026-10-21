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
    <main className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 bg-gray-50">
        <DashboardHeader />

        <DashboardStats stats={data.stats} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2">
            <ProductionTimeline timeline={data.productionTimeline} />
          </div>

          <div className="min-w-0">
            <RecentActivity activity={data.recentActivity} />
          </div>
        </div>
      </div>
    </main>
  );
}
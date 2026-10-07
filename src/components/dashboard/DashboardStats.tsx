
import DashboardStatCard from "../dashboard/DashboardStatCard";
import type { DashboardStat } from "../../types/dashboard";


interface DashboardStatsProps {
  stats: DashboardStat[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <DashboardStatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
}
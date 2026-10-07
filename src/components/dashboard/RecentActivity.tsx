import clsx from "clsx";
import type { ActivityColor, RecentActivityItem } from "../../types/dashboard";

interface Props {
  activity: RecentActivityItem[];
}

const DOT_COLORS: Record<ActivityColor, string> = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  orange: "bg-orange-500",
  red: "bg-red-600",
  purple: "bg-purple-600",
  yellow: "bg-yellow-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  indigo: "bg-indigo-600",
  gray: "bg-gray-400",
};

export default function RecentActivity({ activity }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold">Actividad reciente</h3>

      {activity.length === 0 ? (
        <p className="text-sm text-gray-400">Sin actividad reciente</p>
      ) : (
        <div className="space-y-4">
          {activity.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div
                className={clsx(
                  "mt-1 h-3 w-3 shrink-0 rounded-full",
                  DOT_COLORS[item.color] ?? "bg-gray-400"
                )}
              />

              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
                <p className="mt-1 text-[11px] text-gray-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
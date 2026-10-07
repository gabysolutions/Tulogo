import type { Priority } from "../../types/order";

interface Props {
  priority: Priority;
}

const priorityStyles: Record<Priority, string> = {
  alta: "bg-red-100 text-red-700 border-red-200",
  media: "bg-amber-100 text-amber-700 border-amber-200",
  baja: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function PriorityBadge({ priority }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}
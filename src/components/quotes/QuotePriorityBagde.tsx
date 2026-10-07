import {
  QuotePriority,
} from "../../types/quote";

interface Props {
  priority: QuotePriority;
}

export default function QuotePriorityBadge({
  priority,
}: Props) {
  if (priority === QuotePriority.ALTA) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
        Alta
      </span>
    );
  }

  if (priority === QuotePriority.MEDIA) {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
        Media
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
      Baja
    </span>
  );
}

 
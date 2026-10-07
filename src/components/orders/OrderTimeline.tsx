import type { OrderMovement } from "../../types/order";
import { getStage } from "../../types/order";

interface Props {
  movements: OrderMovement[];
}

export default function OrderTimeline({ movements }: Props) {
  return (
    <div className="space-y-4">
      {movements.map((item) => {
        const stage = getStage(item.status);

        return (
          <div key={item.id} className="flex gap-3">
            <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />

            <div>
              <p className="text-sm font-medium">{stage.label}</p>
              <p className="text-xs text-gray-500">
                {item.user} · {item.registrationDate}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
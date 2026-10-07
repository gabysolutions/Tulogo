import { STAGES } from "../../types/order";

interface Props {
 status: number;
}

export default function SegmentedStages({ status }: Props) {
  return (
    <div className="flex items-center gap-1">
      {STAGES.map((stage) => {
        const completed = stage.id < status;
        const current = stage.id === status;
        const delivered = status === 10;

        let classes =
          "h-2 w-6 rounded-full transition-all duration-300 bg-gray-200";

        if (completed) {
          classes = "h-2 w-6 rounded-full bg-blue-500";
        }

        if (current) {
          classes = "h-2 w-6 rounded-full bg-blue-600";
        }

        if (delivered) {
          classes = "h-2 w-6 rounded-full bg-green-500";
        }

        return (
          <div
            key={stage.id}
            title={stage.label}
            className={classes}
          />
        );
      })}
    </div>
  );
}
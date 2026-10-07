import { useState } from "react";
import { Check } from "lucide-react";
import { STAGES, getStage } from "../../types/order";
import { progressPercent } from "../../utils/productionUtils";

interface Props {
  status: number;
  completed?: boolean;
  className?: string;
}

export function ProgressTrack({ status, completed = false, className = "" }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const currentStage = getStage(status);
  const percent = completed ? 100 : progressPercent(status);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Progreso
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          {status}/{STAGES.length} · {currentStage.label}
        </span>
      </div>

      <div className="relative pt-1">
        <div className="absolute left-0 right-0 top-[11px] h-0.5 rounded-full bg-slate-200" />
        <div
          className="absolute left-0 top-[11px] h-0.5 rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />

        <ol className="relative flex items-start justify-between">
          {STAGES.map((stage) => {
            const isDone = completed ? true : stage.id < status;
            const isCurrent = !completed && stage.id === status;

            return (
              <li key={stage.id} className="relative flex min-w-0 flex-col items-center gap-1.5">
                <button
                  type="button"
                  onMouseEnter={() => setHovered(stage.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`relative z-10 flex size-6 items-center justify-center rounded-full border transition-all duration-300 ${
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isCurrent
                      ? "border-blue-500 bg-blue-500 text-white ring-4 ring-blue-100"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {isDone ? (
                    <Check className="size-3" strokeWidth={3} />
                  ) : (
                    <span className="text-[9px] font-bold">{stage.id}</span>
                  )}
                </button>

                {hovered === stage.id && (
                  <div className="absolute -top-8 z-20 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-white shadow-md">
                    {stage.id}. {stage.label}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
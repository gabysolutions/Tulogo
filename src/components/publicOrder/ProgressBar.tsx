export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = value > max;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-foreground">
          <span className="font-display text-2xl">{value}</span> de {max} piezas
        </span>
        {over && <span className="text-xs font-medium text-warning">Excede lo esperado</span>}
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label="Progreso de captura"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? "bg-warning" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
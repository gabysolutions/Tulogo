import { Check } from "lucide-react";
import type { ArticleOption } from "../../types/orderLink";

export function ArticleProgress({ articles }: { articles: ArticleOption[] }) {
  if (articles.length < 2) return null;

  return (
    <ul className="mb-4 grid gap-2 sm:grid-cols-2" aria-label="Avance por artículo">
      {articles.map((a) => {
        const over = a.used > a.quota;
        const complete = a.used === a.quota;
        const pct = a.quota > 0 ? Math.min(100, (a.used / a.quota) * 100) : 100;

        return (
          <li
            key={a.id}
            className={`rounded-xl border bg-card px-3 py-2.5 ${complete ? "border-success/40" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-foreground">{a.name}</span>
              {over ? (
                <span className="shrink-0 text-xs font-medium text-warning">Excede</span>
              ) : complete ? (
                <Check className="h-4 w-4 shrink-0 text-success" aria-label="Completo" />
              ) : (
                <span className="shrink-0 font-display text-lg leading-none text-foreground">
                  {a.used}
                  <span className="text-muted-foreground">/{a.quota}</span>
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  over ? "bg-warning" : complete ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
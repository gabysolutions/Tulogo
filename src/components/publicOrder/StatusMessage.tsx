import type { ReactNode } from "react";

type Variant = "success" | "error" | "warning";

export function StatusMessage({
  variant,
  icon,
  title,
  children,
}: {
  variant: Variant;
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  const ring = {
    success: "bg-success/15 text-success",
    error: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning",
  }[variant];
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-card">
        <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${ring}`}>
          {icon}
        </div>
        <h1 className="font-display text-3xl uppercase tracking-wide text-foreground">{title}</h1>
        {children && <div className="mt-3 text-base text-muted-foreground">{children}</div>}
      </div>
    </main>
  );
}
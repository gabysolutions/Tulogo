import { Users } from "lucide-react";

export function ClientEmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <Users className="size-8 text-muted-foreground mb-3" />
      <p className="text-sm font-medium">Aún no hay clientes</p>
      <p className="text-xs text-muted-foreground mt-1">
        Registra tu primer cliente para empezar a llevar su historial.
      </p>
    </div>
  );
}
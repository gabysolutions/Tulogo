interface ClientStatusBadgeProps {
  status: number;
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  1: { label: "Activo", className: "bg-emerald-500/10 text-emerald-600" },
  0: { label: "Inactivo", className: "bg-red-500/10 text-red-600" },
};

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const config = STATUS_MAP[status] ?? STATUS_MAP[0];

  return (
    <span className={`inline-flex items-center rounded-full px-4 py-2 text-[14px] font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}


interface StatusBadgeProps {
  status: "Activo" | "Inactivo";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === "Activo";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isActive ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {status}
    </span>
  );
}
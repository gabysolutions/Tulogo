import { ShieldCheck } from "lucide-react";
import { ROLE_OPTIONS } from "../../types/user";
import type { User } from "../../types/user";

interface Props {
  users: User[];
}

export default function RoleSummaryCards({ users }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
      {ROLE_OPTIONS.map(({ value, label }) => (
        <div key={value} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="size-8 rounded-lg bg-blue-100 text-blue grid place-items-center mb-2">
            <ShieldCheck className="size-4 text-blue-700" />
          </div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Rol</p>
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {users.filter((u) => u.role === value).length} usuarios
          </p>
        </div>
      ))}
    </div>
  );
}
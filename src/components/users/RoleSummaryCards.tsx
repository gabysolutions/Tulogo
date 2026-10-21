import { ShieldCheck } from "lucide-react";
import { ROLE_OPTIONS } from "../../types/user";
import type { User } from "../../types/user";

interface Props {
  users: User[];
}

export default function RoleSummaryCards({ users }: Props) {
  return (
    <div
      className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5
                 [&>*:last-child:nth-child(odd)]:col-span-2
                 sm:[&>*:last-child:nth-child(odd)]:col-span-1"
    >
      {ROLE_OPTIONS.map(({ value, label }) => {
        const count = users.filter((u) => u.role === value).length;

        return (
          <div
            key={value}
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 sm:p-4"
          >
            <div className="mb-2 grid size-8 place-items-center rounded-lg bg-blue-100">
              <ShieldCheck className="size-4 text-blue-700" />
            </div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Rol</p>
            <p className="truncate text-sm font-semibold">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {count} {count === 1 ? "usuario" : "usuarios"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
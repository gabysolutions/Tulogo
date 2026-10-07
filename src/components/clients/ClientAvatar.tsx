import type { Client } from "../../types/client";
import { getInitials } from "../../utils/client-helpers";

interface ClientAvatarProps {
  client: Client;
}

export function ClientAvatar({ client }: ClientAvatarProps) {
  return (
    <div className="size-12 rounded-xl bg-gradient-to-br from-primary bg-blue-600 grid place-items-center text-white font-semibold shrink-0">
      {getInitials(client)}
    </div>
  );
}
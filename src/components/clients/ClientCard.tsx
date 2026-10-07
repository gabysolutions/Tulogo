import { Pencil, MapPin } from "lucide-react";
import type { Client } from "../../types/client";

import { ClientAvatar } from "./ClientAvatar";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { ClientContactInfo } from "./ClientContactInfo";
import { getFullName } from "../../utils/client-helpers";

interface ClientCardProps {
  client: Client;
  onEdit?: (client: Client) => void;
  onManageAddresses?: (client: Client) => void;
}

export function ClientCard({ client, onEdit, onManageAddresses }: ClientCardProps) {
  return (
    <div className="">
    <article
      onClick={() => onEdit?.(client)}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow cursor-pointer"
    >
      <div className=" flex items-start gap-4 ">
        <ClientAvatar client={client} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {getFullName(client)}
          </h3>
          {client.rfc && (
            <p className="text-xs text-gray-500 text-muted-foreground truncate">RFC: {client.rfc}</p>
          )}
        </div>
        <ClientStatusBadge status={client.status} />
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onManageAddresses?.(client);
            }}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Direcciones del cliente"
          >
            <MapPin className="size-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(client);
            }}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Editar cliente"
          >
            <Pencil className="size-4" />
          </button>
        </div>
      </div>

      <ClientContactInfo client={client} />

      
    </article>
    </div>
  );
}
import type { Client } from "../../types/client";
import { ClientCard } from "./ClientCard";
import { ClientEmptyState } from "./ClientEmptyState";

interface ClientGridProps {
  clients: Client[];
  onEditClient?: (client: Client) => void;
  onManageAddresses?: (client: Client) => void;
}

export function ClientGrid({ clients, onEditClient, onManageAddresses }: ClientGridProps) {
  if (clients.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <ClientEmptyState />
      </div>
    );
  }

  return (
    <div className=" grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {clients.map((client) => (
        <ClientCard   key={client.id} client={client} onEdit={onEditClient} onManageAddresses={onManageAddresses}  />
      ))}
    </div>
  );
}
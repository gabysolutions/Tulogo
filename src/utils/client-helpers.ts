import type { Client, ClientAddress } from "../types/client";

export function buildFullName(...parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter((p) => p && p !== ".")
    .join(" ");
}

export function getFullName(
  client: Pick<Client, "name" | "paternal_last_name" | "maternal_last_name" | "fullName">
): string {
  if (client.fullName) return client.fullName;
  return buildFullName(client.name, client.paternal_last_name, client.maternal_last_name);
}

export function getFullAddress(clientAddress: ClientAddress): string {
  return `${clientAddress.street} #${clientAddress.number}`;
}

export function getInitials(
  client: Pick<Client, "name" | "paternal_last_name" | "maternal_last_name" | "fullName">
): string {
  return getFullName(client)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}
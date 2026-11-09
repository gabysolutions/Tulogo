export function folioFromId(id: number): string {
  return `VENT-${String(id).padStart(4, "0")}`;
}
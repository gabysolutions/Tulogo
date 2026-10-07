import type { ApiError } from "../types/invoice";


export const getSwal = async () => (await import("sweetalert2")).default;

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

export async function toast(icon: "success" | "error" | "info" | "warning", title: string) {
  const Swal = await getSwal();
  await Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 3200,
    timerProgressBar: true,
  });
}

export async function showApiError(err: ApiError, title = "No se pudo completar") {
  const Swal = await getSwal();
  const list = (label: string, items?: string[]) =>
    items?.length
      ? `<p style="margin-top:12px;font-weight:600">${label}</p><ul style="text-align:left;margin:6px auto 0;display:inline-block">${items
          .map((i) => `<li>• ${escapeHtml(i)}</li>`)
          .join("")}</ul>`
      : "";
  await Swal.fire({
    icon: "error",
    title,
    html: `<p>${escapeHtml(err.message)}</p>${list("Datos fiscales faltantes:", err.details?.missing)}${list(
      "Artículos sin clave SAT:",
      err.details?.articles,
    )}`,
    confirmButtonColor: "#2563eb",
    confirmButtonText: "Entendido",
  });
}

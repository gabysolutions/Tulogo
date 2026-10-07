import { useCallback, useState } from "react";
import Swal from "sweetalert2";
import { getOrderPdfService } from "../services/orders.service";

// Con responseType "blob", el cuerpo de un error también lga como Blob
async function getPdfErrorMessage(err: unknown): Promise<string> {
  const e = err as { response?: { data?: unknown }; message?: string };
  const data = e?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text()) as { message?: string };
      if (parsed?.message) return parsed.message;
    } catch {
      // el cuerpo no era JSON, cae al mensaje genérico
    }
  }
  return e?.message ?? "Intenta de nuevo";
}

export function useOrderPdf() {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const openPdf = useCallback(async (orderId: number) => {
    // La pestaña se abre en el click (antes del await) para que el navegador no la bloquee
    const win = window.open("", "_blank");
    setLoadingId(orderId);

    try {
      const blob = await getOrderPdfService(orderId);
      const pdf =
        blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdf);

      if (win) {
        win.location.href = url;
      } else {
        // Pestaña bloqueada: descarga directa
        const a = document.createElement("a");
        a.href = url;
        a.download = `ORD-${String(orderId).padStart(4, "0")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
    } catch (err) {
      win?.close();
      Swal.fire({
        icon: "error",
        title: "No se pudo generar el PDF",
        text: await getPdfErrorMessage(err),
      });
    } finally {
      setLoadingId(null);
    }
  }, []);

  return { openPdf, loadingId };
}
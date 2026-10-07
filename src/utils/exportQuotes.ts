import * as XLSX from "xlsx";

import type { Quote } from "../types/quote";
import type { Client } from "../types/client";
import type { Article } from "../types/article";
import { QuoteStatus, QuotePriority } from "../types/quote";

const statusLabel: Record<number, string> = {
  [QuoteStatus.PENDIENTE]: "Pendiente",
  [QuoteStatus.ACEPTADA]: "Aceptada",
  [QuoteStatus.CANCELADA]: "Cancelada",
};

export function exportQuotesToExcel(
  quotes: Quote[],
  clients: Client[],
  articles: Article[]
) {
  if (quotes.length === 0) {
    console.warn("No hay cotizaciones para exportar");
    return;
  }

  const rows = quotes.map((quote) => {
    const client = clients.find((c) => c.id === quote.clientId);

    const clientName = client
      ? `${client.name} ${client.paternal_last_name} ${client.maternal_last_name}`
      : "Cliente no encontrado";

    const totalPieces = quote.details.reduce(
      (acc, item) => acc + item.amount,
      0
    );

    const productNames = quote.details
      .map(
        (detail) =>
          articles.find((a) => a.id === detail.articleId)?.description
      )
      .filter(Boolean)
      .join(", ");

    return {
      Folio: quote.folio,
      Cliente: clientName,
      "Fecha registro": quote.registrationDate,
      "Fecha entrega": quote.deliveryDate,
      Estado: statusLabel[quote.status] ?? quote.status,
      Prioridad: QuotePriority[quote.priority] ?? quote.priority,
      Productos: productNames,
      Piezas: totalPieces,
      IVA: quote.iva ? "Sí" : "No",
      Envío: quote.sending ? "Sí" : "No",
      Total: quote.total,
      Anticipo: quote.advance,
      "Saldo pendiente": quote.balanceDue,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Ancho de columnas aproximado según el contenido más largo de cada una
  const columnWidths = Object.keys(rows[0]).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...rows.map((row) => String(row[key as keyof typeof row]).length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cotizaciones");

  const today = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `Cotizaciones_${today}.xlsx`);
}
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import type { ArticleListItem } from "../types/inventory";
import type { AddOrderDetailPayload, OrderSize, OrderGender } from "../types/order";

const HEADERS = ["Artículo", "Nombre en prenda", "Número", "Talla", "Corte"];

const VALID_SIZES: OrderSize[] = ["XS", "S", "M", "L", "XL"];
const VALID_GENDERS: OrderGender[] = ["M", "F"];

const MAX_ROWS = 500; 

export async function downloadOrderDetailsTemplate(articles: ArticleListItem[], quoteId?: number) {
  const wb = new ExcelJS.Workbook();

 
  const ws = wb.addWorksheet("Piezas", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: HEADERS[0], width: 28 }, // A Artículo
    { header: HEADERS[1], width: 16 }, // B Nombre en prenda
    { header: HEADERS[2], width: 10 }, // C Número
    { header: HEADERS[3], width: 10 }, // D Talla
    { header: HEADERS[4], width: 10 }, // E Corte
  ];
  ws.getRow(1).font = { bold: true };


  ws.addRow([articles[0]?.description.trim() ?? "", "MESSI", "10", "M", "M"]);

  
  const wsCatalog = wb.addWorksheet("Catalogo");
  wsCatalog.getCell("A1").value = "Artículos";
  articles.forEach((a, i) => {
    wsCatalog.getCell(`A${i + 2}`).value = a.description.trim();
  });
  wsCatalog.state = "hidden";

  const lastCatalogRow = Math.max(articles.length + 1, 2);
  const articleRange = `Catalogo!$A$2:$A$${lastCatalogRow}`;

  for (let r = 2; r <= MAX_ROWS; r++) {
    ws.getCell(`A${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [articleRange],
      showErrorMessage: true,
      errorTitle: "Artículo inválido",
      error: "Selecciona un artículo de la lista.",
    };
    ws.getCell(`D${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`"${VALID_SIZES.join(",")}"`],
      showErrorMessage: true,
      errorTitle: "Talla inválida",
      error: "Usa XS, S, M, L o XL.",
    };
    ws.getCell(`E${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`"${VALID_GENDERS.join(",")}"`],
      showErrorMessage: true,
      errorTitle: "Corte inválido",
      error: "Usa M o F.",
    };
  }

 
  const wsInfo = wb.addWorksheet("Instrucciones");
  wsInfo.columns = [{ width: 60 }];
  [
    "Instrucciones",
    "- No cambies los encabezados de la hoja 'Piezas'.",
    "- Artículo, Talla y Corte se eligen de la lista desplegable.",
    "- Artículo y Nombre en prenda son obligatorios.",
    "- Número es opcional.",
    "- Borra la fila de ejemplo antes de subir el archivo.",
  ].forEach((t) => wsInfo.addRow([t]));
  wsInfo.getRow(1).font = { bold: true };


  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const filename = quoteId
    ? `formato-piezas-COT-${String(quoteId).padStart(4, "0")}.xlsx`
    : "formato-piezas.xlsx";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ParsedDetailsResult {
  details: AddOrderDetailPayload[];
  errors: string[];
}

export async function parseOrderDetailsFile(file: File, articles: ArticleListItem[]): Promise<ParsedDetailsResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets["Piezas"] ?? wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const details: AddOrderDetailPayload[] = [];
  const errors: string[] = [];

  rows.forEach((row, i) => {
    const rowNumber = i + 2; 

    const articleName = String(row["Artículo"] ?? row["Articulo"] ?? "").trim();
    const nickname = String(row["Nombre en prenda"] ?? "").trim();
    const sizeRaw = String(row["Talla"] ?? "").trim().toUpperCase();
    const genderRaw = String(row["Corte"] ?? row["Corte"] ?? "").trim().toUpperCase();
    const numberRaw = String(row["Número"] ?? row["Numero"] ?? "").trim();

    if (!nickname) {
      errors.push(`Fila ${rowNumber}: falta el nombre en prenda.`);
      return;
    }

    const article = articles.find((a) => a.description.trim().toLowerCase() === articleName.toLowerCase());
    if (!article) {
      errors.push(`Fila ${rowNumber}: artículo "${articleName}" no encontrado.`);
      return;
    }

    if (!VALID_SIZES.includes(sizeRaw as OrderSize)) {
      errors.push(`Fila ${rowNumber}: talla inválida ("${sizeRaw}"). Usa XS, S, M, L o XL.`);
      return;
    }
    if (!VALID_GENDERS.includes(genderRaw as OrderGender)) {
      errors.push(`Fila ${rowNumber}: corte inválido ("${genderRaw}"). Usa M o F.`);
      return;
    }

    details.push({
      articleId: article.id,
      nickname,
      number: numberRaw || undefined,
      size: sizeRaw as OrderSize,
      gender: genderRaw as OrderGender,
    });
  });

  return { details, errors };
}
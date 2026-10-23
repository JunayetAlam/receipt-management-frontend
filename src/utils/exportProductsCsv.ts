import { TProduct } from "@/types";

// Same columns and layout as the bulk-import sample CSV (generateSampleCSV in
// csvParser.ts), so an exported file can be imported back unchanged.
const HEADERS = "Name,Unit,Selling Price,Buying Price,Stock,Description";

// Always-quoted text cell, like the sample. Product names such as `6" pipe`
// contain a quote, which is escaped by doubling it.
function textCell(value: string | null | undefined) {
  let text = value ?? "";
  // Neutralise spreadsheet formula injection (=, +, -, @).
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildProductsCsv(products: TProduct[]) {
  const rows = products.map((p) =>
    [
      textCell(p.name),
      p.unit,
      p.sellingPrice,
      p.buyingPrice ?? "",
      p.stock,
      textCell(p.description),
    ].join(","),
  );
  return [HEADERS, ...rows].join("\n");
}

export function downloadProductsCsv(products: TProduct[], fileName: string) {
  // BOM so Excel opens UTF-8 (e.g. Bangla names) correctly; the importer
  // ignores it because header names are normalised.
  const blob = new Blob(["﻿" + buildProductsCsv(products)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

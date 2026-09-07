import { ProductUnit } from "@/types";

export interface ParsedProductRow {
  id: string;
  name: string;
  unit: ProductUnit;
  sellingPrice: string;
  buyingPrice: string;
  stock: string;
  description: string;
  errors?: {
    name?: string;
    sellingPrice?: string;
    buyingPrice?: string;
    stock?: string;
  };
}

const VALID_UNITS: ProductUnit[] = [
  "PIECE",
  "KG",
  "GRAM",
  "LITER",
  "BOX",
  "PACKET",
  "METER",
  "OTHER",
];

const UNIT_MAP: Record<string, ProductUnit> = {
  piece: "PIECE",
  pcs: "PIECE",
  pc: "PIECE",
  kg: "KG",
  kilogram: "KG",
  gram: "GRAM",
  g: "GRAM",
  gm: "GRAM",
  liter: "LITER",
  litre: "LITER",
  l: "LITER",
  box: "BOX",
  packet: "PACKET",
  pkt: "PACKET",
  meter: "METER",
  m: "METER",
  other: "OTHER",
};

/**
 * Robust CSV line tokenizer respecting quotes and escaped quotes
 */
export function parseCSVRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // End of quoted field
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r") {
        if (nextChar === "\n") {
          i++;
        }
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  // Push final field/row if any
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows.filter((r) => r.length > 0 && r.some((c) => c.trim() !== ""));
}

/**
 * Normalizes header string to field name
 */
function normalizeHeader(header: string): string {
  const clean = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.includes("name") || clean === "title") return "name";
  if (clean.includes("unit") || clean === "uom") return "unit";
  if (clean.includes("sell") || clean === "price" || clean === "mrp") return "sellingPrice";
  if (clean.includes("buy") || clean.includes("cost") || clean === "purchaseprice") return "buyingPrice";
  if (clean.includes("stock") || clean.includes("qty") || clean.includes("quantity")) return "stock";
  if (clean.includes("desc") || clean.includes("detail") || clean.includes("note")) return "description";
  return clean;
}

/**
 * Normalizes unit string to standard ProductUnit enum
 */
export function normalizeUnit(rawUnit?: string): ProductUnit {
  if (!rawUnit) return "PIECE";
  const clean = rawUnit.trim().toLowerCase();
  if (UNIT_MAP[clean]) return UNIT_MAP[clean];
  const upper = rawUnit.trim().toUpperCase() as ProductUnit;
  if (VALID_UNITS.includes(upper)) return upper;
  return "PIECE";
}

/**
 * Parses CSV text into ParsedProductRow items
 */
export function parseProductCSV(csvContent: string): ParsedProductRow[] {
  const rawRows = parseCSVRows(csvContent);
  if (rawRows.length === 0) return [];

  const headers = rawRows[0].map(normalizeHeader);
  const dataRows = rawRows.slice(1);

  return dataRows.map((row, index) => {
    const rowData: Record<string, string> = {};
    headers.forEach((h, colIndex) => {
      rowData[h] = row[colIndex] || "";
    });

    const name = rowData.name || row[0] || "";
    const unit = normalizeUnit(rowData.unit || row[1]);
    const sellingPrice = rowData.sellingPrice || row[2] || "";
    const buyingPrice = rowData.buyingPrice || row[3] || "";
    const stock = rowData.stock || row[4] || "0";
    const description = rowData.description || row[5] || "";

    return {
      id: `row-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      unit,
      sellingPrice: sellingPrice.trim(),
      buyingPrice: buyingPrice.trim(),
      stock: stock.trim() || "0",
      description: description.trim(),
    };
  });
}

/**
 * Returns standard sample CSV content
 */
export function generateSampleCSV(): string {
  const headers = "Name,Unit,Selling Price,Buying Price,Stock,Description";
  const rows = [
    '"Miniket Rice 25kg",PACKET,1850,1650,50,"Premium quality aged miniket rice"',
    '"Soybean Oil 5L",LITER,890,820,30,"Fortified with Vitamin A"',
    '"Sugar Fresh 1kg",KG,135,120,100,"Pure refined cane sugar"',
    '"Ball Pen Blue",PIECE,10,7,200,"Smooth writing ballpoint pen"',
  ];
  return [headers, ...rows].join("\n");
}

/**
 * Initiates browser download of sample CSV file
 */
export function downloadSampleCSV(filename = "product_import_sample.csv") {
  const content = generateSampleCSV();
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

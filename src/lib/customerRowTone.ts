export type CustomerTypeFilter = "ALL" | "CUSTOMER" | "RETAILER";

// Row background per customer type (customer = plain, retailer = emerald)
const ROW_TONES: Record<"CUSTOMER" | "RETAILER", string> = {
  CUSTOMER: "bg-transparent hover:bg-muted/50",
  RETAILER:
    "border-l-4 border-l-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20",
};

// When the list is filtered to a single type, rows alternate between two shades
const STRIPED_ROW_TONES: Record<"CUSTOMER" | "RETAILER", [string, string]> = {
  CUSTOMER: [
    "bg-transparent hover:bg-muted/50",
    "bg-sky-500/10 hover:bg-sky-500/20",
  ],
  RETAILER: [
    "border-l-4 border-l-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/15",
    "border-l-4 border-l-emerald-500 bg-emerald-500/15 hover:bg-emerald-500/25",
  ],
};

/** Row/card background for lists that can be filtered by customer type. */
export const getCustomerTypeRowTone = (
  customerType: string | null | undefined,
  index: number,
  typeFilter: CustomerTypeFilter,
) => {
  const type = customerType === "RETAILER" ? "RETAILER" : "CUSTOMER";
  return typeFilter === "ALL"
    ? ROW_TONES[type]
    : STRIPED_ROW_TONES[type][index % 2];
};

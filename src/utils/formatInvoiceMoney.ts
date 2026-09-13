const moneyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function roundInvoiceMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function formatInvoiceMoney(amount: number): string {
  return `৳${moneyFormatter.format(roundInvoiceMoney(amount))}`;
}

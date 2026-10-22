import { TReceiptItem } from "@/types";
import { roundInvoiceMoney } from "@/utils/formatInvoiceMoney";

/** Breathing room kept between the last row (or summary) and the footer. */
export const INVOICE_CONTENT_FOOTER_GAP = 12;
export const INVOICE_CONTENT_TOP_PADDING = 40;
export const INVOICE_TABLE_TOP_PADDING = 16;

export type InvoicePage = {
  pageNo: number;
  items: TReceiptItem[];
  startIndex: number;
  broughtForward: number;
  carriedForward: number;
  showBroughtForward: boolean;
  showCarryForward: boolean;
  showCalculation: boolean;
  isLast: boolean;
  /**
   * Predicted distance from the page top to the bottom of the carry-forward row,
   * before any correction. Compared with the rendered page to find `overheadCorrection`.
   */
  predictedHeight: number;
};

/** px the measured overhead over-estimates, from the rendered pages: page 1, and later pages. */
export type OverheadCorrection = { first: number; rest: number };

export type PaginateInvoicePagesInput = {
  items: TReceiptItem[];
  pageHeight: number;
  compactFooterHeight: number;
  lastFooterHeight: number;
  detailsHeight: number;
  continuationBarHeight: number;
  tableHeaderHeight: number;
  /** Height of a single-line item row; used for items without a measured height. */
  rowHeight: number;
  /** Measured height of each item row (same order as `items`); long names wrap, so rows differ. */
  rowHeights?: number[];
  balanceRowHeight: number;
  calculationHeight: number;
  contentTopPadding?: number;
  tableTopPadding?: number;
  extraGap?: number;
  overheadCorrection?: OverheadCorrection;
};

export function sumItemTotals(items: TReceiptItem[]): number {
  return roundInvoiceMoney(
    items.reduce((sum, item) => sum + roundInvoiceMoney(item.totalPrice), 0),
  );
}

function pageOverhead(
  pageNo: number,
  input: Required<
    Pick<
      PaginateInvoicePagesInput,
      | "detailsHeight"
      | "continuationBarHeight"
      | "tableHeaderHeight"
      | "balanceRowHeight"
      | "contentTopPadding"
      | "tableTopPadding"
    >
  >,
): number {
  const isFirst = pageNo === 1;
  return (
    input.contentTopPadding +
    (isFirst ? input.detailsHeight : input.continuationBarHeight) +
    input.tableTopPadding +
    input.tableHeaderHeight +
    // Pages 2+: "brought forward" row on top and "page N total" row under the items.
    (pageNo > 1 ? input.balanceRowHeight * 2 : 0)
  );
}

export function paginateInvoicePages(
  rawInput: PaginateInvoicePagesInput,
): InvoicePage[] {
  const input = {
    contentTopPadding: INVOICE_CONTENT_TOP_PADDING,
    tableTopPadding: INVOICE_TABLE_TOP_PADDING,
    extraGap: INVOICE_CONTENT_FOOTER_GAP,
    ...rawInput,
  };

  const rowHeight = Math.max(input.rowHeight, 1);
  const balanceRowHeight = Math.max(input.balanceRowHeight, rowHeight);
  const tableHeaderHeight = Math.max(input.tableHeaderHeight, 1);
  const pageHeight = Math.max(input.pageHeight, 1);
  const extraGap = input.extraGap;
  const compactFooterHeight = Math.max(input.compactFooterHeight, 1);
  const lastFooterHeight = Math.max(input.lastFooterHeight, compactFooterHeight);

  const usableCompact = pageHeight - compactFooterHeight - extraGap;
  const usableLast = pageHeight - lastFooterHeight - extraGap;

  const overheadInput = {
    detailsHeight: Math.max(input.detailsHeight, 0),
    continuationBarHeight: Math.max(input.continuationBarHeight, 0),
    tableHeaderHeight,
    balanceRowHeight,
    contentTopPadding: input.contentTopPadding,
    tableTopPadding: input.tableTopPadding,
  };

  const items = input.items ?? [];
  const heightOf = (index: number) =>
    Math.max(input.rowHeights?.[index] ?? rowHeight, 1);
  const rowsHeight = (from: number, count: number) => {
    let total = 0;
    for (let i = from; i < from + count; i++) total += heightOf(i);
    return total;
  };

  const pages: InvoicePage[] = [];
  let remaining = [...items];
  let broughtForward = 0;
  let startIndex = 0;
  let pageNo = 1;

  const correctionFor = (page: number) =>
    page === 1
      ? input.overheadCorrection?.first ?? 0
      : input.overheadCorrection?.rest ?? 0;

  const makePage = (
    pageItems: TReceiptItem[],
    isLast: boolean,
    predictedHeight: number,
  ): InvoicePage => {
    const pageItemsTotal = sumItemTotals(pageItems);
    const carriedForward = roundInvoiceMoney(broughtForward + pageItemsTotal);
    return {
      pageNo,
      items: pageItems,
      startIndex,
      broughtForward,
      carriedForward,
      showBroughtForward: pageNo > 1,
      showCarryForward: !isLast,
      showCalculation: isLast,
      isLast,
      predictedHeight,
    };
  };

  while (pageNo <= 200) {
    const rawOverhead = pageOverhead(pageNo, overheadInput);
    const overhead = rawOverhead - correctionFor(pageNo);
    const remainingRowsHeight = rowsHeight(startIndex, remaining.length);
    const fitsAsLast =
      overhead + remainingRowsHeight + input.calculationHeight <= usableLast;

    if (fitsAsLast) {
      pages.push(makePage(remaining, true, rawOverhead + remainingRowsHeight));
      break;
    }

    if (remaining.length === 0) {
      pages.push(makePage([], true, rawOverhead));
      break;
    }

    const continuationBudget = usableCompact - overhead - balanceRowHeight;
    const allItemsFitAsContinuation =
      overhead + remainingRowsHeight + balanceRowHeight <= usableCompact;

    let take: number;
    if (allItemsFitAsContinuation) {
      take = remaining.length;
    } else {
      // As many rows as fit, adding up each row's real height.
      take = 0;
      let used = 0;
      while (
        take < remaining.length &&
        used + heightOf(startIndex + take) <= continuationBudget
      ) {
        used += heightOf(startIndex + take);
        take += 1;
      }
      take = Math.max(1, take);
    }

    const pageItems = remaining.slice(0, take);
    const predictedHeight =
      rawOverhead + rowsHeight(startIndex, take) + balanceRowHeight;
    remaining = remaining.slice(take);
    const page = makePage(pageItems, false, predictedHeight);
    pages.push(page);
    broughtForward = page.carriedForward;
    startIndex += pageItems.length;
    pageNo += 1;
  }

  if (pages.length === 0) {
    pages.push(makePage(items, true, 0));
  }

  return pages;
}

/**
 * Compare each rendered non-last page with its prediction: how far the
 * carry-forward row really ends from the page top vs `predictedHeight`. The
 * difference is the overhead the measurements over-estimate (positive = wasted
 * space at the bottom, negative = rows pushed under the footer). Measured
 * against uncorrected predictions, so it settles in one pass.
 */
export function measureOverheadCorrection(
  container: HTMLElement | null,
  pages: InvoicePage[],
): OverheadCorrection | null {
  if (!container) return null;
  const rendered = Array.from(
    container.querySelectorAll<HTMLElement>("[data-invoice-page]"),
  ).filter((el) => el.getClientRects().length > 0);

  let first: number | null = null;
  let rest: number | null = null;
  for (const el of rendered) {
    const page = pages[Number(el.dataset.invoicePage) - 1];
    if (!page || page.isLast) continue;
    const cfRow = el.querySelector<HTMLElement>('[data-row="balance-cf"]');
    if (!cfRow) continue;
    const actual =
      cfRow.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
    const diff = page.predictedHeight - actual;
    if (page.pageNo === 1) first ??= diff;
    else rest ??= diff;
  }

  if (first === null && rest === null) return null;
  const clamp = (v: number) => Math.max(-200, Math.min(200, v));
  return { first: clamp(first ?? 0), rest: clamp(rest ?? 0) };
}

/** One page's line in the final summary: which items it holds and their total. */
export type PageTotal = {
  pageNo: number;
  firstItemNo: number;
  lastItemNo: number;
  amount: number;
};

/**
 * Per-page item totals for the final summary (they add up to the subtotal).
 * Empty when there is nothing to break down: a single page of items.
 */
export function pageTotalsOf(pages: InvoicePage[]): PageTotal[] {
  const totals = pages
    .filter((page) => page.items.length > 0)
    .map((page) => ({
      pageNo: page.pageNo,
      firstItemNo: page.startIndex + 1,
      lastItemNo: page.startIndex + page.items.length,
      amount: sumItemTotals(page.items),
    }));
  return totals.length > 1 ? totals : [];
}

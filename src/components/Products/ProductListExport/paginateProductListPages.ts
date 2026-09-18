import { TProduct } from "@/types";

export const LIST_CONTENT_FOOTER_GAP = 28;
export const LIST_CONTENT_TOP_PADDING = 32;
export const LIST_TABLE_TOP_PADDING = 16;

export type ProductListPage = {
  pageNo: number;
  products: TProduct[];
  startIndex: number;
  isLast: boolean;
};

export type PaginateProductListInput = {
  products: TProduct[];
  pageHeight: number;
  footerHeight: number;
  headerHeight: number;
  continuationBarHeight: number;
  tableHeaderHeight: number;
  rowHeight: number;
  emptyStateHeight: number;
  contentTopPadding?: number;
  tableTopPadding?: number;
  extraGap?: number;
};

export function paginateProductListPages(
  rawInput: PaginateProductListInput,
): ProductListPage[] {
  const input = {
    contentTopPadding: LIST_CONTENT_TOP_PADDING,
    tableTopPadding: LIST_TABLE_TOP_PADDING,
    extraGap: LIST_CONTENT_FOOTER_GAP,
    ...rawInput,
  };

  const rowHeight = Math.max(input.rowHeight, 1);
  const tableHeaderHeight = Math.max(input.tableHeaderHeight, 1);
  const pageHeight = Math.max(input.pageHeight, 1);
  const footerHeight = Math.max(input.footerHeight, 1);
  const extraGap = input.extraGap;
  const usable = pageHeight - footerHeight - extraGap;

  const products = input.products ?? [];
  const pages: ProductListPage[] = [];
  let remaining = [...products];
  let startIndex = 0;
  let pageNo = 1;

  const overhead = (isFirst: boolean) =>
    input.contentTopPadding +
    (isFirst
      ? Math.max(input.headerHeight, 0)
      : Math.max(input.continuationBarHeight, 0)) +
    input.tableTopPadding +
    tableHeaderHeight;

  const makePage = (
    pageProducts: TProduct[],
    isLast: boolean,
  ): ProductListPage => ({
    pageNo,
    products: pageProducts,
    startIndex,
    isLast,
  });

  if (remaining.length === 0) {
    return [makePage([], true)];
  }

  while (pageNo <= 500 && remaining.length > 0) {
    const isFirst = pageNo === 1;
    const head = overhead(isFirst);
    const remainingRowsHeight = remaining.length * rowHeight;
    const fitsAsLast = head + remainingRowsHeight <= usable;

    if (fitsAsLast) {
      pages.push(makePage(remaining, true));
      break;
    }

    let take = Math.floor((usable - head) / rowHeight);
    take = Math.max(1, Math.min(take, remaining.length));

    const pageProducts = remaining.slice(0, take);
    remaining = remaining.slice(take);
    const isLast = remaining.length === 0;
    pages.push(makePage(pageProducts, isLast));
    startIndex += pageProducts.length;
    pageNo += 1;
  }

  if (pages.length === 0) {
    pages.push(makePage(products, true));
  } else {
    pages[pages.length - 1] = {
      ...pages[pages.length - 1],
      isLast: true,
    };
  }

  return pages;
}

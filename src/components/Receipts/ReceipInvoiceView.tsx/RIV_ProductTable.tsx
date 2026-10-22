import { TReceiptItem } from "@/types";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import { SCALED_BASE_FONT } from "@/components/Global/TextSizeControl";
import type { PageTotal } from "./paginateInvoicePages";

// Compact rows: every cell gets a dark border, and every even row a light gray
// background.
// All sizes are in `em` off the table's base font size (10px at 100%), so the
// invoice text-size control scales text, row height and column widths together.
const thClass =
  "h-[2.4em] px-[0.6em] py-[0.4em] text-left align-middle text-[1em] font-bold uppercase tracking-wider text-black dark:text-foreground whitespace-nowrap border border-slate-700 bg-slate-50";
const tdClass =
  "px-[0.6em] border border-slate-700 py-[0.3em] align-middle whitespace-nowrap overflow-hidden text-ellipsis text-[1em] leading-tight text-slate-900";

/**
 * Item-name cell: same as `tdClass` minus the no-wrap/ellipsis rules, so long
 * names wrap (adding `whitespace-normal` on top of `tdClass` doesn't override it).
 */
const wrapTdClass =
  "px-[0.6em] border border-slate-700 py-[0.3em] align-middle whitespace-normal wrap-break-word text-[1em] leading-tight text-slate-900";

/** Narrower side padding for the tight U/P and Disc % columns. */
const TIGHT_X = { paddingLeft: "0.4em", paddingRight: "0.4em" };

/** Base font size, scaled by the view's text-size control (1 when absent). */
export const INVOICE_BASE_FONT = SCALED_BASE_FONT;

export type RIV_ProductTableProps = {
  items: TReceiptItem[];
  startIndex?: number;
  broughtForward?: number;
  carriedForward?: number;
  fromPage?: number;
  toPage?: number;
  showBroughtForward?: boolean;
  showCarryForward?: boolean;
  /** "Page N total" row under this page's last item (pages 2+ of a multi-page invoice). */
  pageTotal?: PageTotal;
  /** Page totals that make up the brought-forward amount (shown as "= Page 1 + Page 2…"). */
  broughtForwardParts?: PageTotal[];
  /** Page totals that make up the carried-forward amount, this page included. */
  carriedForwardParts?: PageTotal[];
};

/** "= Page 1 ৳X + Page 2 ৳Y" — spells out a running balance that spans 2+ pages. */
function BalanceBreakdown({ parts }: { parts: PageTotal[] }) {
  return (
    <span className="ml-2 text-[0.9em] not-italic font-normal text-slate-500">
      ={" "}
      {parts.map((pt, i) => (
        <span key={pt.pageNo}>
          {i > 0 && " + "}
          Page {pt.pageNo}{" "}
          <span className="font-mono text-slate-700">
            {formatInvoiceMoney(pt.amount)}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Sum of just this page's items, so a later page's own total is visible in the table. */
function PageTotalRow({ pageTotal }: { pageTotal: PageTotal }) {
  return (
    <tr data-row="page-total" className="bg-slate-50" style={{ breakInside: "avoid" }}>
      <td className={`${tdClass} text-center text-slate-400`}>Σ</td>
      <td className={`${tdClass} whitespace-normal`} colSpan={5}>
        <span className="font-semibold text-slate-800">
          Page {pageTotal.pageNo} total
        </span>
        <span className="ml-2 text-[0.9em] font-normal text-slate-500">
          items {pageTotal.firstItemNo}–{pageTotal.lastItemNo}
        </span>
      </td>
      <td className={`${tdClass} text-right font-mono font-bold text-slate-900`}>
        {formatInvoiceMoney(pageTotal.amount)}
      </td>
    </tr>
  );
}

function BalanceRow({
  kind,
  pageNo,
  amount,
  parts = [],
}: {
  kind: "bf" | "cf";
  pageNo: number;
  amount: number;
  /** Page totals adding up to `amount`; spelled out when there are 2 or more. */
  parts?: PageTotal[];
}) {
  const showBreakdown = parts.length > 1;
  const isBf = kind === "bf";
  return (
    <tr
      data-row={isBf ? "balance-bf" : "balance-cf"}
      className="bg-slate-50/90"
      style={{ breakInside: "avoid" }}
    >
      <td className={`${tdClass} text-center text-slate-400`}>—</td>
      <td className={`${tdClass} whitespace-normal italic text-slate-700`} colSpan={5}>
        <span className="font-semibold not-italic text-slate-800">
          {isBf
            ? `Brought forward from Page ${pageNo}`
            : `Balance carried forward to Page ${pageNo}`}
        </span>
        {showBreakdown ? (
          <BalanceBreakdown parts={parts} />
        ) : (
          !isBf && (
            <span className="ml-2 text-[0.9em] not-italic font-normal text-slate-500">
              Continued on next page
            </span>
          )
        )}
      </td>
      <td className={`${tdClass} text-right font-mono font-bold text-slate-900`}>
        {formatInvoiceMoney(amount)}
      </td>
    </tr>
  );
}

export default function RIV_ProductTable({
  items,
  startIndex = 0,
  broughtForward = 0,
  carriedForward = 0,
  fromPage = 1,
  toPage = 2,
  showBroughtForward = false,
  showCarryForward = false,
  pageTotal,
  broughtForwardParts,
  carriedForwardParts,
}: RIV_ProductTableProps) {
  const hasItems = items && items.length > 0;

  return (
    // Fixed layout: the numeric columns get set widths and the item name takes
    // all the remaining width.
    <table
      className="w-full table-fixed caption-bottom border-collapse"
      style={{
        fontSize: INVOICE_BASE_FONT,
        // Normal row size, for the first line of a wrapped item name.
        ["--invoice-row-font" as string]: INVOICE_BASE_FONT,
      }}
    >
      <thead data-probe="header">
        <tr>
          <th className={`${thClass} w-[2.8em] text-center`}>#</th>
          <th className={thClass}>Item</th>
          <th className={`${thClass} w-[4.8em]`}>Unit</th>
          <th className={`${thClass} text-center w-[4em]`}>Qt.</th>
          <th className={`${thClass} text-right w-[6.8em]`} style={TIGHT_X}>U/P</th>
          <th className={`${thClass} text-right w-[10em]`} style={TIGHT_X}>Disc %</th>
          <th className={`${thClass} text-right w-[9.6em]`}>Total</th>
        </tr>
      </thead>
      <tbody>
        {showBroughtForward && (
          <BalanceRow
            kind="bf"
            pageNo={fromPage}
            amount={broughtForward}
            parts={broughtForwardParts}
          />
        )}
        {hasItems
          ? items.map((item, idx) => (
              <tr
                key={item.id || `${startIndex}-${idx}`}
                data-row="item"
                className={`border border-slate-700 ${(startIndex + idx) % 2 === 1 ? "bg-slate-100" : ""}`}
                style={{ breakInside: "avoid" }}
              >
                <td
                  className={`${tdClass} text-center font-mono text-slate-500`}
                >
                  {startIndex + idx + 1}
                </td>
                {/* Long names wrap onto as many lines as they need. The first line
                    stays at the normal size; the wrapped lines are smaller. */}
                <td className={`${wrapTdClass} font-medium`}>
                  <div className="text-[0.85em] first-line:[font-size:var(--invoice-row-font)]">
                    {item.productName}
                  </div>
                </td>
                <td className={`${tdClass} text-slate-500 capitalize`}>
                  {item.unit.toLowerCase()}
                </td>
                <td className={`${tdClass} text-center font-mono`}>
                  {item.quantity}
                </td>
                <td className={`${tdClass} text-right font-mono`} style={TIGHT_X}>
                  {formatInvoiceMoney(item.sellingPrice)}
                </td>
                {/* Proportional digits and thin-space separators keep up to four
                    stacked discounts on one line. */}
                <td
                  className={`${tdClass} text-right tabular-nums tracking-tight text-slate-600`}
                  style={TIGHT_X}
                >
                  {item.discounts && item.discounts.length > 0 ? (
                    item.discounts.length > 1 ? (
                      <span title={item.discounts.map((d) => `${d}%`).join(", ")}>
                        {item.discounts.map((d) => `${d}%`).join(", ")}
                      </span>
                    ) : (
                      `${item.discounts[0]}%`
                    )
                  ) : item.discount && item.discount > 0 ? (
                    `${item.discount}%`
                  ) : (
                    "—"
                  )}
                </td>
                <td className={`${tdClass} text-right font-mono font-semibold`}>
                  {formatInvoiceMoney(item.totalPrice)}
                </td>
              </tr>
            ))
          : !showBroughtForward && !showCarryForward && (
              <tr>
                <td
                  colSpan={7}
                  className={`${tdClass} py-[1.6em] text-center text-slate-500 italic`}
                >
                  No items recorded
                </td>
              </tr>
            )}
        {pageTotal && hasItems && <PageTotalRow pageTotal={pageTotal} />}
        {showCarryForward && (
          <BalanceRow
            kind="cf"
            pageNo={toPage}
            amount={carriedForward}
            parts={carriedForwardParts}
          />
        )}
      </tbody>
    </table>
  );
}

"use client";

import { useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TReceipt } from "@/types";
import {
  Printer,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Receipt,
  Clock,
  Banknote,
} from "lucide-react";

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

interface ReceiptDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: TReceipt | null;
  onAddPayment?: (receipt: TReceipt) => void;
}

export default function ReceiptDetailsSheet({
  open,
  onOpenChange,
  receipt,
  onAddPayment,
}: ReceiptDetailsSheetProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">APPROVED</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">REJECTED</Badge>;
      default:
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">PENDING</Badge>;
    }
  };

  const formattedDate = formatDateTime(receipt.createdAt);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6">
        <SheetHeader className="pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <Receipt className="size-5 text-primary" />
              Receipt Details
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handlePrint}
              >
                <Printer className="size-3.5" />
                Print
              </Button>
              {getStatusBadge(receipt.status)}
            </div>
          </div>
        </SheetHeader>

        <div ref={printRef} className="space-y-6 pt-4 text-sm print:p-8">
          {/* Header Info */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground">Receipt Number</p>
              <p className="font-mono text-base font-bold text-foreground">
                {receipt.receiptNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <Calendar className="size-3" /> Date
              </p>
              <p className="font-medium text-xs text-foreground">{formattedDate}</p>
            </div>
          </div>

          {/* Customer Card */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">{receipt.customer?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-muted-foreground" />
                <span className="font-mono">
                  {receipt.customer?.countryCode || "+880"} {receipt.customer?.phoneNumber}
                </span>
              </div>
              {receipt.customer?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="truncate">{receipt.customer.email}</span>
                </div>
              )}
              {receipt.customer?.address && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  <span>{receipt.customer.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Purchased Items
            </p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Item</th>
                    <th className="px-3 py-2 font-medium text-right">Unit Price</th>
                    <th className="px-3 py-2 font-medium text-center">Qty</th>
                    <th className="px-3 py-2 font-medium text-right">Disc %</th>
                    <th className="px-3 py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {receipt.items?.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-muted/20">
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {it.productName}
                        <span className="ml-1 text-[10px] text-muted-foreground">({it.unit})</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">{it.sellingPrice} BDT</td>
                      <td className="px-3 py-2.5 text-center font-mono">{it.quantity}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-amber-600 dark:text-amber-400">
                        {it.discount > 0 ? `${it.discount}%` : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold">
                        {it.totalPrice} BDT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2 ml-auto max-w-xs text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono text-foreground">{receipt.subTotal} BDT</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                <span>Receipt Discount:</span>
                <span className="font-mono">- {receipt.discount} BDT</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-bold border-t border-border/60 pt-2 text-foreground">
              <span>Net Total:</span>
              <span className="font-mono">{receipt.totalAmount} BDT</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Paid Amount:</span>
              <span className="font-mono">{receipt.paidAmount} BDT</span>
            </div>
            <div className="flex justify-between items-center text-destructive font-semibold border-t border-border/40 pt-2 text-sm">
              <span>Remaining Due:</span>
              <span className="font-mono">{receipt.dueAmount} BDT</span>
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3" /> Payment History ({receipt.payments?.length || 0})
              </p>
              {receipt.dueAmount > 0 && onAddPayment && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10"
                  onClick={() => {
                    onOpenChange(false);
                    onAddPayment(receipt);
                  }}
                >
                  <Banknote className="size-3" /> Add Payment
                </Button>
              )}
            </div>

            {receipt.payments && receipt.payments.length > 0 ? (
              <div className="rounded-xl border border-border divide-y divide-border/40 text-xs overflow-hidden">
                {receipt.payments.map((p, idx) => (
                  <div key={p.id || idx} className="p-3 flex justify-between items-center hover:bg-muted/20">
                    <div>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        +{p.amount} BDT
                      </p>
                      {p.note && <p className="text-[11px] text-muted-foreground">{p.note}</p>}
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground">
                      <p>{formatDateTime(p.createdAt)}</p>
                      {p.createdBy && (
                        <p>Received by {p.createdBy.firstName} {p.createdBy.lastName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No installment payments recorded yet.</p>
            )}
          </div>

          {/* Note & Meta */}
          {receipt.note && (
            <div className="rounded-xl border border-border/60 p-3 bg-muted/10 text-xs">
              <p className="font-semibold text-muted-foreground mb-1">Receipt Note:</p>
              <p className="text-foreground">{receipt.note}</p>
            </div>
          )}

          {receipt.createdBy && (
            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
              Created by {receipt.createdBy.firstName} {receipt.createdBy.lastName} ({receipt.createdBy.email})
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

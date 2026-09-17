"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Package,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateReturnInvoiceMutation,
  useGetReturnableItemsByReceiptQuery,
  useUpdateReturnInvoiceMutation,
} from "@/redux/api/returnInvoiceApi";
import { useGetAllReceiptsQuery, useGetReceiptByIdQuery } from "@/redux/api/receiptApi";
import { TReturnInvoice } from "@/types";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";
import { derivePositionAfterReturn } from "@/utils/deriveReceiptSettlement";
import { cn } from "@/lib/utils";
import ReceiptSelect from "./ReceiptSelect";

interface LineState {
  selected: boolean;
  quantity: number;
  sellingPrice: number;
  discount: number;
}

interface ReturnInvoiceFormProps {
  initialData?: TReturnInvoice;
  isEditing?: boolean;
  isDetails?: boolean;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function lineTotal(qty: number, sellingPrice: number, discount: number) {
  const sub = qty * sellingPrice;
  const disc = (sub * (discount || 0)) / 100;
  return round2(Math.max(0, sub - disc));
}

export default function ReturnInvoiceForm({
  initialData,
  isEditing = false,
  isDetails = false,
}: ReturnInvoiceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedReceiptId =
    searchParams.get("receiptId") || initialData?.receiptId || "";

  const readOnly = isDetails;

  const [receiptId, setReceiptId] = useState(preselectedReceiptId);
  const [receiptSearch, setReceiptSearch] = useState("");
  const receiptSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [lines, setLines] = useState<Record<string, LineState>>({});
  const [discount, setDiscount] = useState(
    initialData ? String(initialData.discount || 0) : "0",
  );
  const [refundedAmount, setRefundedAmount] = useState(
    initialData ? String(initialData.refundedAmount ?? 0) : "0",
  );
  const [note, setNote] = useState(initialData?.note || "");
  const refundTouchedRef = useRef(!!isEditing || !!isDetails);

  const handleReceiptSearch = (term: string) => {
    if (receiptSearchTimer.current) clearTimeout(receiptSearchTimer.current);
    receiptSearchTimer.current = setTimeout(() => {
      setReceiptSearch(term);
    }, 300);
  };

  const [createReturn, { isLoading: isCreating }] =
    useCreateReturnInvoiceMutation();
  const [updateReturn, { isLoading: isUpdating }] =
    useUpdateReturnInvoiceMutation();

  const { data: receiptsRes, isLoading: isReceiptsLoading } =
    useGetAllReceiptsQuery(
      {
        isDeleted: false,
        limit: 50,
        ...(receiptSearch.trim()
          ? { searchTerm: receiptSearch.trim() }
          : {}),
      },
      { skip: !!isEditing || !!isDetails || !!preselectedReceiptId },
    );

  const { data: selectedReceiptRes } = useGetReceiptByIdQuery(receiptId, {
    skip: !receiptId || isEditing || isDetails,
  });

  const {
    data: returnableRes,
    isLoading: isReturnableLoading,
    isFetching: isReturnableFetching,
  } = useGetReturnableItemsByReceiptQuery(
    {
      receiptId,
      excludeReturnInvoiceId: isEditing ? initialData?.id : undefined,
    },
    { skip: !receiptId || readOnly },
  );

  const returnableItems = returnableRes?.data?.items || [];
  const returnableReceipt = returnableRes?.data?.receipt;
  const previousReturn =
    returnableRes?.data?.previousReturn ||
    initialData?.previousReturnInvoice ||
    null;
  const selectedReceipt = selectedReceiptRes?.data;

  const previousDue = useMemo(() => {
    if (readOnly || isEditing) {
      return round2(Number(initialData?.previousDueAmount) || 0);
    }
    return round2(
      Number(
        returnableRes?.data?.previousDueAmount ??
          previousReturn?.dueRefundAmount ??
          0,
      ) || 0,
    );
  }, [
    readOnly,
    isEditing,
    initialData?.previousDueAmount,
    returnableRes?.data?.previousDueAmount,
    previousReturn?.dueRefundAmount,
  ]);

  // Hydrate lines when returnable items load (create/edit)
  useEffect(() => {
    if (readOnly || !returnableItems.length) return;

    setLines((prev) => {
      const next: Record<string, LineState> = {};
      for (const item of returnableItems) {
        const existingInitial = initialData?.items?.find(
          (it) => it.receiptItemId === item.receiptItemId,
        );
        const prevLine = prev[item.receiptItemId];
        const maxQty = item.remainingReturnable;
        if (existingInitial && isEditing) {
          next[item.receiptItemId] = {
            selected: true,
            quantity: Math.min(
              existingInitial.quantity,
              maxQty || existingInitial.quantity,
            ),
            sellingPrice: existingInitial.sellingPrice,
            discount: existingInitial.discount,
          };
        } else if (prevLine) {
          next[item.receiptItemId] = {
            selected: prevLine.selected && maxQty > 0,
            quantity: Math.min(prevLine.quantity || 1, Math.max(maxQty, 0)),
            sellingPrice: prevLine.sellingPrice ?? item.sellingPrice,
            discount: prevLine.discount ?? item.discount,
          };
        } else {
          next[item.receiptItemId] = {
            selected: false,
            quantity: maxQty > 0 ? 1 : 0,
            sellingPrice: item.sellingPrice,
            discount: item.discount,
          };
        }
      }
      return next;
    });
  }, [returnableItems, readOnly, isEditing, initialData]);

  useEffect(() => {
    if (preselectedReceiptId) setReceiptId(preselectedReceiptId);
  }, [preselectedReceiptId]);

  // Reset refund default when switching source receipt on create
  useEffect(() => {
    if (isEditing || readOnly) return;
    refundTouchedRef.current = false;
  }, [receiptId, isEditing, readOnly]);

  const displayItems: Array<{
    receiptItemId: string;
    productName: string;
    unit: string;
    sellingPrice: number;
    discount: number;
    originalQuantity?: number;
    alreadyReturned?: number;
    remainingReturnable?: number;
    quantity: number;
    totalPrice: number;
  }> = useMemo(() => {
    if (readOnly && initialData) {
      return initialData.items.map((it) => ({
        receiptItemId: it.receiptItemId,
        productName: it.productName,
        unit: it.unit,
        sellingPrice: it.sellingPrice,
        discount: it.discount,
        quantity: it.quantity,
        totalPrice: it.totalPrice,
      }));
    }

    return returnableItems
      .filter((it) => lines[it.receiptItemId]?.selected)
      .map((it) => {
        const line = lines[it.receiptItemId];
        const qty = line?.quantity || 0;
        const sellingPrice = line?.sellingPrice ?? it.sellingPrice;
        const discountPct = line?.discount ?? it.discount;
        return {
          receiptItemId: it.receiptItemId,
          productName: it.productName,
          unit: it.unit,
          sellingPrice,
          discount: discountPct,
          originalQuantity: it.originalQuantity,
          alreadyReturned: it.alreadyReturned,
          remainingReturnable: it.remainingReturnable,
          quantity: qty,
          totalPrice: lineTotal(qty, sellingPrice, discountPct),
        };
      });
  }, [readOnly, initialData, returnableItems, lines]);

  const subTotal = useMemo(
    () =>
      round2(displayItems.reduce((sum, it) => sum + it.totalPrice, 0)),
    [displayItems],
  );
  const discVal = Math.max(0, Number(discount) || 0);
  const totalAmount = round2(Math.max(0, subTotal - discVal));
  const maxRefundable = round2(previousDue + totalAmount);

  // Default refunded amount = this return's net credit (create flow)
  useEffect(() => {
    if (readOnly || isEditing || refundTouchedRef.current) return;
    setRefundedAmount(String(totalAmount));
  }, [totalAmount, readOnly, isEditing]);

  const refunded = Math.min(
    Math.max(0, Number(refundedAmount) || 0),
    maxRefundable,
  );

  const previousPosition = useMemo(() => {
    if (readOnly) {
      return (
        initialData?.previousPosition || { netDue: 0, netRefundable: 0 }
      );
    }
    return (
      returnableRes?.data?.previousPosition ||
      initialData?.previousPosition || {
        netDue: 0,
        netRefundable: 0,
      }
    );
  }, [
    readOnly,
    initialData?.previousPosition,
    returnableRes?.data?.previousPosition,
  ]);

  const currentPosition = useMemo(() => {
    if (readOnly && initialData?.currentPosition) {
      return initialData.currentPosition;
    }
    return derivePositionAfterReturn(previousPosition, totalAmount, refunded);
  }, [
    readOnly,
    initialData?.currentPosition,
    previousPosition,
    totalAmount,
    refunded,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    if (!receiptId) {
      toast.error("Please select a source receipt");
      return;
    }

    const items = Object.entries(lines)
      .filter(([, v]) => v.selected && v.quantity > 0)
      .map(([receiptItemId, v]) => ({
        receiptItemId,
        quantity: Number(v.quantity),
        sellingPrice: Math.max(0, Number(v.sellingPrice) || 0),
        discount: Math.max(0, Math.min(100, Number(v.discount) || 0)),
      }));

    if (items.length === 0) {
      toast.error("Select at least one product to return");
      return;
    }

    for (const item of items) {
      const meta = returnableItems.find(
        (r) => r.receiptItemId === item.receiptItemId,
      );
      if (!meta) continue;
      if (item.quantity > meta.remainingReturnable) {
        toast.error(
          `"${meta.productName}" quantity cannot exceed ${meta.remainingReturnable}`,
        );
        return;
      }
    }

    if (refunded > maxRefundable) {
      toast.error(
        `Refunded amount cannot exceed previous due + net credit (৳${maxRefundable.toFixed(2)})`,
      );
      return;
    }

    const payload = {
      ...(isEditing ? {} : { receiptId }),
      items,
      discount: discVal,
      refundedAmount: refunded,
      note: note.trim() || null,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateReturn({
          id: initialData.id,
          body: payload,
        }).unwrap();
        toast.success("Return invoice updated successfully");
        (res?.data?.warnings || []).forEach((w: string) => toast.warning(w));
        router.push(`/return-invoices/${initialData.id}`);
      } else {
        const res = await createReturn(payload).unwrap();
        toast.success("Return invoice created successfully");
        const id = res?.data?.returnInvoice?.id;
        router.push(id ? `/return-invoices/${id}` : "/return-invoices");
      }
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const receiptLabel =
    returnableReceipt?.receiptNumber ||
    selectedReceipt?.receiptNumber ||
    initialData?.receipt?.receiptNumber ||
    "";

  const customerName =
    returnableReceipt?.customer?.name ||
    selectedReceipt?.customer?.name ||
    initialData?.receipt?.customer?.name ||
    "";

  const previousReturnNumber =
    previousReturn?.returnNumber ||
    initialData?.previousReturnInvoice?.returnNumber;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!readOnly && (
        <div className="sticky top-2 z-30 flex items-center justify-between gap-3 p-3 -mx-2 rounded-xl bg-background/95 backdrop-blur border border-border shadow-xs">
          <Link
            href="/return-invoices"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to Return Invoices
          </Link>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => router.push("/return-invoices")}
            >
              <X className="size-3.5 mr-1" /> Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs gap-1.5"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {isEditing ? "Update Return" : "Create Return"}
            </Button>
          </div>
        </div>
      )}

      {/* Source receipt */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Source Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {readOnly || isEditing ? (
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Receipt: </span>
                <Link
                  href={`/receipts/${receiptId || initialData?.receiptId}`}
                  className="font-mono font-semibold text-primary hover:underline"
                >
                  {receiptLabel}
                </Link>
              </p>
              {customerName && (
                <p>
                  <span className="text-muted-foreground">Customer: </span>
                  <span className="font-medium">{customerName}</span>
                </p>
              )}
              {previousReturnNumber && (
                <p>
                  <span className="text-muted-foreground">Previous return: </span>
                  <Link
                    href={`/return-invoices/${previousReturn?.id || initialData?.previousReturnInvoiceId}`}
                    className="font-mono font-semibold text-primary hover:underline"
                  >
                    {previousReturnNumber}
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    · refund due ৳{previousDue.toFixed(2)}
                  </span>
                </p>
              )}
            </div>
          ) : preselectedReceiptId ? (
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Receipt: </span>
                <span className="font-mono font-semibold">
                  {receiptLabel || "…"}
                </span>
              </p>
              {customerName && (
                <p>
                  <span className="text-muted-foreground">Customer: </span>
                  {customerName}
                </p>
              )}
              {previousReturnNumber && (
                <p>
                  <span className="text-muted-foreground">Previous return: </span>
                  <span className="font-mono font-semibold">
                    {previousReturnNumber}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    · refund due ৳{previousDue.toFixed(2)}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs">Select receipt *</Label>
              <ReceiptSelect
                receipts={receiptsRes?.data || []}
                selectedReceiptId={receiptId}
                selectedReceipt={selectedReceipt}
                isLoading={isReceiptsLoading}
                onSelect={(id) => setReceiptId(id)}
                onClear={() => {
                  setReceiptId("");
                  setReceiptSearch("");
                }}
                onSearch={handleReceiptSearch}
              />
              {receiptId && customerName && (
                <p className="text-xs text-muted-foreground">
                  Customer:{" "}
                  <span className="font-medium text-foreground">
                    {customerName}
                  </span>
                </p>
              )}
              {receiptId && previousReturnNumber && (
                <p className="text-xs text-muted-foreground">
                  Previous return{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {previousReturnNumber}
                  </span>{" "}
                  · refund due ৳{previousDue.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="size-4" /> Return Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!receiptId && !readOnly ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Select a receipt to load returnable products.
            </p>
          ) : isReturnableLoading || isReturnableFetching ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : readOnly ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="py-2 pr-2 w-8">#</th>
                    <th className="py-2 pr-2">Product</th>
                    <th className="py-2 pr-2">Unit</th>
                    <th className="py-2 pr-2 text-right">Qty</th>
                    <th className="py-2 pr-2 text-right">Price</th>
                    <th className="py-2 pr-2 text-right">Disc %</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((it, index) => (
                    <tr
                      key={it.receiptItemId}
                      className="border-b border-border/50"
                    >
                      <td className="py-2 pr-2 font-mono text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="py-2 pr-2 font-medium">{it.productName}</td>
                      <td className="py-2 pr-2">{it.unit}</td>
                      <td className="py-2 pr-2 text-right font-mono">
                        {it.quantity}
                      </td>
                      <td className="py-2 pr-2 text-right font-mono">
                        ৳{it.sellingPrice}
                      </td>
                      <td className="py-2 pr-2 text-right font-mono">
                        {it.discount > 0 ? `${it.discount}%` : "—"}
                      </td>
                      <td className="py-2 text-right font-mono font-semibold">
                        ৳{it.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : returnableItems.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No returnable products left on this receipt.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid md:grid-cols-[3.25rem_minmax(0,3.2fr)_1.3fr_1.6fr_1.3fr_1.6fr] gap-2 px-3 py-1 text-xs font-semibold text-muted-foreground border-b border-border/40">
                <div className="text-center">#</div>
                <div>Product</div>
                <div className="text-right">Qty *</div>
                <div className="text-right">Price (৳) *</div>
                <div className="text-right">Disc (%)</div>
                <div className="text-right">Total (৳)</div>
              </div>
              {returnableItems.map((item, index) => {
                const line = lines[item.receiptItemId] || {
                  selected: false,
                  quantity: item.remainingReturnable > 0 ? 1 : 0,
                  sellingPrice: item.sellingPrice,
                  discount: item.discount,
                };
                const disabled = item.remainingReturnable <= 0;
                const fieldsDisabled = !line.selected || disabled || readOnly;
                const rowTotal = lineTotal(
                  line.quantity,
                  line.sellingPrice,
                  line.discount,
                );
                const patchLine = (patch: Partial<LineState>) => {
                  setLines((prev) => {
                    const current = prev[item.receiptItemId] || line;
                    return {
                      ...prev,
                      [item.receiptItemId]: { ...current, ...patch },
                    };
                  });
                };
                return (
                  <div
                    key={item.receiptItemId}
                    className={cn(
                      "rounded-xl border p-2.5 space-y-2",
                      line.selected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/70",
                      disabled && "opacity-50",
                    )}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[3.25rem_minmax(0,3.2fr)_1.3fr_1.6fr_1.3fr_1.6fr] gap-2 items-center">
                      <div className="flex items-center gap-1.5 md:justify-center">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary cursor-pointer"
                          checked={line.selected}
                          disabled={disabled || readOnly}
                          onChange={(e) => {
                            patchLine({
                              selected: e.target.checked,
                              quantity:
                                line.quantity > 0
                                  ? line.quantity
                                  : Math.min(1, item.remainingReturnable),
                            });
                          }}
                        />
                        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-mono font-semibold text-muted-foreground">
                          {index + 1}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Sold {item.originalQuantity} · Returned{" "}
                          {item.alreadyReturned} · Left{" "}
                          {item.remainingReturnable} {item.unit}
                        </p>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Qty *
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={item.remainingReturnable}
                          step="any"
                          disabled={fieldsDisabled}
                          value={line.quantity}
                          onChange={(e) => {
                            const qty = Math.min(
                              Math.max(0, Number(e.target.value) || 0),
                              item.remainingReturnable,
                            );
                            patchLine({
                              quantity: qty,
                              selected: qty > 0 ? true : line.selected,
                            });
                          }}
                          className="h-8 text-xs font-mono text-right"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Price (৳) *
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          disabled={fieldsDisabled}
                          value={line.sellingPrice}
                          onChange={(e) =>
                            patchLine({
                              sellingPrice: Math.max(
                                0,
                                Number(e.target.value) || 0,
                              ),
                            })
                          }
                          className="h-8 text-xs font-mono text-right"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Disc (%)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          disabled={fieldsDisabled}
                          value={line.discount}
                          onChange={(e) =>
                            patchLine({
                              discount: Math.max(
                                0,
                                Math.min(100, Number(e.target.value) || 0),
                              ),
                            })
                          }
                          className="h-8 text-xs font-mono text-right"
                        />
                      </div>

                      <div className="text-right">
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Total (৳)
                        </label>
                        <span className="text-sm font-semibold font-mono text-foreground block">
                          ৳{rowTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Return Totals</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Overall discount (৳)</Label>
              <Input
                type="number"
                min={0}
                step="any"
                value={discount}
                disabled={readOnly}
                onChange={(e) => setDiscount(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                Refunded amount (৳)
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · max ৳{maxRefundable.toFixed(2)}
                </span>
              </Label>
              <Input
                type="number"
                min={0}
                max={maxRefundable}
                step="any"
                value={refundedAmount}
                disabled={readOnly}
                onChange={(e) => {
                  refundTouchedRef.current = true;
                  setRefundedAmount(e.target.value);
                }}
                className="h-8 text-xs font-mono"
              />
              {!readOnly && !isEditing && (
                <p className="text-[11px] text-muted-foreground">
                  Defaults to this return&apos;s net credit.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Note</Label>
              <Textarea
                value={note}
                disabled={readOnly}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
          <div className="rounded-xl border border-border/70 p-4 space-y-2 text-sm h-fit">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono font-semibold">
                +৳{subTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-mono font-semibold text-rose-600">
                -৳{discVal.toFixed(2)}
              </span>
            </div>

            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-mono font-bold">
                  +৳{totalAmount.toFixed(2)}
                </span>
              </div>

              {previousPosition.netDue > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Previous Customer Due
                  </span>
                  <span className="font-mono font-semibold text-rose-600">
                    -৳{previousPosition.netDue.toFixed(2)}
                  </span>
                </div>
              ) : previousPosition.netRefundable > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Previous Refund Due
                  </span>
                  <span className="font-mono font-semibold">
                    +৳{previousPosition.netRefundable.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous Due</span>
                  <span className="font-mono font-semibold text-rose-600">
                    -৳0.00
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Refund</span>
                <span className="font-mono font-semibold text-rose-600">
                  -৳{refunded.toFixed(2)}
                </span>
              </div>

              {currentPosition.netRefundable > 0 ? (
                <div className="flex justify-between border-t-2 border-foreground pt-2">
                  <span className="font-bold">Refund Due</span>
                  <span className="font-mono font-extrabold text-rose-600">
                    ৳{currentPosition.netRefundable.toFixed(2)}
                  </span>
                </div>
              ) : currentPosition.netDue > 0 ? (
                <div className="flex justify-between border-t-2 border-foreground pt-2">
                  <span className="font-bold">Customer Due</span>
                  <span className="font-mono font-extrabold text-rose-600">
                    ৳{currentPosition.netDue.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between border-t-2 border-foreground pt-2">
                  <span className="font-bold">Balance</span>
                  <span className="font-mono font-extrabold">৳0.00</span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground pt-1">
              {currentPosition.netRefundable > 0
                ? "Shop needs to pay the customer"
                : currentPosition.netDue > 0
                  ? "Customer still owes on this bill"
                  : "Bill is settled after this return"}
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAddPaymentMutation } from "@/redux/api/receiptApi";
import { TReceipt } from "@/types";
import { Banknote, CheckCircle2 } from "lucide-react";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";

interface AddPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: TReceipt | null;
}

export default function AddPaymentModal({
  open,
  onOpenChange,
  receipt,
}: AddPaymentModalProps) {
  const [addPayment, { isLoading }] = useAddPaymentMutation();
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (receipt) {
      setAmount(receipt.dueAmount > 0 ? String(receipt.dueAmount) : "");
      setNote("");
      setError("");
    }
  }, [receipt, open]);

  if (!receipt) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid positive payment amount");
      return;
    }

    if (numAmount > receipt.dueAmount) {
      setError(`Payment amount cannot exceed the remaining due of ৳${receipt.dueAmount}`);
      return;
    }

    try {
      await addPayment({
        id: receipt.id,
        amount: numAmount,
        note: note.trim() || null,
      }).unwrap();

      toast.success(`Payment of ৳${numAmount} recorded successfully!`);
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Banknote className="size-5 text-primary" />
            Add Due Payment
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Financial Overview */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Receipt Number:</span>
            <span className="font-mono font-semibold text-foreground">{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium text-foreground">{receipt.customer?.name}</span>
          </div>
          <div className="flex justify-between items-center border-t border-border/40 pt-2">
            <span className="text-muted-foreground">Total Bill:</span>
            <span className="font-medium text-foreground">৳{receipt.totalAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Already Paid:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">৳{receipt.paidAmount}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-semibold border-t border-border/40 pt-2">
            <span className="text-destructive">Remaining Due:</span>
            <span className="font-mono text-destructive">৳{receipt.dueAmount}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="payment-amount">Payment Amount (৳) *</Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={receipt.dueAmount}
              placeholder={`e.g. ${receipt.dueAmount}`}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              required
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-note">Payment Note (Optional)</Label>
            <Textarea
              id="payment-note"
              placeholder="e.g. Paid via bKash / Cash installment"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || receipt.dueAmount <= 0}>
              {isLoading ? (
                "Recording..."
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" /> Record Payment
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

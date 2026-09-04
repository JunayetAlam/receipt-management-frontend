"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useCreateReceiptMutation,
  useUpdateReceiptMutation,
} from "@/redux/api/receiptApi";
import { useGetAllProductsQuery } from "@/redux/api/productApi";
import {
  useGetAllCustomersQuery,
  useLazyLookupCustomerByPhoneQuery,
  useCreateCustomerMutation,
} from "@/redux/api/customerApi";
import { useGetMeQuery } from "@/redux/api/userApi";
import { ProductUnit, TReceipt, TReceiptFormItem, TCustomer, TProduct } from "@/types";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";
import CustomPhoneInput from "@/components/Forms/CustomPhoneInput";
import CustomerSelect from "./CustomerSelect";
import ProductSelect from "./ProductSelect";
import ConfirmPopup from "@/components/Global/ConfirmPopup";
import {
  Plus,
  X,
  AlertTriangle,
  Lock,
  Receipt,
  User,
  Package,
  Save,
  ArrowLeft,
  Search,
  CheckCircle2,
  Unlock,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const PRODUCT_UNITS: ProductUnit[] = [
  "PIECE",
  "KG",
  "GRAM",
  "LITER",
  "METER",
  "PACKET",
  "BOX",
  "OTHER",
];

interface FormItemState extends TReceiptFormItem {
  tempId: string;
}

interface ReceiptFormProps {
  initialData?: TReceipt;
  isEditing?: boolean;
}

export default function ReceiptForm({ initialData, isEditing = false }: ReceiptFormProps) {
  const router = useRouter();

  // Redux APIs
  const { data: meData } = useGetMeQuery(undefined);
  const isCashier = meData?.data?.role === "CASHIER";
  const isApprovedAndCashier = isEditing && initialData?.status === "APPROVED" && isCashier;

  const [createReceipt, { isLoading: isCreating }] = useCreateReceiptMutation();
  const [updateReceipt, { isLoading: isUpdating }] = useUpdateReceiptMutation();

  const { data: productsResponse, isLoading: isProductsLoading } = useGetAllProductsQuery({
    isDeleted: false,
    limit: 250,
  });
  const products = productsResponse?.data || [];

  const { data: customersResponse, isLoading: isCustomersLoading } = useGetAllCustomersQuery({
    isDeleted: false,
    limit: 250,
  });
  const customers = customersResponse?.data || [];

  // Customer API mutations and queries
  const [triggerLookup, { isFetching: isLookingUp }] = useLazyLookupCustomerByPhoneQuery();
  const [createCustomerMutation, { isLoading: isCreatingCustomer }] = useCreateCustomerMutation();

  // Unified Customer Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    initialData?.customerId || null
  );
  const [customerName, setCustomerName] = useState<string>(
    initialData?.customer?.name || ""
  );
  const [customerCountryCode, setCustomerCountryCode] = useState<string>(
    initialData?.customer?.countryCode || "+880"
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    initialData?.customer?.phoneNumber || ""
  );
  const [customerEmail, setCustomerEmail] = useState<string>(
    initialData?.customer?.email || ""
  );
  const [customerAddress, setCustomerAddress] = useState<string>(
    initialData?.customer?.address || ""
  );
  const [isCustomerLocked, setIsCustomerLocked] = useState<boolean>(
    Boolean(initialData?.customerId)
  );

  // Items State
  const [items, setItems] = useState<FormItemState[]>([
    {
      tempId: "init-1",
      productId: null,
      productName: "",
      unit: "PIECE",
      sellingPrice: 0,
      quantity: 1,
      discount: 0,
      availableStock: null,
    },
  ]);

  // Overall Financials
  const [receiptDiscount, setReceiptDiscount] = useState<string>(
    initialData ? String(initialData.discount || 0) : "0"
  );
  const [paidAmount, setPaidAmount] = useState<string>(
    initialData ? String(initialData.paidAmount || 0) : "0"
  );
  const [note, setNote] = useState<string>(initialData?.note || "");

  // Initialize from initialData for update mode
  useEffect(() => {
    if (initialData) {
      setSelectedCustomerId(initialData.customerId || null);
      setReceiptDiscount(String(initialData.discount || 0));
      setPaidAmount(String(initialData.paidAmount || 0));
      setNote(initialData.note || "");

      if (initialData.customer) {
        setCustomerName(initialData.customer.name || "");
        setCustomerPhone(initialData.customer.phoneNumber || "");
        setCustomerCountryCode(initialData.customer.countryCode || "+880");
        setCustomerEmail(initialData.customer.email || "");
        setCustomerAddress(initialData.customer.address || "");
        setIsCustomerLocked(true);
      }

      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((it, idx) => ({
            tempId: it.id || `item-${idx}`,
            productId: it.productId || null,
            productName: it.productName,
            unit: it.unit,
            sellingPrice: Number(it.sellingPrice) || 0,
            quantity: Number(it.quantity) || 1,
            discount: Number(it.discount) || 0,
            availableStock: it.product?.stock ?? null,
          }))
        );
      }
    }
  }, [initialData]);

  // Customer handlers
  const handleSelectCustomer = (cust: TCustomer) => {
    setSelectedCustomerId(cust.id);
    setCustomerName(cust.name);
    setCustomerCountryCode(cust.countryCode || "+880");
    setCustomerPhone(cust.phoneNumber || "");
    setCustomerEmail(cust.email || "");
    setCustomerAddress(cust.address || "");
    setIsCustomerLocked(true);
  };

  const handleNameChange = (name: string) => {
    setCustomerName(name);
    setSelectedCustomerId(null);
    setIsCustomerLocked(false);
  };

  const handleClearCustomer = () => {
    setSelectedCustomerId(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerCountryCode("+880");
    setCustomerEmail("");
    setCustomerAddress("");
    setIsCustomerLocked(false);
  };

  const handleUnlockCustomer = () => {
    setIsCustomerLocked(false);
  };

  // Confirm / Verify customer by phone number
  const handleConfirmCustomer = async () => {
    const rawPhone = customerPhone.trim();
    if (!rawPhone || rawPhone.length < 4) {
      toast.error("Please enter a valid phone number (minimum 4 digits) to confirm");
      return;
    }

    try {
      const res = await triggerLookup({
        phoneNumber: rawPhone,
        countryCode: customerCountryCode,
      }).unwrap();

      const matched = res?.data;

      // Case 1: Active customer exists in DB
      if (matched && !matched.isDeleted) {
        setSelectedCustomerId(matched.id);
        setCustomerName(matched.name);
        setCustomerCountryCode(matched.countryCode || customerCountryCode);
        setCustomerPhone(matched.phoneNumber);
        setCustomerEmail(matched.email || "");
        setCustomerAddress(matched.address || "");
        setIsCustomerLocked(true);
        toast.success(`Customer verified: ${matched.name}`);
        return;
      }

      // Case 2: Soft-deleted customer exists in DB -> Reactivate with current details
      if (matched && matched.isDeleted) {
        const createRes = await createCustomerMutation({
          name: customerName.trim() || matched.name,
          countryCode: customerCountryCode,
          phoneNumber: matched.phoneNumber,
          email: customerEmail.trim() || undefined,
          address: customerAddress.trim() || undefined,
        }).unwrap();

        const reactivated = createRes?.data;
        if (reactivated) {
          setSelectedCustomerId(reactivated.id);
          setCustomerName(reactivated.name);
          setCustomerCountryCode(reactivated.countryCode || customerCountryCode);
          setCustomerPhone(reactivated.phoneNumber);
          setCustomerEmail(reactivated.email || "");
          setCustomerAddress(reactivated.address || "");
          setIsCustomerLocked(true);
          toast.success(`Customer reactivated & details updated: ${reactivated.name}`);
        }
        return;
      }

      // Case 3: Customer not found -> Create new customer on the fly
      const fallbackName = customerName.trim() || `Customer-${rawPhone.slice(-4)}`;
      const createRes = await createCustomerMutation({
        name: fallbackName,
        countryCode: customerCountryCode,
        phoneNumber: rawPhone,
        email: customerEmail.trim() || undefined,
        address: customerAddress.trim() || undefined,
      }).unwrap();

      const created = createRes?.data;
      if (created) {
        setSelectedCustomerId(created.id);
        setCustomerName(created.name);
        setCustomerCountryCode(created.countryCode || customerCountryCode);
        setCustomerPhone(created.phoneNumber);
        setCustomerEmail(created.email || "");
        setCustomerAddress(created.address || "");
        setIsCustomerLocked(true);
        toast.success(`New customer created and linked: ${created.name}`);
      }
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  // Product Selection Handlers
  const handleSelectProduct = (tempId: string, product: TProduct) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.tempId !== tempId) return it;
        return {
          ...it,
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          sellingPrice: product.sellingPrice,
          availableStock: product.stock,
        };
      })
    );
  };

  const handleCustomProductNameChange = (tempId: string, name: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.tempId !== tempId) return it;
        return {
          ...it,
          productId: null,
          productName: name,
          availableStock: null,
        };
      })
    );
  };

  const handleClearProduct = (tempId: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.tempId !== tempId) return it;
        return {
          ...it,
          productId: null,
          productName: "",
          availableStock: null,
        };
      })
    );
  };

  // Handle row item changes
  const handleItemChange = (tempId: string, field: keyof FormItemState, value: any) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.tempId !== tempId) return it;

        if (field === "productId") {
          if (value === "custom") {
            return {
              ...it,
              productId: null,
              productName: "",
              sellingPrice: 0,
              availableStock: null,
            };
          }
          const chosen = products.find((p) => p.id === value);
          if (chosen) {
            return {
              ...it,
              productId: chosen.id,
              productName: chosen.name,
              unit: chosen.unit,
              sellingPrice: chosen.sellingPrice,
              availableStock: chosen.stock,
            };
          }
        }

        return { ...it, [field]: value };
      })
    );
  };

  // Add new item row
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        tempId: `item-${Date.now()}-${Math.random()}`,
        productId: null,
        productName: "",
        unit: "PIECE",
        sellingPrice: 0,
        quantity: 1,
        discount: 0,
        availableStock: null,
      },
    ]);
  };

  // Remove item row
  const handleRemoveItem = (tempId: string) => {
    if (items.length <= 1) {
      toast.error("At least one item is required in the receipt");
      return;
    }
    setItems((prev) => prev.filter((it) => it.tempId !== tempId));
  };

  // Multi-Row Aggregated Product Quantities
  const productAggregatedQuantities = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      if (it.productId) {
        const current = map.get(it.productId) || 0;
        map.set(it.productId, current + (Number(it.quantity) || 0));
      }
    });
    return map;
  }, [items]);

  // Calculations per row and overall totals
  const { calculatedRows, subTotal, totalAmount, dueAmount } = useMemo(() => {
    let sub = 0;

    const rows = items.map((it) => {
      const qty = Math.max(0, Number(it.quantity) || 0);
      const price = Math.max(0, Number(it.sellingPrice) || 0);
      const discPercent = Math.max(0, Math.min(100, Number(it.discount) || 0));

      const rowSubtotal = Math.round(qty * price * 100) / 100;
      const rowDiscountAmount = Math.round(((rowSubtotal * discPercent) / 100) * 100) / 100;
      const rowTotal = Math.round(Math.max(0, rowSubtotal - rowDiscountAmount) * 100) / 100;

      sub = Math.round((sub + rowTotal) * 100) / 100;

      return {
        ...it,
        rowSubtotal,
        rowDiscountAmount,
        rowTotal,
      };
    });

    const receiptDisc = Math.max(0, Number(receiptDiscount) || 0);
    const tot = Math.round(Math.max(0, sub - receiptDisc) * 100) / 100;
    const paid = Math.max(0, Number(paidAmount) || 0);
    const due = Math.round(Math.max(0, tot - paid) * 100) / 100;

    return {
      calculatedRows: rows,
      subTotal: sub,
      totalAmount: tot,
      dueAmount: due,
    };
  }, [items, receiptDiscount, paidAmount]);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isApprovedAndCashier) {
      toast.error("Approved receipts cannot be modified by cashiers.");
      return;
    }

    // Customer Validation
    let customerPayload: any = {};
    if (selectedCustomerId) {
      customerPayload.customerId = selectedCustomerId;
      if (customerPhone.trim()) {
        customerPayload.customerPhone = customerPhone.trim();
        customerPayload.countryCode = customerCountryCode;
      }
      if (customerName.trim()) {
        customerPayload.customerName = customerName.trim();
      }
      if (customerAddress.trim()) {
        customerPayload.customerAddress = customerAddress.trim();
      }
      if (customerEmail.trim()) {
        customerPayload.customerEmail = customerEmail.trim();
      }
    } else {
      if (!customerPhone.trim()) {
        toast.error("Customer phone number is required");
        return;
      }
      customerPayload.countryCode = customerCountryCode;
      customerPayload.customerPhone = customerPhone.trim();
      customerPayload.customerName = customerName.trim() || undefined;
      customerPayload.customerEmail = customerEmail.trim() || undefined;
      customerPayload.customerAddress = customerAddress.trim() || undefined;
    }

    // Items Validation
    if (items.length === 0) {
      toast.error("Please add at least one product item");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productName.trim()) {
        toast.error(`Item #${i + 1} must have a product name`);
        return;
      }
      if (Number(it.quantity) <= 0) {
        toast.error(`Item #${i + 1} quantity must be greater than 0`);
        return;
      }
      if (Number(it.sellingPrice) < 0) {
        toast.error(`Item #${i + 1} selling price cannot be negative`);
        return;
      }
    }

    const payload = {
      ...customerPayload,
      items: items.map((it) => ({
        productId: it.productId || null,
        productName: it.productName.trim(),
        unit: it.unit,
        sellingPrice: Number(it.sellingPrice),
        quantity: Number(it.quantity),
        discount: Number(it.discount) || 0,
      })),
      discount: Number(receiptDiscount) || 0,
      paidAmount: Number(paidAmount) || 0,
      note: note.trim() || null,
    };

    try {
      if (isEditing && initialData) {
        await updateReceipt({ id: initialData.id, body: payload }).unwrap();
        toast.success("Receipt updated successfully!");
      } else {
        await createReceipt(payload).unwrap();
        toast.success("Receipt created successfully!");
      }
      router.push("/receipts");
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role-Lock Banner for Cashier on Approved Receipt */}
      {isApprovedAndCashier && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-sm font-medium">
          <Lock className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold">Locked: Receipt is Approved</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This receipt has been approved by an administrator and cannot be modified by cashiers. You can record customer due payments via the &quot;Add Payment&quot; button in the table.
            </p>
          </div>
        </div>
      )}

      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/receipts"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Receipts
        </Link>
        {initialData?.status && (
          <Badge
            className={
              initialData.status === "APPROVED"
                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                : initialData.status === "REJECTED"
                ? "bg-destructive/15 text-destructive border-destructive/30"
                : "bg-amber-500/15 text-amber-600 border-amber-500/30"
            }
          >
            {initialData.status}
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {/* Customer Selection Card */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="size-4 text-primary" /> Customer Details
                </CardTitle>
                <div className="flex items-center gap-2">
                  {selectedCustomerId && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 border border-emerald-500/20">
                      <CheckCircle2 className="size-3.5" /> Customer Linked
                    </span>
                  )}
                  {isCustomerLocked ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUnlockCustomer}
                      className="h-8 px-2.5 text-xs rounded-xl border-border/60 hover:bg-accent flex items-center gap-1 cursor-pointer"
                      title="Unlock fields to edit details manually"
                    >
                      <Unlock className="size-3.5 text-primary" /> Edit / Unlock
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        isApprovedAndCashier ||
                        isLookingUp ||
                        isCreatingCustomer ||
                        !customerPhone ||
                        customerPhone.length < 4
                      }
                      onClick={handleConfirmCustomer}
                      className="h-8 px-3 text-xs rounded-xl border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer"
                      title="Verify existing customer or register new customer"
                    >
                      {isLookingUp || isCreatingCustomer ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="size-3.5 mr-1" />
                          Confirm
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Customer Name (React Select) */}
                <div className="space-y-1.5">
                  <Label htmlFor="customer-name" className="text-sm font-medium">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <CustomerSelect
                    customers={customers}
                    selectedCustomerId={selectedCustomerId}
                    valueName={customerName}
                    onSelectCustomer={handleSelectCustomer}
                    onNameChange={handleNameChange}
                    onClear={handleClearCustomer}
                    disabled={isApprovedAndCashier}
                    isLoading={isCustomersLoading}
                    placeholder="Search customer by name or phone, or type new..."
                  />
                </div>

                {/* 2. Customer Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="customer-phone" className="text-sm font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <CustomPhoneInput
                    name="customer-phone"
                    country="bd"
                    disabled={isApprovedAndCashier || isCustomerLocked}
                    value={
                      customerPhone
                        ? customerPhone.startsWith("+")
                          ? customerPhone
                          : `${customerCountryCode}${customerPhone}`
                        : customerCountryCode
                    }
                    onChange={(val: string, data: any) => {
                      if (data && data.dialCode) {
                        setCustomerCountryCode(`+${data.dialCode}`);
                        const raw = val.slice(data.dialCode.length).trim();
                        setCustomerPhone(raw);
                      } else {
                        setCustomerPhone(val);
                      }
                      if (selectedCustomerId && !isCustomerLocked) {
                        setSelectedCustomerId(null);
                      }
                    }}
                  />
                </div>

                {/* 3. Customer Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="customer-email" className="text-sm font-medium">
                    Email (Optional)
                  </Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="e.g. rahim@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={isApprovedAndCashier || isCustomerLocked}
                  />
                </div>

                {/* 4. Customer Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="customer-address" className="text-sm font-medium">
                    Address (Optional)
                  </Label>
                  <Input
                    id="customer-address"
                    placeholder="e.g. Dhanmondi, Dhaka"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    disabled={isApprovedAndCashier || isCustomerLocked}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Product Items Card */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Receipt className="size-4 text-primary" /> Receipt Items & Billing ({items.length})
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                  disabled={isApprovedAndCashier}
                  className="gap-1 text-xs"
                >
                  <Plus className="size-3.5" /> Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {/* Desktop Column Headers for Clean 1-Line Table View */}
              <div className="hidden md:grid md:grid-cols-[4fr_1.8fr_1.4fr_2fr_1.4fr_2fr] gap-2 px-3 py-1 text-xs font-semibold text-muted-foreground border-b border-border/40">
                <div>Product Name *</div>
                <div>Unit</div>
                <div className="text-right">Qty *</div>
                <div className="text-right">Price (BDT) *</div>
                <div className="text-right">Disc (%)</div>
                <div className="text-right">Total (BDT)</div>
              </div>

              {calculatedRows.map((it, index) => {
                const totalRequestedForThisProduct = it.productId
                  ? productAggregatedQuantities.get(it.productId) || 0
                  : 0;
                const hasStockWarning =
                  it.productId &&
                  it.availableStock !== null &&
                  it.availableStock !== undefined &&
                  totalRequestedForThisProduct > it.availableStock;

                return (
                  <div
                    key={it.tempId}
                    className={`relative rounded-xl border p-2.5 space-y-2 transition-colors ${
                      hasStockWarning
                        ? "border-amber-500/60 bg-amber-500/5 dark:bg-amber-500/10"
                        : "border-border/70 bg-card hover:border-border"
                    }`}
                  >
                    {/* Top-Right Corner Cross Button */}
                    {items.length > 1 && (
                      <div className="absolute -top-2.5 -right-2.5 z-10">
                        <ConfirmPopup
                          title="Remove Product"
                          description={`Are you sure you want to remove ${
                            it.productName ? `"${it.productName}"` : "this product"
                          } from the receipt?`}
                          confirmLabel="Remove"
                          cancelLabel="Cancel"
                          destructive
                          side="top"
                          align="end"
                          onConfirm={() => handleRemoveItem(it.tempId)}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={isApprovedAndCashier}
                            className="size-5 rounded-full bg-background border border-border shadow-xs hover:bg-destructive hover:text-destructive-foreground hover:border-destructive text-muted-foreground transition-all cursor-pointer"
                            title="Remove product"
                          >
                            <X className="size-3" />
                          </Button>
                        </ConfirmPopup>
                      </div>
                    )}

                    {/* Stock shortage warning badge */}
                    {hasStockWarning && (
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-500/15 text-amber-900 dark:text-amber-200 text-xs font-medium border border-amber-500/30">
                        <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>
                          Warning: Requested ({totalRequestedForThisProduct} {it.unit}) exceeds stock ({it.availableStock} {it.unit}).
                        </span>
                      </div>
                    )}

                    {/* All Inputs in One Single Line (on md+) */}
                    <div className="grid grid-cols-1 md:grid-cols-[4fr_1.8fr_1.4fr_2fr_1.4fr_2fr] gap-2 items-center">
                      {/* 1. Merged Product Name & Selection (React Select) */}
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Product Name *
                        </label>
                        <ProductSelect
                          products={products}
                          selectedProductId={it.productId}
                          valueName={it.productName}
                          onSelectProduct={(prod) => handleSelectProduct(it.tempId, prod)}
                          onNameChange={(name) => handleCustomProductNameChange(it.tempId, name)}
                          onClear={() => handleClearProduct(it.tempId)}
                          disabled={isApprovedAndCashier || isProductsLoading}
                          placeholder="Search product or type custom name..."
                        />
                      </div>

                      {/* 2. Unit (Locked when product selected from DB, unlocked if custom or cleared) */}
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Unit
                        </label>
                        <Select
                          value={it.unit}
                          onValueChange={(val) => handleItemChange(it.tempId, "unit", val as ProductUnit)}
                          disabled={isApprovedAndCashier || it.productId !== null}
                        >
                          <SelectTrigger className="w-full h-8 text-xs font-mono rounded-2xl bg-input/50 border-transparent disabled:opacity-60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_UNITS.map((u) => (
                              <SelectItem key={u} value={u} className="text-xs font-mono">
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 3. Quantity */}
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Qty *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={it.quantity}
                          onChange={(e) =>
                            handleItemChange(it.tempId, "quantity", Number(e.target.value))
                          }
                          disabled={isApprovedAndCashier}
                          className="text-xs font-mono text-right"
                        />
                      </div>

                      {/* 4. Unit Price (Editable!) */}
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Price (BDT) *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={it.sellingPrice}
                          onChange={(e) =>
                            handleItemChange(it.tempId, "sellingPrice", Number(e.target.value))
                          }
                          disabled={isApprovedAndCashier}
                          className="text-xs font-mono text-right"
                        />
                      </div>

                      {/* 5. Discount % */}
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Disc (%)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={it.discount}
                          onChange={(e) =>
                            handleItemChange(it.tempId, "discount", Number(e.target.value))
                          }
                          disabled={isApprovedAndCashier}
                          className="text-xs font-mono text-right"
                        />
                      </div>

                      {/* 6. Total (BDT) */}
                      <div className="text-right">
                        <label className="text-[11px] font-medium text-muted-foreground md:hidden block mb-1">
                          Total (BDT)
                        </label>
                        <span className="text-xs font-bold font-mono text-foreground block">
                          {it.rowTotal.toFixed(2)}
                        </span>
                        {it.rowDiscountAmount > 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block">
                            -{it.rowDiscountAmount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Billing & Payment Calculations */}
              <div className="pt-5 mt-4 border-t border-border/70 space-y-4 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Items Subtotal (BDT):</span>
                  <span className="font-mono font-semibold text-foreground">{subTotal}</span>
                </div>

                {/* Solid Receipt-Level Discount */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/60">
                  <Label htmlFor="receipt-discount" className="text-xs text-muted-foreground">
                    Receipt Discount (BDT)
                  </Label>
                  <div className="w-40 sm:w-52">
                    <Input
                      id="receipt-discount"
                      type="number"
                      step="1"
                      min="0"
                      max={subTotal}
                      placeholder="0"
                      value={receiptDiscount}
                      onChange={(e) => setReceiptDiscount(e.target.value)}
                      disabled={isApprovedAndCashier}
                      className="font-mono text-xs text-right"
                    />
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex justify-between items-center text-base font-bold pt-2 border-t border-border/60 text-foreground">
                  <span>Net Total (BDT):</span>
                  <span className="font-mono text-primary text-lg">{totalAmount}</span>
                </div>

                {/* Paid Amount */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/60">
                  <Label htmlFor="paid-amount" className="text-xs text-muted-foreground">
                    Paid Amount (BDT)
                  </Label>
                  <div className="w-40 sm:w-52">
                    <Input
                      id="paid-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      disabled={isApprovedAndCashier}
                      className="font-mono text-xs text-right"
                    />
                  </div>
                </div>

                {/* Remaining Due */}
                <div className="flex justify-between items-center text-sm font-semibold pt-2 border-t border-border/60">
                  <span className="text-destructive">Remaining Due (BDT):</span>
                  <span className="font-mono text-base font-bold text-destructive">
                    {dueAmount}
                  </span>
                </div>

                {/* Receipt Note (Under Paid Amount & above Create Receipt button) */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <Label htmlFor="receipt-note" className="text-xs text-muted-foreground">
                    Receipt Note (Optional)
                  </Label>
                  <Textarea
                    id="receipt-note"
                    placeholder="e.g. Home delivery requested"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isApprovedAndCashier}
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Action (Kept outside the section) */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isCreating || isUpdating || isApprovedAndCashier}
              className="w-full gap-2 font-semibold shadow-xs"
            >
              <Save className="size-4" />
              {isCreating || isUpdating
                ? "Saving..."
                : isEditing
                ? "Update Receipt"
                : "Create Receipt"}
            </Button>
          </div>
      </div>
    </form>
  );
}

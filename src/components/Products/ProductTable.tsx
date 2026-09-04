"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Clock,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllProductsQuery,
  useConfirmDeleteProductMutation,
  useRejectDeleteProductMutation,
  useRestoreProductMutation,
} from "@/redux/api/productApi";
import useIsAdmin from "@/hooks/useIsAdmin";
import { TProduct } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductFormModal from "./ProductFormModal";
import ProductActivitySheet from "./ProductActivitySheet";
import ProductDeleteModal from "./ProductDeleteModal";
import ConfirmPopup from "../Global/ConfirmPopup";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";
import { cn } from "@/lib/utils";

type TabType = "ACTIVE" | "LOW_STOCK" | "PENDING_DELETION" | "ARCHIVED";

const PRODUCT_UNITS: { label: string; value: string }[] = [
  { label: "All Units", value: "ALL" },
  { label: "Piece (pcs)", value: "PIECE" },
  { label: "Kilogram (kg)", value: "KG" },
  { label: "Gram (g)", value: "GRAM" },
  { label: "Liter (L)", value: "LITER" },
  { label: "Box", value: "BOX" },
  { label: "Packet (pkt)", value: "PACKET" },
  { label: "Meter (m)", value: "METER" },
  { label: "Other", value: "OTHER" },
];

const SORT_OPTIONS = [
  { label: "Newest First", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Oldest First", sortBy: "createdAt", sortOrder: "asc" },
  { label: "Price: Low to High", sortBy: "sellingPrice", sortOrder: "asc" },
  { label: "Price: High to Low", sortBy: "sellingPrice", sortOrder: "desc" },
  { label: "Stock: Low to High", sortBy: "stock", sortOrder: "asc" },
  { label: "Stock: High to Low", sortBy: "stock", sortOrder: "desc" },
  { label: "Name: A to Z", sortBy: "name", sortOrder: "asc" },
];

export default function ProductTable() {
  const [isAdmin] = useIsAdmin();
  const [activeTab, setActiveTab] = useState<TabType>("ACTIVE");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("ALL");
  const [sortIndex, setSortIndex] = useState("0");

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<TProduct | null>(null);

  const [activitySheetOpen, setActivitySheetOpen] = useState(false);
  const [selectedProductForActivity, setSelectedProductForActivity] = useState<TProduct | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<TProduct | null>(null);

  // Admin Mutations
  const [confirmDelete, { isLoading: isConfirming }] = useConfirmDeleteProductMutation();
  const [rejectDelete, { isLoading: isRejecting }] = useRejectDeleteProductMutation();
  const [restoreProduct, { isLoading: isRestoring }] = useRestoreProductMutation();

  // Query Params Construction
  const selectedSort = SORT_OPTIONS[Number(sortIndex)] || SORT_OPTIONS[0];
  const queryParams: Record<string, unknown> = {
    page,
    limit: 25,
    sortBy: selectedSort.sortBy,
    sortOrder: selectedSort.sortOrder,
  };

  if (searchTerm.trim()) {
    queryParams.searchTerm = searchTerm.trim();
  }
  if (selectedUnit !== "ALL") {
    queryParams.unit = selectedUnit;
  }

  // Tab Filtering logic
  if (activeTab === "ACTIVE") {
    queryParams.isDeleted = false;
  } else if (activeTab === "LOW_STOCK") {
    queryParams.isDeleted = false;
  } else if (activeTab === "PENDING_DELETION") {
    queryParams.isDeleted = false;
    queryParams.isDeleteRequested = true;
  } else if (activeTab === "ARCHIVED") {
    queryParams.isDeleted = true;
  }

  const { data: response, isLoading, isFetching } = useGetAllProductsQuery(queryParams);
  let products = response?.data || [];
  const meta = response?.meta;

  // If LOW_STOCK tab is active, filter <= 5 in client
  if (activeTab === "LOW_STOCK") {
    products = products.filter((p) => p.stock <= 5);
  }

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (p: TProduct) => {
    setProductToEdit(p);
    setFormModalOpen(true);
  };

  const handleOpenActivity = (p: TProduct) => {
    setSelectedProductForActivity(p);
    setActivitySheetOpen(true);
  };

  const handleOpenDelete = (p: TProduct) => {
    setProductToDelete(p);
    setDeleteModalOpen(true);
  };

  const handleAdminConfirmDelete = async (p: TProduct) => {
    try {
      await confirmDelete(p.id).unwrap();
      toast.success(`Deletion of "${p.name}" approved.`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminRejectDelete = async (p: TProduct) => {
    try {
      await rejectDelete(p.id).unwrap();
      toast.info(`Deletion request for "${p.name}" rejected.`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminRestore = async (p: TProduct) => {
    try {
      await restoreProduct(p.id).unwrap();
      toast.success(`Product "${p.name}" restored successfully!`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedUnit("ALL");
    setSortIndex("0");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Controls: Tabs & Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("ACTIVE");
              setPage(1);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-colors",
              activeTab === "ACTIVE"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All Active
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("LOW_STOCK");
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 font-medium transition-colors",
              activeTab === "LOW_STOCK"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <AlertTriangle className="size-3 text-amber-500" />
            Low Stock
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("PENDING_DELETION");
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 font-medium transition-colors",
              activeTab === "PENDING_DELETION"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Clock className="size-3 text-rose-500" />
            Pending Deletion
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("ARCHIVED");
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 font-medium transition-colors",
                activeTab === "ARCHIVED"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Archive className="size-3 text-slate-500" />
              Archived
            </button>
          )}
        </div>

        {/* Add Product Button */}
        <Button onClick={handleOpenCreate} className="h-9 gap-1.5 text-xs font-semibold">
          <Plus className="size-4" />
          Add Product
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Text Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search product by name or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>

          {/* Unit Filter */}
          <Select
            value={selectedUnit}
            onValueChange={(val) => {
              setSelectedUnit(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Filter by Unit" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_UNITS.map((u) => (
                <SelectItem key={u.value} value={u.value} className="text-xs">
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Option */}
          <Select
            value={sortIndex}
            onValueChange={(val) => {
              setSortIndex(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((s, idx) => (
                <SelectItem key={idx} value={String(idx)} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filter info */}
        {(searchTerm || selectedUnit !== "ALL" || sortIndex !== "0") && (
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <span>Filters active</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset filters
            </Button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Product Name</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Skeleton className="h-8 w-24 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="size-8 text-muted-foreground/40" />
                      <p className="text-base font-medium text-foreground">No products found</p>
                      <p className="text-xs text-muted-foreground">
                        {activeTab === "PENDING_DELETION"
                          ? "No deletion requests pending confirmation."
                          : "Try adjusting your filters or click 'Add Product' to create one."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className={cn(
                      "transition-colors hover:bg-muted/40",
                      isFetching && "opacity-60",
                      product.isDeleteRequested && "bg-amber-500/5 hover:bg-amber-500/10",
                      product.isDeleted && "bg-muted/30 opacity-70",
                    )}
                  >
                    {/* Product Name & Details */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground text-xs sm:text-sm truncate max-w-xs">
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                          <span className="font-medium bg-muted px-1.5 py-0.5 rounded text-[10px]">
                            {product.unit}
                          </span>
                          {product.description && (
                            <span className="truncate max-w-[180px]">
                              {product.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3.5">
                      {product.stock <= 0 ? (
                        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs font-semibold">
                          Out of stock (0)
                        </Badge>
                      ) : product.stock <= 5 ? (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-semibold">
                          Low stock ({product.stock} {product.unit})
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-medium">
                          {product.stock} {product.unit}
                        </Badge>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 font-semibold text-foreground text-xs sm:text-sm">
                      ৳{product.sellingPrice}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {product.isDeleted ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Archived / Deleted
                        </Badge>
                      ) : product.isDeleteRequested ? (
                        <div className="flex flex-col gap-0.5">
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] animate-pulse">
                            Pending Admin Confirmation
                          </Badge>
                          {product.deleteReason && (
                            <span className="text-[10px] text-muted-foreground italic truncate max-w-[130px]">
                              "{product.deleteReason}"
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-normal text-emerald-600 border-emerald-500/30">
                          Active
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Right Sheet Activity Log Trigger */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Product Activity Log"
                          onClick={() => handleOpenActivity(product)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                        >
                          <Activity className="size-3.5" />
                        </Button>

                        {/* If Deleted (Admin Restore) */}
                        {product.isDeleted ? (
                          isAdmin && (
                            <ConfirmPopup
                              title="Restore Product?"
                              description={`Are you sure you want to restore "${product.name}" back to active stock?`}
                              confirmLabel="Restore"
                              destructive={false}
                              loading={isRestoring}
                              onConfirm={() => handleAdminRestore(product)}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isRestoring}
                                className="h-7 px-2 text-xs text-primary"
                              >
                                <RotateCcw className="mr-1 size-3" />
                                Restore
                              </Button>
                            </ConfirmPopup>
                          )
                        ) : product.isDeleteRequested && isAdmin ? (
                          /* Admin Approve / Reject Buttons */
                          <div className="flex items-center gap-1">
                            <ConfirmPopup
                              title="Approve Deletion?"
                              description={`Are you sure you want to approve deleting "${product.name}"? The product will be soft-deleted.`}
                              confirmLabel="Approve Delete"
                              destructive={true}
                              loading={isConfirming}
                              onConfirm={() => handleAdminConfirmDelete(product)}
                            >
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isConfirming}
                                className="h-7 px-2 text-xs"
                                title="Approve Deletion"
                              >
                                <Check className="mr-1 size-3" />
                                Approve
                              </Button>
                            </ConfirmPopup>

                            <ConfirmPopup
                              title="Reject Deletion Request?"
                              description={`Reject the deletion request for "${product.name}"? The product will remain active.`}
                              confirmLabel="Reject Request"
                              destructive={false}
                              loading={isRejecting}
                              onConfirm={() => handleAdminRejectDelete(product)}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isRejecting}
                                className="h-7 px-2 text-xs"
                                title="Reject Request"
                              >
                                <X className="size-3" />
                              </Button>
                            </ConfirmPopup>
                          </div>
                        ) : (
                          /* Normal Edit & Delete */
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Product"
                              onClick={() => handleOpenEdit(product)}
                              className="size-7 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="size-3.5" />
                            </Button>

                            {product.isDeleteRequested && !isAdmin ? (
                              <Badge
                                variant="secondary"
                                className="h-7 px-2 text-[10px] text-amber-600 bg-amber-500/10 cursor-not-allowed"
                                title="A deletion request is currently under review by admin"
                              >
                                Pending Approval
                              </Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                title={isAdmin ? "Delete Product" : "Request Delete"}
                                onClick={() => handleOpenDelete(product)}
                                className="size-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPage > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(meta.page - 1) * meta.limit + 1} to{" "}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} products
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="mr-1 size-3.5" />
                Previous
              </Button>

              <div className="px-2 text-xs font-medium text-muted-foreground">
                Page {meta.page} of {meta.totalPage}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.totalPage || isFetching}
                className="h-8 px-2.5 text-xs"
              >
                Next
                <ChevronRight className="ml-1 size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals and Sheets */}
      <ProductFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        productToEdit={productToEdit}
      />

      <ProductActivitySheet
        open={activitySheetOpen}
        onOpenChange={setActivitySheetOpen}
        product={selectedProductForActivity}
      />

      <ProductDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        product={productToDelete}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RotateCcw,
  Clock,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  Archive,
  Phone,
  Mail,
  MapPin,
  Contact,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllCustomersQuery,
  useConfirmDeleteCustomerMutation,
  useRejectDeleteCustomerMutation,
  useRestoreCustomerMutation,
} from "@/redux/api/customerApi";
import useIsAdmin from "@/hooks/useIsAdmin";
import { TCustomer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerFormModal from "./CustomerFormModal";
import CustomerActivitySheet from "./CustomerActivitySheet";
import CustomerDeleteModal from "./CustomerDeleteModal";
import ConfirmPopup from "../Global/ConfirmPopup";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TabType = "ACTIVE" | "PENDING_DELETION" | "ARCHIVED";

const SORT_OPTIONS = [
  { label: "Newest First", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Oldest First", sortBy: "createdAt", sortOrder: "asc" },
  { label: "Name: A to Z", sortBy: "name", sortOrder: "asc" },
  { label: "Name: Z to A", sortBy: "name", sortOrder: "desc" },
];

export default function CustomerTable() {
  const [isAdmin] = useIsAdmin();
  const [activeTab, setActiveTab] = useState<TabType>("ACTIVE");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortIndex, setSortIndex] = useState("0");

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<TCustomer | null>(null);

  const [activitySheetOpen, setActivitySheetOpen] = useState(false);
  const [selectedCustomerForActivity, setSelectedCustomerForActivity] = useState<TCustomer | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<TCustomer | null>(null);

  // Admin Mutations
  const [confirmDelete, { isLoading: isConfirming }] = useConfirmDeleteCustomerMutation();
  const [rejectDelete, { isLoading: isRejecting }] = useRejectDeleteCustomerMutation();
  const [restoreCustomer, { isLoading: isRestoring }] = useRestoreCustomerMutation();

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

  // Tab Filtering logic
  if (activeTab === "ACTIVE") {
    queryParams.isDeleted = false;
  } else if (activeTab === "PENDING_DELETION") {
    queryParams.isDeleted = false;
    queryParams.isDeleteRequested = true;
  } else if (activeTab === "ARCHIVED") {
    queryParams.isDeleted = true;
  }

  const { data: response, isLoading, isFetching } = useGetAllCustomersQuery(queryParams);
  const customers = response?.data || [];
  const meta = response?.meta;

  const handleOpenCreate = () => {
    setCustomerToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (c: TCustomer) => {
    setCustomerToEdit(c);
    setFormModalOpen(true);
  };

  const handleOpenActivity = (c: TCustomer) => {
    setSelectedCustomerForActivity(c);
    setActivitySheetOpen(true);
  };

  const handleOpenDelete = (c: TCustomer) => {
    setCustomerToDelete(c);
    setDeleteModalOpen(true);
  };

  const handleAdminConfirmDelete = async (c: TCustomer) => {
    try {
      await confirmDelete(c.id).unwrap();
      toast.success(`Deletion of "${c.name}" approved.`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminRejectDelete = async (c: TCustomer) => {
    try {
      await rejectDelete(c.id).unwrap();
      toast.info(`Deletion request for "${c.name}" rejected.`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminRestore = async (c: TCustomer) => {
    try {
      await restoreCustomer(c.id).unwrap();
      toast.success(`Customer "${c.name}" restored successfully!`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
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

        {/* Add Customer Button */}
        <Button onClick={handleOpenCreate} className="h-9 gap-1.5 text-xs font-semibold">
          <UserPlus className="size-4" />
          Add Customer
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Text Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search customer by name, phone number, email or address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>

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
        {(searchTerm || sortIndex !== "0") && (
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

      {/* Customers Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-24 ml-auto rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Contact className="size-8 text-muted-foreground/40" />
                    <p className="text-base font-medium text-foreground">No customers found</p>
                    <p className="text-xs text-muted-foreground">
                      {activeTab === "PENDING_DELETION"
                        ? "No customer deletion requests pending confirmation."
                        : "Try adjusting your filters or click 'Add Customer' to create one."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const initials = customer.name
                  ? customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "CU";

                return (
                  <TableRow
                    key={customer.id}
                    className={cn(
                      isFetching && "opacity-60",
                      customer.isDeleteRequested && "bg-amber-500/5 hover:bg-amber-500/10",
                      customer.isDeleted && "bg-muted/30 opacity-70",
                    )}
                  >
                    {/* Customer Info */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 border border-border">
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-xs sm:text-sm truncate max-w-xs">
                              {customer.name}
                            </span>
                            {customer.isDeleteRequested && (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] py-0 px-1.5 font-normal">
                                Pending Deletion
                              </Badge>
                            )}
                            {customer.isDeleted && (
                              <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-normal">
                                Deleted
                              </Badge>
                            )}
                          </div>
                          {customer.isDeleteRequested && customer.deleteReason && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 italic truncate max-w-xs">
                              Reason: "{customer.deleteReason}"
                            </span>
                          )}
                          {customer.createdBy && (
                            <span className="text-[10px] text-muted-foreground">
                              Added by {customer.createdBy.firstName}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Phone Number */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Phone className="size-3.5 text-muted-foreground" />
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {customer.countryCode || "+880"}
                        </span>
                        <span>{customer.phoneNumber}</span>
                      </span>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-xs text-muted-foreground">
                      {customer.email ? (
                        <span className="inline-flex items-center gap-1.5 truncate max-w-[160px]">
                          <Mail className="size-3.5 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>

                    {/* Address */}
                    <TableCell className="text-xs text-muted-foreground">
                      {customer.address ? (
                        <span className="inline-flex items-center gap-1.5 truncate max-w-[180px]">
                          <MapPin className="size-3.5 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{customer.address}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Right Sheet Activity Log Trigger */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Customer Activity Log"
                          onClick={() => handleOpenActivity(customer)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                        >
                          <Activity className="size-3.5" />
                        </Button>

                        {/* If Deleted (Admin Restore) */}
                        {customer.isDeleted ? (
                          isAdmin && (
                            <ConfirmPopup
                              title="Restore Customer?"
                              description={`Are you sure you want to restore customer record for "${customer.name}"?`}
                              confirmLabel="Restore"
                              destructive={false}
                              loading={isRestoring}
                              onConfirm={() => handleAdminRestore(customer)}
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
                        ) : (
                          <>
                            {/* If Pending Deletion & Current User is Admin: Quick Confirm/Reject */}
                            {customer.isDeleteRequested && isAdmin ? (
                              <div className="flex items-center gap-1">
                                <ConfirmPopup
                                  title="Confirm Deletion Request?"
                                  description={`A cashier requested deletion: "${customer.deleteReason || "No reason specified"}". Confirming will soft-delete this customer.`}
                                  confirmLabel="Confirm Delete"
                                  destructive={true}
                                  loading={isConfirming}
                                  onConfirm={() => handleAdminConfirmDelete(customer)}
                                >
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={isConfirming}
                                    className="h-7 px-2 text-xs"
                                    title="Confirm deletion request"
                                  >
                                    <Check className="mr-1 size-3" />
                                    Approve
                                  </Button>
                                </ConfirmPopup>

                                <ConfirmPopup
                                  title="Reject Deletion Request?"
                                  description={`Reject cashier's request to delete "${customer.name}"?`}
                                  confirmLabel="Reject Request"
                                  destructive={false}
                                  loading={isRejecting}
                                  onConfirm={() => handleAdminRejectDelete(customer)}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isRejecting}
                                    className="h-7 px-2 text-xs"
                                    title="Reject deletion request"
                                  >
                                    <X className="mr-1 size-3" />
                                  </Button>
                                </ConfirmPopup>
                              </div>
                            ) : null}

                            {/* Normal Edit & Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Customer"
                              onClick={() => handleOpenEdit(customer)}
                              className="size-7 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="size-3.5" />
                            </Button>

                            {customer.isDeleteRequested && !isAdmin ? (
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
                                title={isAdmin ? "Delete Customer" : "Request Delete"}
                                onClick={() => handleOpenDelete(customer)}
                                className="size-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {meta && meta.totalPage > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(meta.page - 1) * meta.limit + 1} to{" "}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} customers
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
      <CustomerFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        customerToEdit={customerToEdit}
      />

      <CustomerActivitySheet
        open={activitySheetOpen}
        onOpenChange={setActivitySheetOpen}
        customer={selectedCustomerForActivity}
      />

      <CustomerDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        customer={customerToDelete}
      />
    </div>
  );
}

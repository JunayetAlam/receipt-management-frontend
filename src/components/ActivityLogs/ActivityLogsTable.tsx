"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  Check,
  ChevronsUpDown,
  User as UserIcon,
  Shield,
  Activity,
  Calendar,
  Globe,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useGetAllActivityLogsQuery } from "@/redux/api/activityLogApi";
import { useGetAllUsersQuery } from "@/redux/api/userApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TActivityLog, User } from "@/types";
import { cn } from "@/lib/utils";

const ACTIONS_LIST = [
  { label: "All Actions", value: "ALL" },
  { label: "User Login", value: "USER_LOGIN" },
  { label: "User Register", value: "USER_REGISTER" },
  { label: "Verify Email", value: "USER_VERIFY_EMAIL" },
  { label: "Change Password", value: "USER_CHANGE_PASSWORD" },
  { label: "Reset Password", value: "USER_RESET_PASSWORD" },
  { label: "User Logout", value: "USER_LOGOUT" },
  { label: "Admin Create User", value: "ADMIN_CREATE_USER" },
  { label: "Admin Update Role", value: "ADMIN_UPDATE_USER_ROLE" },
  { label: "Admin Update Status", value: "ADMIN_UPDATE_USER_STATUS" },
  { label: "Admin Delete User", value: "ADMIN_DELETE_USER" },
  { label: "Admin Reactivate User", value: "ADMIN_REACTIVATE_USER" },
  { label: "Revoke Device", value: "USER_REVOKE_DEVICE" },
  { label: "Create Product", value: "CREATE_PRODUCT" },
  { label: "Update Product", value: "UPDATE_PRODUCT" },
  { label: "Create Customer", value: "CREATE_CUSTOMER" },
  { label: "Update Customer", value: "UPDATE_CUSTOMER" },
  { label: "Create Receipt", value: "CREATE_RECEIPT" },
  { label: "Add Receipt Payment", value: "ADD_RECEIPT_PAYMENT" },
];

const ENTITIES_LIST = [
  { label: "All Entities", value: "ALL" },
  { label: "User", value: "USER" },
  { label: "Product", value: "PRODUCT" },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Receipt", value: "RECEIPT" },
  { label: "Receipt Payment", value: "RECEIPT_PAYMENT" },
  { label: "Session", value: "SESSION" },
];

const getActionBadge = (action: string) => {
  if (action.includes("CREATE") || action.includes("REGISTER") || action.includes("ADD")) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium hover:bg-emerald-500/15">
        {action}
      </Badge>
    );
  }
  if (action.includes("DELETE") || action.includes("REVOKE") || action.includes("BLOCK")) {
    return (
      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium hover:bg-rose-500/15">
        {action}
      </Badge>
    );
  }
  if (action.includes("UPDATE") || action.includes("STATUS") || action.includes("ROLE")) {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium hover:bg-blue-500/15">
        {action}
      </Badge>
    );
  }
  if (action.includes("LOGIN") || action.includes("LOGOUT") || action.includes("PASSWORD")) {
    return (
      <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 font-medium hover:bg-violet-500/15">
        {action}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="font-medium">
      {action}
    </Badge>
  );
};

const getRoleBadge = (role?: string) => {
  switch (role) {
    case "SUPERADMIN":
      return <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0">SUPERADMIN</Badge>;
    case "ADMIN":
      return <Badge className="bg-indigo-600 text-white text-[10px] px-1.5 py-0">ADMIN</Badge>;
    case "CASHIER":
    default:
      return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">CASHIER</Badge>;
  }
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ActivityLogsTable() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");
  const [userComboboxOpen, setUserComboboxOpen] = useState(false);
  const [detailModalLog, setDetailModalLog] = useState<TActivityLog | null>(null);

  // Fetch users for searchable user combobox
  const { data: usersData } = useGetAllUsersQuery([
    { name: "limit", value: 100 },
  ]);
  const usersList: User[] = usersData?.data || [];

  // Build query params for logs
  const queryParams: Record<string, unknown> = {
    page,
    limit: 25, // 25 records per page
  };

  if (searchTerm.trim()) {
    queryParams.searchTerm = searchTerm.trim();
  }
  if (selectedUser) {
    queryParams.userId = selectedUser;
  }
  if (selectedAction !== "ALL") {
    queryParams.action = selectedAction;
  }
  if (selectedEntity !== "ALL") {
    queryParams.entityType = selectedEntity;
  }

  const { data: logsResponse, isLoading, isFetching } = useGetAllActivityLogsQuery(queryParams);
  const logs = logsResponse?.data || [];
  const meta = logsResponse?.meta;

  const handleResetFilters = () => {
    setPage(1);
    setSearchTerm("");
    setSelectedUser(null);
    setSelectedAction("ALL");
    setSelectedEntity("ALL");
  };

  const selectedUserObj = usersList.find((u) => u.id === selectedUser);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Text Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search action or IP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          {/* User Combobox */}
          <Popover open={userComboboxOpen} onOpenChange={setUserComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={userComboboxOpen}
                className="justify-between text-left font-normal"
              >
                <div className="flex items-center gap-2 truncate">
                  <UserIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {selectedUserObj
                      ? `${selectedUserObj.firstName} ${selectedUserObj.lastName}`
                      : "Filter by User"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search user..." />
                <CommandList>
                  <CommandEmpty>No user found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedUser(null);
                        setUserComboboxOpen(false);
                        setPage(1);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          selectedUser === null ? "opacity-100" : "opacity-0",
                        )}
                      />
                      All Users
                    </CommandItem>
                    {usersList.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => {
                          setSelectedUser(user.id);
                          setUserComboboxOpen(false);
                          setPage(1);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            selectedUser === user.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col truncate">
                          <span className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Action Filter */}
          <Select
            value={selectedAction}
            onValueChange={(val) => {
              setSelectedAction(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS_LIST.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Entity Filter */}
          <Select
            value={selectedEntity}
            onValueChange={(val) => {
              setSelectedEntity(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              {ENTITIES_LIST.map((entity) => (
                <SelectItem key={entity.value} value={entity.value}>
                  {entity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter controls & Reset */}
        {(searchTerm || selectedUser || selectedAction !== "ALL" || selectedEntity !== "ALL") && (
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <span>Active filters applied</span>
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

      {/* Logs Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Entity</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="size-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-5 w-28 rounded-full" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-5 w-20 rounded-md" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Skeleton className="h-7 w-16 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Activity className="size-8 text-muted-foreground/50" />
                      <p className="text-base font-medium text-foreground">No activity logs found</p>
                      <p className="text-xs text-muted-foreground">
                        Try changing your filters or search terms.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const user = log.user;
                  const displayName = user
                    ? `${user.firstName} ${user.lastName}`.trim()
                    : "System / Guest";
                  const initials = user
                    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
                    : "SY";

                  return (
                    <tr
                      key={log.id}
                      className={cn(
                        "transition-colors hover:bg-muted/40",
                        isFetching && "opacity-60",
                      )}
                    >
                      {/* User Column */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 border border-border">
                            {user?.profilePhoto ? (
                              <AvatarImage src={user.profilePhoto} alt={displayName} />
                            ) : null}
                            <AvatarFallback className="text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground text-xs truncate max-w-[140px]">
                                {displayName}
                              </span>
                              {user?.role && getRoleBadge(user.role)}
                            </div>
                            {user?.email && (
                              <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                                {user.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground">
                            {log.entityType}
                          </span>
                          {log.entityId && (
                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                              {log.entityId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <Globe className="size-3 text-muted-foreground/70" />
                          {log.ipAddress || "—"}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="size-3.5 text-muted-foreground/70" />
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Details View */}
                      <td className="px-4 py-3.5 text-right">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailModalLog(log)}
                            className="h-7 text-xs px-2 hover:bg-muted"
                          >
                            <Eye className="mr-1 size-3.5 text-muted-foreground" />
                            Details
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPage > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(meta.page - 1) * meta.limit + 1} to{" "}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} logs
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

      {/* Details Dialog */}
      <Dialog
        open={Boolean(detailModalLog)}
        onOpenChange={(open) => !open && setDetailModalLog(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4.5 text-primary" />
              Activity Details
            </DialogTitle>
          </DialogHeader>

          {detailModalLog && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Action</span>
                  <span className="font-semibold text-foreground">{detailModalLog.action}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Entity Type</span>
                  <span className="font-semibold text-foreground">{detailModalLog.entityType}</span>
                </div>
                {detailModalLog.entityId && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Entity ID</span>
                    <span className="font-mono text-foreground select-all">{detailModalLog.entityId}</span>
                  </div>
                )}
                {detailModalLog.userAgent && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">User Agent</span>
                    <span className="text-muted-foreground font-mono truncate block">
                      {detailModalLog.userAgent}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <span className="font-semibold text-foreground block mb-1.5">Payload / Details:</span>
                <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-60 border border-zinc-800">
                  {JSON.stringify(detailModalLog.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

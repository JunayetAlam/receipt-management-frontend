"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Contact, History, LayoutDashboard, Package, ReceiptText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import useIsAdmin from "@/hooks/useIsAdmin";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isAdmin] = useIsAdmin();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Receipts", href: "/receipts", icon: ReceiptText },
    { name: "Products", href: "/products", icon: Package },
    { name: "Customers", href: "/customers", icon: Contact },
    ...(isAdmin
      ? [
          { name: "Users", href: "/users", icon: Users },
          { name: "Activity Logs", href: "/activity-logs", icon: History },
        ]
      : []),
  ];

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-4 py-5">
        <p className="text-sm font-semibold">Receipt Management</p>
        <p className="text-xs text-muted-foreground">Internal shop tool</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

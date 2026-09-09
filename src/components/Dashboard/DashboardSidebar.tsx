"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Contact,
  History,
  LayoutDashboard,
  Package,
  ReceiptText,
  Store,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useIsAdmin from "@/hooks/useIsAdmin";
import { useGetShopDetailsQuery } from "@/redux/api/shopApi";
import Image from "next/image";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isAdmin] = useIsAdmin();
  const { data: shopResponse } = useGetShopDetailsQuery();
  const shop = shopResponse?.data;

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Shop Details", href: "/shop-details", icon: Store },
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
      <div className="border-b border-sidebar-border px-4 py-4 min-h-[64px] flex items-center">
        {shop?.logo ? (
          <Link href="/dashboard" className="flex items-center group py-1">
            <Image
              src={shop.logo}
              alt={shop.name || "Shop Logo"}
              width={200}
              height={200}
              className="max-h-14 w-auto max-w-[220px] object-contain"
            />
          </Link>
        ) : (
          <Link href="/dashboard" className="block min-w-0">
            <p className="text-sm font-semibold truncate text-sidebar-foreground">
              {shop?.name || "Receipt Management"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {shop?.tagline || "Internal shop tool"}
            </p>
          </Link>
        )}
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

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Contact,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Store,
  TrendingUp,
  Undo2,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useIsAdmin from "@/hooks/useIsAdmin";
import SidebarClimber from "@/components/Dashboard/SidebarClimber/SidebarClimber";
// import { StarField } from "@/components/Global/StarryBackground";

// Stars behind the sidebar menu, matching the page background.
// const SIDEBAR_STARS = {
//   seed: 7202,
//   dots: 45,
//   sparkles: 8,
//   sparkleMin: 10,
//   sparkleMax: 22,
//   topWeighted: false,
// };
import useIsPrivileged from "@/hooks/useIsPrivileged";
import { useGetShopDetailsQuery } from "@/redux/api/shopApi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_COLLAPSED_KEY = "rms-sidebar-collapsed";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

type GroupColor =
  | "teal"
  | "sky"
  | "amber"
  | "violet"
  | "emerald"
  | "rose"
  | "indigo";

type NavGroup = {
  title?: string;
  color: GroupColor;
  items: NavItem[];
};

// Full class strings are listed so Tailwind can detect them at build time.
// Each group has one hue; items cycle through different shades of that hue.
const GROUP_COLORS: Record<
  GroupColor,
  {
    title: string;
    divider: string;
    hover: string;
    active: string;
    items: string[];
  }
> = {
  teal: {
    title: "text-teal-700 dark:text-teal-400 bg-teal-500/10 border-teal-500/25 shadow-teal-500/10 dark:bg-teal-400/10 dark:border-teal-400/25",
    divider: "border-teal-300 dark:border-teal-800",
    hover: "hover:bg-teal-50 dark:hover:bg-teal-950/40",
    active: "bg-teal-600 text-white shadow-sm dark:bg-teal-500",
    items: [
      "text-teal-600 dark:text-teal-400",
      "text-teal-500 dark:text-teal-300",
      "text-teal-800 dark:text-teal-500",
    ],
  },
  sky: {
    title: "text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/25 shadow-sky-500/10 dark:bg-sky-400/10 dark:border-sky-400/25",
    divider: "border-sky-300 dark:border-sky-800",
    hover: "hover:bg-sky-50 dark:hover:bg-sky-950/40",
    active: "bg-sky-600 text-white shadow-sm dark:bg-sky-500",
    items: [
      "text-sky-600 dark:text-sky-400",
      "text-sky-500 dark:text-sky-300",
      "text-sky-800 dark:text-sky-500",
    ],
  },
  amber: {
    title: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-amber-500/10 dark:bg-amber-400/10 dark:border-amber-400/25",
    divider: "border-amber-300 dark:border-amber-800",
    hover: "hover:bg-amber-50 dark:hover:bg-amber-950/40",
    active: "bg-amber-600 text-white shadow-sm dark:bg-amber-500",
    items: [
      "text-amber-600 dark:text-amber-400",
      "text-amber-500 dark:text-amber-300",
      "text-amber-800 dark:text-amber-500",
    ],
  },
  violet: {
    title: "text-violet-700 dark:text-violet-400 bg-violet-500/10 border-violet-500/25 shadow-violet-500/10 dark:bg-violet-400/10 dark:border-violet-400/25",
    divider: "border-violet-300 dark:border-violet-800",
    hover: "hover:bg-violet-50 dark:hover:bg-violet-950/40",
    active: "bg-violet-600 text-white shadow-sm dark:bg-violet-500",
    items: [
      "text-violet-600 dark:text-violet-400",
      "text-violet-500 dark:text-violet-300",
      "text-violet-800 dark:text-violet-500",
    ],
  },
  emerald: {
    title: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-emerald-500/10 dark:bg-emerald-400/10 dark:border-emerald-400/25",
    divider: "border-emerald-300 dark:border-emerald-800",
    hover: "hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
    active: "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500",
    items: [
      "text-emerald-600 dark:text-emerald-400",
      "text-emerald-500 dark:text-emerald-300",
      "text-emerald-800 dark:text-emerald-500",
    ],
  },
  rose: {
    title: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25 shadow-rose-500/10 dark:bg-rose-400/10 dark:border-rose-400/25",
    divider: "border-rose-300 dark:border-rose-800",
    hover: "hover:bg-rose-50 dark:hover:bg-rose-950/40",
    active: "bg-rose-600 text-white shadow-sm dark:bg-rose-500",
    items: [
      "text-rose-600 dark:text-rose-400",
      "text-rose-500 dark:text-rose-300",
      "text-rose-800 dark:text-rose-500",
    ],
  },
  indigo: {
    title: "text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25 shadow-indigo-500/10 dark:bg-indigo-400/10 dark:border-indigo-400/25",
    divider: "border-indigo-300 dark:border-indigo-800",
    hover: "hover:bg-indigo-50 dark:hover:bg-indigo-950/40",
    active: "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500",
    items: [
      "text-indigo-600 dark:text-indigo-400",
      "text-indigo-500 dark:text-indigo-300",
      "text-indigo-800 dark:text-indigo-500",
    ],
  },
};

function SidebarItem({
  item,
  isActive,
  collapsed,
  colorClass,
  hoverClass,
  activeClass,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  colorClass: string;
  hoverClass: string;
  activeClass: string;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors",
        collapsed ? "justify-center px-0 py-2.5" : "gap-2 px-3 py-2",
        isActive
          ? activeClass
          : cn(colorClass, hoverClass),
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className={cn("truncate", collapsed && "sr-only")}>{item.name}</span>
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.name}
      </TooltipContent>
    </Tooltip>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isAdmin] = useIsAdmin();
  const { isPrivileged } = useIsPrivileged();
  const { data: shopResponse } = useGetShopDetailsQuery();
  const shop = shopResponse?.data;
  const [collapsed, setCollapsed] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
    } catch {
      // Ignore storage access errors (private mode, etc.)
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((previous) => {
      const next = !previous;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore storage access errors (private mode, etc.)
      }
      return next;
    });
  };

  const navGroups: NavGroup[] = [
    {
      color: "teal",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Profiles",
      color: "sky",
      items: [
        { name: "Customers", href: "/customers", icon: Contact },
      ],
    },
    {
      title: "Inventory",
      color: "amber",
      items: [
        { name: "Products", href: "/products", icon: Package },
        { name: "Low Stock", href: "/low-stock", icon: AlertTriangle },
      ],
    },
    {
      title: "Transactions",
      color: "violet",
      items: [
        {
          name: "Customer Transactions",
          href: "/customer-transactions",
          icon: ArrowLeftRight,
        },
        { name: "Receipts", href: "/receipts", icon: ReceiptText },
        { name: "Return Invoices", href: "/return-invoices", icon: Undo2 },
      ],
    },
    ...(isAdmin
      ? ([
          {
            title: "Reports",
            color: "emerald",
            items: [
              {
                name: "Product Profit & Loss",
                href: "/product-profit-loss",
                icon: TrendingUp,
              },
              {
                name: "Sales Report",
                href: "/sell-report",
                icon: FileSpreadsheet,
              },
            ],
          },
          {
            title: "Administration",
            color: "rose",
            items: [
              { name: "Users", href: "/users", icon: Users },
              { name: "Activity Logs", href: "/activity-logs", icon: History },
            ],
          },
        ] satisfies NavGroup[])
      : []),
    {
      title: "Shop Management",
      color: "indigo",
      items: [
        { name: "Shop Details", href: "/shop-details", icon: Store },
        ...(isPrivileged
          ? [{ name: "Maintenance", href: "/privileged/maintenance", icon: Wrench }]
          : []),
      ],
    },
  ];

  const toggleLabel = collapsed ? "Expand sidebar" : "Minimize sidebar";

  return (
    <aside
      className={cn(
        "sticky top-0 z-20 flex h-svh shrink-0 flex-col self-start overflow-visible border-r border-sidebar-border bg-sidebar/75 backdrop-blur-md text-sidebar-foreground transition-[width] duration-200 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* <StarField className="absolute inset-0 -z-10 opacity-70" {...SIDEBAR_STARS} /> */}
      <SidebarClimber navRef={navRef} collapsed={collapsed} />

      <div
        className={cn(
          "flex min-h-16 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2 py-3" : "px-4 py-4",
        )}
      >
        {shop?.logo ? (
          <Link href="/dashboard" className="flex items-center justify-center">
            <Image
              src={shop.logo}
              alt={shop.name || "Shop Logo"}
              width={collapsed ? 32 : 200}
              height={collapsed ? 32 : 200}
              className={cn(
                "object-contain",
                collapsed ? "size-8" : "max-h-14 w-auto max-w-[220px]",
              )}
            />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className={cn("block min-w-0", collapsed && "flex justify-center")}
            aria-label={shop?.name || "Sanowar Electric"}
          >
            {collapsed ? (
              <Store className="size-5" />
            ) : (
              <>
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {shop?.name || "Sanowar Electric"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {shop?.proprietor || "Electrical & Electronics Store"}
                </p>
              </>
            )}
          </Link>
        )}
      </div>

      <nav
        ref={navRef}
        className="relative flex flex-1 flex-col gap-1.5 overflow-y-auto p-3 pb-10"
      >
        {navGroups.map((group, groupIndex) => {
          const palette = GROUP_COLORS[group.color];

          return (
          <div key={group.title || groupIndex} className="flex flex-col gap-1">
            {group.title && (
              collapsed ? (
                <div className={cn("mx-1 my-0.5 border-t", palette.divider)} />
              ) : (
                <p
                  className={cn(
                    "mx-1 mt-1.5 mb-0.5 w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md select-none",
                    palette.title,
                  )}
                >
                  {group.title}
                </p>
              )
            )}
            {group.items.map((item, itemIndex) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <SidebarItem
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  collapsed={collapsed}
                  colorClass={
                    palette.items[itemIndex % palette.items.length]
                  }
                  hoverClass={palette.hover}
                  activeClass={palette.active}
                />
              );
            })}
          </div>
          );
        })}
      </nav>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleCollapsed}
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            className="absolute bottom-4 right-0 z-30 translate-x-1/2 rounded-full bg-background shadow-sm"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {toggleLabel}
        </TooltipContent>
      </Tooltip>
    </aside>
  );
}

"use client";

import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardUserMenu from "@/components/Dashboard/DashboardUserMenu";
import NavbarWelcomeMarquee from "@/components/Dashboard/NavbarWelcomeMarquee";
import NotificationDropdown from "@/components/Dashboard/NotificationDropdown";
import BulkImportPanel from "@/components/Products/BulkImportPanel";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen text-foreground">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-md">
          <NavbarWelcomeMarquee />
          <div className="flex items-center gap-3 shrink-0">
            <NotificationDropdown />
            <DashboardUserMenu />
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <BulkImportPanel />
    </div>
  );
}

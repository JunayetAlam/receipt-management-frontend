import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardUserMenu from "@/components/Dashboard/DashboardUserMenu";
import NotificationDropdown from "@/components/Dashboard/NotificationDropdown";
import DashboardAuthGate from "@/components/Dashboard/DashboardAuthGate";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-border bg-background px-4">
          <NotificationDropdown />
          <DashboardUserMenu />
        </header>
        <main className="min-w-0 flex-1">
          <DashboardAuthGate>{children}</DashboardAuthGate>
        </main>
      </div>
    </div>
  );
}

import DashboardShell from "@/components/Dashboard/DashboardShell";
import DashboardAuthGate from "@/components/Dashboard/DashboardAuthGate";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardShell>
      <DashboardAuthGate>{children}</DashboardAuthGate>
    </DashboardShell>
  );
}

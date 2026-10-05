import { Metadata } from "next";
import PrivilegedMaintenanceControl from "@/components/Maintenance/PrivilegedMaintenanceControl";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Privileged System Maintenance Control Center",
};

export default function PrivilegedMaintenancePage() {
  return <PrivilegedMaintenanceControl />;
}

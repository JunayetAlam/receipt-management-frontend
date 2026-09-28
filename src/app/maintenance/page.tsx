import { Metadata } from "next";
import PublicMaintenanceView from "@/components/Maintenance/PublicMaintenanceView";

export const metadata: Metadata = {
  title: "System Maintenance | Receipt Management",
  description:
    "System maintenance is currently in progress. We will be back online shortly.",
};

export default function MaintenancePage() {
  return <PublicMaintenanceView />;
}

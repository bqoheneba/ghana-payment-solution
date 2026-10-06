import { AuthGate } from "@/components/auth/AuthGate";
import { GDDDashboard } from "@/components/GDDDashboard";

export default function DashboardRoute() {
  return (
    <AuthGate portal="gdd">
      <GDDDashboard />
    </AuthGate>
  );
}

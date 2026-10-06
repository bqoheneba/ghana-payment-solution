import { AuthGate } from "@/components/auth/AuthGate";
import { InstitutionDashboard } from "@/components/institution/InstitutionDashboard";

export default function InstitutionRoute() {
  return (
    <AuthGate portal="institution">
      <InstitutionDashboard />
    </AuthGate>
  );
}

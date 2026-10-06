import { AuthGate } from "@/components/auth/AuthGate";
import { BankDashboard } from "@/components/bank/BankDashboard";

export default function BankRoute() {
  return (
    <AuthGate portal="bank">
      <BankDashboard />
    </AuthGate>
  );
}

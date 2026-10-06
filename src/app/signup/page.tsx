"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell title="Create a GDD account" subtitle="For scheme operators validating mandates and instructing banks.">
      <SignupForm />
    </AuthShell>
  );
}

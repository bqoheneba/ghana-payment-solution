"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { homePath, type Portal } from "@/lib/auth";

const COPY: Record<Portal, { title: string; subtitle: string }> = {
  gdd: {
    title: "Regulator sign in",
    subtitle: "GDD operators validating mandates and instructing banks.",
  },
  bank: {
    title: "Bank sign in",
    subtitle: "Honour instructions and confirm credits on the scheme.",
  },
  institution: {
    title: "Institution sign in",
    subtitle: "Create mandates and send them to GDD for validation.",
  },
};

export function PortalLoginPage({ portal }: { portal: Portal }) {
  const router = useRouter();
  const { sessions, isReady } = useAuth();
  const copy = COPY[portal];

  useEffect(() => {
    const session = sessions[portal];
    if (isReady && session) router.replace(homePath(session));
  }, [isReady, sessions, portal, router]);

  return (
    <AuthShell portal={portal} title={copy.title} subtitle={copy.subtitle}>
      <LoginForm portal={portal} />
    </AuthShell>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { portalFor, loginPath, type Portal } from "@/lib/auth";

export function AuthGate({ children, portal }: { children: ReactNode; portal: Portal }) {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!user || portalFor(user) !== portal) router.replace(loginPath(portal));
  }, [isReady, user, portal, router]);

  if (!isReady || !user || portalFor(user) !== portal) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-mid)",
        fontSize: 13,
      }}>
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}

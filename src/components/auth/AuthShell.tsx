import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Icon } from "@/components/icons";
import type { Portal } from "@/lib/auth";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  portal?: Portal;
}

const ASIDE: Record<Portal, { kicker: string; value: string; headline: string; body: string }> = {
  gdd: {
    kicker: "Pending validation",
    value: "14 mandates",
    headline: "The national scheme for Ghana direct debit.",
    body: "Validate mandates from institutions, instruct sending banks to honour them, and credit the receiving bank on the scheme.",
  },
  bank: {
    kicker: "Honour instructions",
    value: "Your queue",
    headline: "Honour GDD instructions for your customers.",
    body: "Debit accounts when GDD instructs you. Confirm credit when you are the receiving bank.",
  },
  institution: {
    kicker: "Mandate originator",
    value: "Send to GDD",
    headline: "Create mandates and send them to the scheme.",
    body: "GDD validates each mandate, then instructs the sending bank. You do not honour the debit.",
  },
};

export function AuthShell({ title, subtitle, children, portal = "gdd" }: AuthShellProps) {
  const aside = ASIDE[portal];
  return (
    <div
      className="auth-shell"
      data-portal={portal === "gdd" ? undefined : portal}
      data-bank={portal === "bank" ? "FNB" : undefined}
    >
      <aside className="auth-aside" style={{
        padding: 56,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(255,255,255,0.2)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="bank" size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em" }}>GDD</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {portal === "gdd" ? "Regulator" : portal === "bank" ? "Bank provider" : "Institution"}
            </div>
          </div>
        </div>

        <div>
          <div className="auth-card-art" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>{aside.kicker}</div>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>{aside.value}</div>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.55)" }} />
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.28)", marginLeft: -8 }} />
              </div>
            </div>
            <div style={{ marginTop: 28, fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>
              Institution submit · GDD validate · Bank honour
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.85 }}>
              <span>Activation GHS 50</span>
              <span>GDD GHS 30</span>
            </div>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2, margin: "28px 0 12px" }}>
            {aside.headline}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85, maxWidth: 380 }}>
            {aside.body}
          </p>
        </div>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Star Assurance · First National · Ecobank · Absa
        </div>
      </aside>

      <main style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <ThemeToggle />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>{title}</h2>
          <p style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 28 }}>{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}

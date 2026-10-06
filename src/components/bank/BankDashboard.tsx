"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { MandateDetailPage } from "@/components/pages/MandateDetailPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { BankOverviewPage, BankMandatesPage, BankInstructionsPage, BankFeesPage } from "@/components/bank/BankPages";
import { bankName, getMandate } from "@/lib/scheme";
import { useScheme } from "@/hooks/useScheme";
import type { IconName } from "@/components/icons";

const BANK_NAV = [
  { id: "overview",      icon: "home" as IconName,         label: "Overview" },
  { id: "honoured",      icon: "swap" as IconName,         label: "Honoured" },
  { id: "received",      icon: "check-circle" as IconName, label: "Received" },
  { id: "instructions",  icon: "list" as IconName,         label: "Instructions" },
  { id: "fees",          icon: "chart" as IconName,        label: "Fees" },
] as const;

type BankPageId = typeof BANK_NAV[number]["id"] | "settings";

export function BankDashboard() {
  const { user } = useAuth();
  const scheme = useScheme();
  const bankId = user?.bankId ?? scheme.providers[0]?.id ?? "FNB";
  const name = bankName(scheme, bankId);
  const [page, setPage] = useState<BankPageId>("overview");
  const [mandateRef, setMandateRef] = useState<string | null>(null);
  const mandate = mandateRef ? getMandate(scheme, mandateRef) ?? null : null;

  const go = (id: string) => {
    setMandateRef(null);
    setPage(id as BankPageId);
  };

  const heading = mandate
    ? mandate.customer
    : (BANK_NAV.find(n => n.id === page)?.label ?? "Settings");

  const content = mandateRef
    ? <MandateDetailPage mandateRef={mandateRef} onBack={() => setMandateRef(null)} viewer="bank" bankId={bankId} />
    : page === "overview"     ? <BankOverviewPage bankId={bankId} bankName={name} />
    : page === "honoured"     ? <BankMandatesPage bankId={bankId} kind="honoured" onSelect={setMandateRef} />
    : page === "received"     ? <BankMandatesPage bankId={bankId} kind="received" onSelect={setMandateRef} />
    : page === "instructions" ? <BankInstructionsPage bankId={bankId} />
    : page === "fees"         ? <BankFeesPage bankId={bankId} />
    : <SettingsPage />;

  return (
    <div data-portal="bank" data-bank={bankId} style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar
        page={page}
        items={BANK_NAV}
        brand={bankId}
        subtitle="Provider"
        onNavigate={go}
      />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar heading={heading} badge={name} onSelect={setMandateRef} />
        <div className="dash-body">
          {content}
        </div>
      </main>
    </div>
  );
}

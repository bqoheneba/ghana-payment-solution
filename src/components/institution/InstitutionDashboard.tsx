"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { MandateDetailPage } from "@/components/pages/MandateDetailPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { InstitutionOverviewPage, InstitutionMandatesPage } from "@/components/institution/InstitutionPages";
import { CreateMandatePage } from "@/components/institution/CreateMandatePage";
import { INSTITUTIONS, institutionName } from "@/lib/data";
import { getMandate } from "@/lib/scheme";
import { useScheme } from "@/hooks/useScheme";
import type { IconName } from "@/components/icons";

const INST_NAV = [
  { id: "overview", icon: "home" as IconName,         label: "Overview" },
  { id: "mandates", icon: "file" as IconName,         label: "Mandates" },
  { id: "create",   icon: "plus" as IconName,         label: "New mandate" },
] as const;

type InstPageId = typeof INST_NAV[number]["id"] | "settings";

export function InstitutionDashboard() {
  const { user } = useAuth();
  const scheme = useScheme();
  const institutionId = user?.institutionId ?? INSTITUTIONS[0].id;
  const name = institutionName(institutionId);
  const [page, setPage] = useState<InstPageId>("overview");
  const [mandateRef, setMandateRef] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const mandate = mandateRef ? getMandate(scheme, mandateRef) ?? null : null;

  const go = (id: string) => {
    setMandateRef(null);
    setEditing(false);
    setPage(id as InstPageId);
  };

  const onCreated = (ref: string) => {
    setEditing(false);
    setPage("mandates");
    setMandateRef(ref);
  };

  const heading = editing
    ? "Edit mandate"
    : mandate
      ? mandate.customer
      : (INST_NAV.find(n => n.id === page)?.label ?? "Settings");

  const content = mandateRef && editing
    ? <CreateMandatePage institutionId={institutionId} mandateRef={mandateRef} onCreated={onCreated} onBack={() => setEditing(false)} />
    : mandateRef
    ? <MandateDetailPage mandateRef={mandateRef} onBack={() => { setEditing(false); setMandateRef(null); }} onEdit={() => setEditing(true)} viewer="institution" />
    : page === "overview" ? <InstitutionOverviewPage institutionId={institutionId} name={name} onCreate={() => go("create")} onSelect={setMandateRef} />
    : page === "mandates" ? <InstitutionMandatesPage institutionId={institutionId} onSelect={setMandateRef} />
    : page === "create"   ? <CreateMandatePage institutionId={institutionId} onCreated={onCreated} />
    : <SettingsPage />;

  return (
    <div data-portal="institution" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar
        page={page}
        items={INST_NAV}
        brand={institutionId}
        subtitle="Institution"
        onNavigate={go}
      />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar
          heading={heading}
          badge={name}
          onSelect={ref => {
            setEditing(false);
            setMandateRef(ref);
          }}
        />
        <div className="dash-body">
          {content}
        </div>
      </main>
    </div>
  );
}

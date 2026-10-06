"use client";

import { useState } from "react";
import { PageId, NAV_ITEMS } from "@/components/Sidebar";
import { DashShell } from "@/components/DashShell";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { MandatesPage } from "@/components/pages/MandatesPage";
import { MandateDetailPage } from "@/components/pages/MandateDetailPage";
import {
  ActivationsPage,
  DebitsPage,
  ProvidersPage,
  BankLogsPage,
  RevenuePage,
} from "@/components/pages/OtherPages";
import { UsersPage } from "@/components/pages/UsersPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { CreateMandatePage } from "@/components/institution/CreateMandatePage";
import { getMandate } from "@/lib/scheme";
import { useScheme } from "@/hooks/useScheme";

export function GDDDashboard() {
  const scheme = useScheme();
  const [page, setPage] = useState<PageId>("dashboard");
  const [mandateRef, setMandateRef] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const mandate = mandateRef ? getMandate(scheme, mandateRef) ?? null : null;

  const go = (id: PageId) => {
    setMandateRef(null);
    setEditing(false);
    setPage(id);
  };

  const openMandate = (ref: string) => {
    setEditing(false);
    setPage("mandates");
    setMandateRef(ref);
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
      : (NAV_ITEMS.find(n => n.id === page) ?? { label: page === "create" ? "Create mandate" : "Settings" }).label;

  const content = mandateRef && editing
    ? <CreateMandatePage mandateRef={mandateRef} onBehalf onCreated={onCreated} onBack={() => setEditing(false)} />
    : mandateRef
    ? <MandateDetailPage mandateRef={mandateRef} onBack={() => { setEditing(false); setMandateRef(null); }} onEdit={() => setEditing(true)} viewer="gdd" />
    : page === "dashboard"   ? <DashboardPage />
    : page === "mandates"    ? <MandatesPage onSelect={openMandate} onCreate={() => go("create")} />
    : page === "create"      ? <CreateMandatePage onBehalf onCreated={onCreated} onBack={() => go("mandates")} />
    : page === "activations" ? <ActivationsPage onSelect={openMandate} />
    : page === "debits"      ? <DebitsPage />
    : page === "providers"   ? <ProvidersPage />
    : page === "bank-logs"   ? <BankLogsPage />
    : page === "revenue"     ? <RevenuePage />
    : page === "users"       ? <UsersPage />
    : <SettingsPage />;

  return (
    <DashShell
      page={page === "create" ? "mandates" : page}
      onNavigate={id => go(id as PageId)}
      heading={heading}
      badge="GDD Regulator"
      onSelect={openMandate}
    >
      {content}
    </DashShell>
  );
}

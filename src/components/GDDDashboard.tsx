"use client";

import { useState } from "react";
import { Sidebar, PageId } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { MandatesPage } from "@/components/pages/MandatesPage";
import {
  ActivationsPage,
  DebitsPage,
  ProvidersPage,
  BankLogsPage,
  RevenuePage,
  UsersPage,
} from "@/components/pages/OtherPages";

const PAGE_MAP: Record<PageId, React.ReactNode> = {
  dashboard:   <DashboardPage />,
  mandates:    <MandatesPage />,
  activations: <ActivationsPage />,
  debits:      <DebitsPage />,
  providers:   <ProvidersPage />,
  "bank-logs": <BankLogsPage />,
  revenue:     <RevenuePage />,
  users:       <UsersPage />,
};

export function GDDDashboard() {
  const [page, setPage] = useState<PageId>("dashboard");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar page={page} onNavigate={setPage} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar page={page} />
        <div style={{ flex: 1, overflowY: "auto", padding: 28, animation: "fadeIn 0.2s ease" }}>
          {PAGE_MAP[page]}
        </div>
      </main>
    </div>
  );
}

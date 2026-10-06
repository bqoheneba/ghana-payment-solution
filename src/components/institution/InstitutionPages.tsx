"use client";

import { fmt, institutionName, frequencyLabel } from "@/lib/data";
import { mandatesForInstitution } from "@/lib/scheme";
import { useScheme } from "@/hooks/useScheme";
import { Badge, StatCard, Table, ColDef } from "@/components/ui";
import type { Mandate } from "@/lib/data";

const mandateCols: ColDef<Mandate>[] = [
  { key: "ref",           label: "Mandate Ref",  mono: true },
  { key: "customer",      label: "Customer" },
  { key: "sendingBank",   label: "Sending",      render: v => <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
  { key: "receivingBank", label: "Receiving",    render: v => <span style={{ color: "var(--purple)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
  { key: "amount",        label: "Max amount",   mono: true, render: v => fmt(v as number) },
  { key: "frequency",     label: "Frequency",    render: v => <span>{frequencyLabel(String(v))}</span> },
  { key: "status",        label: "GDD status",   render: v => <Badge status={String(v)} /> },
  { key: "activated",     label: "Submitted",    render: v => (
    <span style={{ color: v ? "var(--green)" : "var(--badge-pending)", fontSize: 12, fontWeight: 600 }}>
      {v ? "Validated" : "Sent to GDD"}
    </span>
  ) },
];

export function InstitutionOverviewPage({
  institutionId, name, onCreate, onSelect,
}: {
  institutionId: string;
  name: string;
  onCreate: () => void;
  onSelect: (ref: string) => void;
}) {
  const scheme = useScheme();
  const rows = mandatesForInstitution(scheme, institutionId);
  const pending = rows.filter(m => m.status === "pending");
  const active = rows.filter(m => m.status === "active");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5, maxWidth: 560 }}>
          {name} originates mandates here, then sends them to GDD for validation. GDD instructs the sending bank. You do not honour or receive the debit.
        </p>
        <button type="button" className="btn-primary" onClick={onCreate}>
          New mandate
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
        <StatCard label="Your mandates" value={rows.length} icon="file" />
        <StatCard label="Sent to GDD" value={pending.length} sub="Awaiting validation" accent="var(--purple)" icon="alert" />
        <StatCard label="Validated" value={active.length} sub="Banks instructed" accent="var(--green)" icon="check-circle" />
      </div>
      <div className="card">
        <div className="card-head">
          <span className="card-title">Recent submissions</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{rows.length} records</span>
        </div>
        <Table cols={mandateCols} rows={rows.slice(0, 6)} onRow={row => onSelect(row.ref)} />
      </div>
    </div>
  );
}

export function InstitutionMandatesPage({
  institutionId, onSelect,
}: {
  institutionId: string;
  onSelect: (ref: string) => void;
}) {
  const scheme = useScheme();
  const rows = mandatesForInstitution(scheme, institutionId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>
        Mandates created by {institutionName(institutionId)} and submitted to GDD.
      </p>
      <div className="card">
        <div className="card-head">
          <span className="card-title">Mandate submissions</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{rows.length} records</span>
        </div>
        <Table cols={mandateCols} rows={rows} onRow={row => onSelect(row.ref)} />
      </div>
    </div>
  );
}

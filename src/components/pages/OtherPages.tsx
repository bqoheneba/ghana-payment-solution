"use client";

import { useState } from "react";
import { MANDATES, DEBIT_REQUESTS, PROVIDERS, BANK_LOGS, fmt, fmtK } from "@/lib/data";
import { Badge, StatCard, Table, Modal, Field, Input, ColDef } from "@/components/ui";
import type { Mandate, DebitRequest, Provider } from "@/lib/data";

// ─── ACTIVATIONS ─────────────────────────────────────────────────────────────

export function ActivationsPage() {
  const activated = MANDATES.filter(m => m.activated);

  const cols: ColDef<Mandate>[] = [
    { key: "ref",         label: "Mandate Ref",      mono: true },
    { key: "customer",    label: "Customer" },
    { key: "bank",        label: "Provider",   render: v => <span style={{ color: "var(--amber)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{String(v)}</span> },
    { key: "activatedAt", label: "Activated At",     mono: true, dim: true },
    { key: "amount",      label: "Max Amount",       mono: true, render: v => fmt(v as number) },
    { key: "status",      label: "Status",           render: v => <Badge status={String(v)} /> },
    { key: "ref",         label: "Activation Fee",   render: () => <span style={{ color: "var(--green)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>₦50.00 ✓</span> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard label="Total Activated"     value={activated.length} accent="var(--green)" />
        <StatCard label="Activation Revenue"  value={`₦${(activated.length * 50).toLocaleString()}`} sub="₦50 per mandate" accent="var(--amber)" />
        <StatCard label="Pending Activation"  value={MANDATES.filter(m => !m.activated).length} accent="var(--purple)" />
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>MAN Activation Report</span>
        </div>
        <Table cols={cols} rows={activated} />
      </div>
    </div>
  );
}

// ─── DEBIT REQUESTS ──────────────────────────────────────────────────────────

export function DebitsPage() {
  const cols: ColDef<DebitRequest>[] = [
    { key: "id",        label: "Debit ID",     mono: true },
    { key: "mandate",   label: "Mandate Ref",  mono: true, dim: true },
    { key: "customer",  label: "Customer" },
    { key: "provider",  label: "Provider", render: v => <span style={{ color: "var(--amber)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{String(v)}</span> },
    { key: "amount",    label: "Amount",       mono: true, render: v => fmt(v as number) },
    { key: "attempted", label: "Attempted",    mono: true, dim: true },
    { key: "settled",   label: "Settled",      mono: true, dim: true, render: v => v ? String(v) : "—" },
    { key: "status",    label: "Status",       render: v => <Badge status={String(v)} /> },
    { key: "reason",    label: "Reason",       render: v => v ? <span style={{ color: "var(--red)", fontSize: 12 }}>{String(v)}</span> : <span>—</span> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <StatCard label="Total Requests" value={DEBIT_REQUESTS.length} />
        <StatCard label="Successful"     value={DEBIT_REQUESTS.filter(d => d.status === "success").length}   accent="var(--green)"  />
        <StatCard label="Failed"         value={DEBIT_REQUESTS.filter(d => d.status === "failed").length}    accent="var(--red)"    />
        <StatCard label="Throttled"      value={DEBIT_REQUESTS.filter(d => d.status === "throttled").length} accent="var(--purple)" />
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Debit Request Log</span>
        </div>
        <Table cols={cols} rows={DEBIT_REQUESTS} />
      </div>
    </div>
  );
}

// ─── PROVIDERS ───────────────────────────────────────────────────────────────

export function ProvidersPage() {
  const [showAdd, setShowAdd]   = useState(false);
  const [selected, setSelected] = useState<Provider | null>(null);

  const cols: ColDef<Provider>[] = [
    { key: "id",     label: "Provider ID", mono: true },
    { key: "name",   label: "Bank Name" },
    { key: "status", label: "Status",      render: v => <Badge status={String(v)} /> },
    { key: "tokenExpiry", label: "Token TTL", mono: true, dim: true },
    { key: "mandates", label: "Mandates",  mono: true, render: v => fmtK(v as number) },
    { key: "ips",    label: "Whitelisted IPs", render: v => {
      const ips = v as string[];
      return ips.length
        ? <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'IBM Plex Mono', monospace" }}>{ips.join(", ")}</span>
        : <span style={{ color: "var(--red)", fontSize: 12 }}>None</span>;
    }},
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setShowAdd(true)} style={{ background: "var(--amber)", color: "#000", border: "none", borderRadius: 6, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
          + Add Provider
        </button>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Provider Registry</span>
        </div>
        <Table cols={cols} rows={PROVIDERS} onRow={setSelected} />
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal title={`Provider: ${selected.name}`} onClose={() => setSelected(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["Provider ID", selected.id], ["Status", selected.status], ["Active Mandates", selected.mandates.toLocaleString()], ["Token Expiry", selected.tokenExpiry]].map(([k, v]) => (
                <div key={k} style={{ background: "var(--bg)", borderRadius: 6, padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
                  <div style={{ fontSize: 14, color: "var(--text)", fontFamily: "'IBM Plex Mono', monospace" }}>{v}</div>
                </div>
              ))}
            </div>
            <Field label="Client ID"><Input value="cl_live_••••••••••••••••" readOnly /></Field>
            <Field label="Client Secret"><Input value="cs_live_••••••••••••••••" readOnly /></Field>
            <Field label="Whitelisted IPs">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selected.ips.map((ip, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Input value={ip} readOnly />
                    <button style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--red)", borderRadius: 4, padding: "6px 12px", cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}>Remove</button>
                  </div>
                ))}
                <button style={{ background: "var(--surface-b)", border: "1px solid var(--border)", borderRadius: 6, padding: 8, color: "var(--text-mid)", cursor: "pointer", fontSize: 12 }}>+ Add IP</button>
              </div>
            </Field>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setSelected(null)} style={{ background: "var(--surface-b)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 20px", color: "var(--text-mid)", cursor: "pointer", fontSize: 13 }}>Close</button>
              <button style={{ background: "var(--green)", color: "#000", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Refresh Token</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add New Provider" onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Provider ID"><Input placeholder="STANBIC" /></Field>
            <Field label="Bank Name"><Input placeholder="Stanbic IBTC Bank" /></Field>
            <Field label="Client ID"><Input placeholder="cl_live_…" /></Field>
            <Field label="Client Secret"><Input placeholder="cs_live_…" type="password" /></Field>
            <Field label="Whitelisted IPs (comma-separated)"><Input placeholder="41.58.0.1, 41.58.0.2" /></Field>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 20px", color: "var(--text-mid)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              <button style={{ background: "var(--amber)", color: "#000", border: "none", borderRadius: 6, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Register Provider</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── BANK LOGS ───────────────────────────────────────────────────────────────

export function BankLogsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Bank API Logs</span>
          <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace" }}>Live · {BANK_LOGS.length} entries</span>
        </div>
        <div>
          {BANK_LOGS.map((l, i) => (
            <div key={i} style={{
              padding: "12px 20px", display: "flex", alignItems: "center", gap: 16,
              borderBottom: i < BANK_LOGS.length - 1 ? "1px solid var(--border)" : "none",
              fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
            }}>
              <span style={{ color: "var(--text-dim)", minWidth: 64 }}>{l.ts}</span>
              <span style={{ color: "var(--amber)", minWidth: 60 }}>{l.provider}</span>
              <span style={{ color: l.direction === "IN" ? "var(--blue)" : "var(--purple)", background: l.direction === "IN" ? "rgba(59,130,246,0.1)" : "rgba(168,85,247,0.1)", padding: "1px 6px", borderRadius: 3, minWidth: 28, textAlign: "center" as const }}>{l.direction}</span>
              <span style={{ color: "var(--text-mid)", flex: 1 }}>{l.event}</span>
              <span style={{ color: "var(--text-dim)" }}>{l.ref}</span>
              <span style={{ color: l.status === 200 ? "var(--green)" : "var(--red)", background: l.status === 200 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", padding: "1px 8px", borderRadius: 3 }}>{l.status}</span>
              <span style={{ color: "var(--text-dim)", minWidth: 48, textAlign: "right" as const }}>{l.ms}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REVENUE ─────────────────────────────────────────────────────────────────

export function RevenuePage() {
  const activated    = MANDATES.filter(m => m.activated);
  const activationRev = activated.length * 5000;
  const debitVol     = DEBIT_REQUESTS.filter(d => d.status === "success").reduce((s, d) => s + d.amount, 0);
  const totalRev     = PROVIDERS.reduce((s, p) => s + p.mandates * 5000, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard label="Activation Revenue"    value={fmt(activationRev)} sub={`${activated.length} mandates × ₦50`} accent="var(--amber)" />
        <StatCard label="Debit Volume Settled"  value={fmt(debitVol)}      sub="Today"                               accent="var(--green)" />
        <StatCard label="Total Providers"       value={PROVIDERS.length}   sub="Registered banks" />
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Revenue by Provider</span>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {PROVIDERS.map(p => {
            const rev = p.mandates * 5000;
            const pct = Math.round(rev / totalRev * 100);
            return (
              <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text)", fontFamily: "'IBM Plex Mono', monospace" }}>{p.id}</span>
                  <span style={{ color: "var(--amber)", fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(rev)}</span>
                </div>
                <div style={{ height: 4, background: "var(--bg)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "var(--amber)", borderRadius: 2, transition: "width 0.6s ease" }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{p.mandates.toLocaleString()} mandates · {pct}% of total</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── USERS ───────────────────────────────────────────────────────────────────

const USERS = [
  { name: "Admin User",   email: "admin@gdd.io",    role: "Super Admin",    status: "active",   last: "2024-01-28 09:00" },
  { name: "Ops Manager",  email: "ops@gdd.io",      role: "Operations",     status: "active",   last: "2024-01-28 08:44" },
  { name: "Finance Lead", email: "finance@gdd.io",  role: "Finance Viewer", status: "active",   last: "2024-01-27 17:30" },
  { name: "API Client",   email: "api@provider.com", role: "Provider API",  status: "inactive", last: "2024-01-20 12:00" },
];
type User = (typeof USERS)[number];
const ROLES = ["Super Admin", "Operations", "Finance Viewer", "Provider API", "Read Only"];

export function UsersPage() {
  const cols: ColDef<User>[] = [
    { key: "name",   label: "Name" },
    { key: "email",  label: "Email",  mono: true, dim: true },
    { key: "role",   label: "Role",   render: v => <span style={{ color: "var(--purple)", background: "rgba(168,85,247,0.1)", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>{String(v)}</span> },
    { key: "status", label: "Status", render: v => <Badge status={String(v)} /> },
    { key: "last",   label: "Last Active", mono: true, dim: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 16 }}>RBAC Roles</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ROLES.map(r => (
              <div key={r} style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 6, fontSize: 13, color: "var(--text)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{r}</span>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Edit →</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Users</span>
            <button style={{ background: "var(--amber)", color: "#000", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ Invite User</button>
          </div>
          <Table cols={cols} rows={USERS} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MANDATES, PROVIDERS, fmt, genMandateRef } from "@/lib/data";
import { Badge, Table, Modal, Field, Input, Select, ColDef } from "@/components/ui";
import type { Mandate } from "@/lib/data";

export function MandatesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [provFilter, setProvFilter] = useState("ALL");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");

  const [form, setForm] = useState({
    ref: genMandateRef(),
    customerName: "", customerId: "", phone: "", address: "",
    accountName: "", accountNumber: "", bank: "GTB",
    amount: "", startDate: "", endDate: "",
  });

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = MANDATES.filter(m => {
    if (filter !== "all" && m.status !== filter) return false;
    if (provFilter !== "ALL" && m.bank !== provFilter) return false;
    if (search && !m.customer.toLowerCase().includes(search.toLowerCase()) && !m.ref.includes(search)) return false;
    return true;
  });

  const cols: ColDef<Mandate>[] = [
    { key: "ref",      label: "Mandate Ref",  mono: true },
    { key: "customer", label: "Customer" },
    { key: "account",  label: "Account",      mono: true, dim: true },
    { key: "bank",     label: "Bank", render: v => <span style={{ color: "var(--amber)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{String(v)}</span> },
    { key: "amount",   label: "Max Amount",   mono: true, render: v => fmt(v as number) },
    { key: "start",    label: "Start",        mono: true, dim: true },
    { key: "end",      label: "End",          mono: true, dim: true },
    { key: "status",   label: "Status",       render: v => <Badge status={String(v)} /> },
    { key: "activated",label: "Activated",    render: v => <span style={{ color: v ? "var(--green)" : "var(--text-dim)", fontSize: 12 }}>{v ? "✓ Yes" : "Pending"}</span> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search mandate ref or customer…"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 14px", color: "var(--text)", fontSize: 13, outline: "none", minWidth: 260, fontFamily: "'IBM Plex Mono', monospace" }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 14px", color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <select value={provFilter} onChange={e => setProvFilter(e.target.value)}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 14px", color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="ALL">All Providers</option>
          {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 14px", color: "var(--text)", fontSize: 13, outline: "none" }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 14px", color: "var(--text)", fontSize: 13, outline: "none" }} />
        <button
          onClick={() => setShowCreate(true)}
          style={{ marginLeft: "auto", background: "var(--amber)", color: "#000", border: "none", borderRadius: 6, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}
        >+ New Mandate</button>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Mandate Ledger</span>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{filtered.length} records</span>
        </div>
        <Table cols={cols} rows={filtered as unknown as Record<string, unknown>[]} />
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create New Mandate" onClose={() => setShowCreate(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Mandate Reference" hint="Auto-generated — immutable">
              <Input value={form.ref} readOnly />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Customer Full Name">
                <Input value={form.customerName} onChange={f("customerName")} placeholder="Amara Okonkwo" />
              </Field>
              <Field label="Customer ID / NIN">
                <Input value={form.customerId} onChange={f("customerId")} placeholder="12345678901" />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Phone Number">
                <Input value={form.phone} onChange={f("phone")} placeholder="+234 800 000 0000" />
              </Field>
              <Field label="Provider / Bank">
                <Select value={form.bank} onChange={f("bank")} options={PROVIDERS.map(p => ({ value: p.id, label: p.name }))} />
              </Field>
            </div>
            <Field label="Customer Address">
              <Input value={form.address} onChange={f("address")} placeholder="12 Example Street, Lagos" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Account Name">
                <Input value={form.accountName} onChange={f("accountName")} placeholder="AMARA OKONKWO" />
              </Field>
              <Field label="Account Number">
                <Input value={form.accountNumber} onChange={f("accountNumber")} placeholder="0123456789" />
              </Field>
            </div>
            <Field label="Maximum Debit Amount (kobo)" hint="₦50,000 = 5000000 kobo">
              <Input value={form.amount} onChange={f("amount")} placeholder="5000000" type="number" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Start Date"><Input value={form.startDate} onChange={f("startDate")} type="date" /></Field>
              <Field label="End Date">  <Input value={form.endDate}   onChange={f("endDate")}   type="date" /></Field>
            </div>
            <div style={{ background: "#1A1400", border: "1px solid #7A5212", borderRadius: 6, padding: "12px 16px", fontSize: 12, color: "var(--amber)", fontFamily: "'IBM Plex Mono', monospace" }}>
              ⚡ Activation fee of ₦50.00 will be charged on mandate approval
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 20px", color: "var(--text-mid)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              <button
                onClick={() => { alert(`Mandate ${form.ref} sent to GDD API.\nActivation fee: ₦50.00`); setShowCreate(false); }}
                style={{ background: "var(--amber)", color: "#000", border: "none", borderRadius: 6, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >Send to GDD API →</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

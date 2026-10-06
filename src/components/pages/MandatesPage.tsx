"use client";

import { useState } from "react";
import { INSTITUTIONS, fmt, institutionName, frequencyLabel } from "@/lib/data";
import { useScheme } from "@/hooks/useScheme";
import { Badge, Table, ColDef } from "@/components/ui";
import type { Mandate } from "@/lib/data";

export function MandatesPage({ onSelect, onCreate }: { onSelect: (ref: string) => void; onCreate?: () => void }) {
  const { mandates, providers } = useScheme();
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [instFilter, setInstFilter] = useState("ALL");
  const [bankFilter, setBankFilter] = useState("ALL");

  const filtered = mandates.filter(m => {
    if (filter !== "all" && m.status !== filter) return false;
    if (instFilter !== "ALL" && m.institution !== instFilter) return false;
    if (bankFilter !== "ALL" && m.sendingBank !== bankFilter && m.receivingBank !== bankFilter) return false;
    if (search && !m.customer.toLowerCase().includes(search.toLowerCase()) && !m.ref.includes(search)) return false;
    return true;
  });

  const cols: ColDef<Mandate>[] = [
    { key: "ref",          label: "Mandate Ref",    mono: true },
    { key: "institution",  label: "Institution",    render: v => <span>{institutionName(String(v))}</span> },
    { key: "customer",     label: "Customer" },
    { key: "sendingBank",  label: "Sending bank",   render: v => <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "receivingBank",label: "Receiving bank", render: v => <span style={{ color: "var(--purple)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "amount",       label: "Max Amount",     mono: true, render: v => fmt(v as number) },
    { key: "frequency",    label: "Frequency",      render: v => <span>{frequencyLabel(String(v))}</span> },
    { key: "status",       label: "Status",         render: v => <Badge status={String(v)} /> },
    { key: "activated",    label: "Validated",      render: v => <span style={{ color: v ? "var(--green)" : "var(--text-dim)", fontSize: 12, fontWeight: 600 }}>{v ? "Yes" : "Queued"}</span> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-toolbar">
        <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5, maxWidth: 640 }}>
          Institutions submit mandates through their own apps, or GDD can originate one on their behalf. Validate each pending mandate, then instruct the sending bank to honour it.
        </p>
        {onCreate && (
          <button type="button" className="btn-primary" onClick={onCreate} style={{ flexShrink: 0 }}>
            Create mandate
          </button>
        )}
      </div>
      <div className="filter-bar">
        <input
          className="filter-control filter-search"
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search mandate ref or customer"
        />
        <select className="filter-control" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending validation</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className="filter-control" value={instFilter} onChange={e => setInstFilter(e.target.value)}>
          <option value="ALL">All institutions</option>
          {INSTITUTIONS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <select className="filter-control" value={bankFilter} onChange={e => setBankFilter(e.target.value)}>
          <option value="ALL">All banks</option>
          {providers.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Mandate ledger</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{filtered.length} records</span>
        </div>
        <Table cols={cols} rows={filtered} onRow={row => onSelect(row.ref)} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  INSTITUTIONS, fmt, fmtK, institutionName, activationShares, bankApiCredentials,
  ACTIVATION_FEE, FEE_GDD, FEE_SENDING_BANK, FEE_RECEIVING_BANK, inPeriod,
  type PeriodFilter,
  type Mandate, type DebitRequest, type Provider,
} from "@/lib/data";
import { addBank, addBankIp, bankMandateStats, refreshBankToken, removeBankIp } from "@/lib/scheme";
import { useScheme } from "@/hooks/useScheme";
import { Badge, StatCard, Table, Modal, Field, Input, ColDef } from "@/components/ui";
import { Icon } from "@/components/icons";

export function ActivationsPage({ onSelect }: { onSelect?: (ref: string) => void }) {
  const { mandates } = useScheme();
  const activated = mandates.filter(m => m.activated);
  const shares = activationShares(activated.length);

  const cols: ColDef<Mandate>[] = [
    { key: "ref",          label: "Mandate Ref",    mono: true },
    { key: "institution",  label: "Institution",    render: v => <span>{institutionName(String(v))}</span> },
    { key: "customer",     label: "Customer" },
    { key: "sendingBank",  label: "Sending",        render: v => <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "receivingBank",label: "Receiving",      render: v => <span style={{ color: "var(--purple)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "activatedAt",  label: "Validated at",   mono: true, dim: true },
    { key: "status",       label: "Status",         render: v => <Badge status={String(v)} /> },
    { key: "feePaid",      label: "Activation fee", mono: true, render: () => <span style={{ fontWeight: 600 }}>{fmt(ACTIVATION_FEE)}</span> },
    { key: "gddShare",     label: "GDD share",      render: () => <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 12 }}>{fmt(FEE_GDD)}</span> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
        <StatCard label="Validated" value={activated.length} accent="var(--green)" icon="check-circle" />
        <StatCard label="GDD share" value={fmt(shares.gdd)} sub={`${fmt(FEE_GDD)} of ${fmt(ACTIVATION_FEE)}`} accent="var(--accent)" icon="wallet" />
        <StatCard label="Sending banks" value={fmt(shares.sending)} sub={`${fmt(FEE_SENDING_BANK)} each`} icon="bank" />
        <StatCard label="Receiving banks" value={fmt(shares.receiving)} sub={`${fmt(FEE_RECEIVING_BANK)} each`} accent="var(--purple)" icon="swap" />
      </div>
      <div className="card">
        <div className="card-head">
          <span className="card-title">Activation report</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>Customer pays {fmt(ACTIVATION_FEE)}</span>
        </div>
        <Table cols={cols} rows={activated} onRow={onSelect ? row => onSelect(row.ref) : undefined} />
      </div>
    </div>
  );
}

export function DebitsPage() {
  const { debits } = useScheme();
  const cols: ColDef<DebitRequest>[] = [
    { key: "id",            label: "Debit ID",       mono: true },
    { key: "mandate",       label: "Mandate Ref",    mono: true, dim: true },
    { key: "customer",      label: "Customer" },
    { key: "sendingBank",   label: "Sending bank",   render: v => <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "receivingBank", label: "Receiving bank", render: v => <span style={{ color: "var(--purple)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "amount",        label: "Amount",         mono: true, render: v => fmt(v as number) },
    { key: "attempted",     label: "Instructed",     mono: true, dim: true },
    { key: "settled",       label: "Honoured",       mono: true, dim: true, render: v => v ? String(v) : "—" },
    { key: "creditedAt",    label: "Received",       mono: true, dim: true, render: v => v ? String(v) : "—" },
    { key: "status",        label: "Status",         render: v => <Badge status={String(v)} /> },
    { key: "reason",        label: "Reason",         render: v => v ? <span style={{ color: "var(--red)", fontSize: 12 }}>{String(v)}</span> : <span>—</span> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
        <StatCard label="Instructions" value={debits.length} icon="swap" />
        <StatCard label="Honoured"     value={debits.filter(d => d.status === "success").length}   accent="var(--green)" icon="check-circle" />
        <StatCard label="Failed"       value={debits.filter(d => d.status === "failed").length}    accent="var(--red)" icon="alert" />
        <StatCard label="Received"     value={debits.filter(d => d.creditedAt).length} accent="var(--purple)" icon="activity" />
      </div>
      <div className="card">
        <div className="card-head">
          <span className="card-title">Honour instruction log</span>
        </div>
        <Table cols={cols} rows={debits} />
      </div>
    </div>
  );
}

export function ProvidersPage() {
  const scheme = useScheme();
  const [showAdd, setShowAdd]   = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bankId, setBankId]     = useState("");
  const [bankName, setBankName] = useState("");
  const [ipsText, setIpsText]   = useState("");
  const [newIp, setNewIp]       = useState("");
  const [error, setError]       = useState<string | null>(null);
  const selected = scheme.providers.find(p => p.id === selectedId) ?? null;
  const stats = selected ? bankMandateStats(scheme, selected.id) : null;
  const selectedCreds = selected ? bankApiCredentials(selected.id, selected.name) : null;
  const draftCreds = bankApiCredentials(bankId, bankName);

  const closeAdd = () => {
    setShowAdd(false);
    setBankId("");
    setBankName("");
    setIpsText("");
    setError(null);
  };

  const register = () => {
    setError(null);
    try {
      const bank = addBank({
        id: bankId,
        name: bankName,
        ips: ipsText.split(",").map(ip => ip.trim()).filter(Boolean),
      });
      closeAdd();
      setSelectedId(bank.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register the bank.");
    }
  };

  const cols: ColDef<Provider>[] = [
    { key: "id",     label: "Bank ID", mono: true },
    { key: "name",   label: "Bank" },
    { key: "status", label: "API status", render: v => <Badge status={String(v)} /> },
    { key: "tokenExpiry", label: "Token TTL", mono: true, dim: true },
    { key: "honoured", label: "Honoured", render: (_v, row) => <span>{fmtK(bankMandateStats(scheme, row.id).honoured)}</span> },
    { key: "received", label: "Received", render: (_v, row) => <span>{fmtK(bankMandateStats(scheme, row.id).received)}</span> },
    { key: "ips",    label: "Whitelisted IPs", render: v => {
      const ips = v as string[];
      return ips.length
        ? <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{ips.join(", ")}</span>
        : <span style={{ color: "var(--red)", fontSize: 12 }}>None</span>;
    }},
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>
        Only banks sit on the scheme as providers. A sending bank honours the customer debit. A receiving bank, also on GDD, is credited. Institution apps are separate.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Icon name="plus" size={16} /> Add bank
        </button>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Bank registry</span>
        </div>
        <Table cols={cols} rows={scheme.providers} onRow={row => setSelectedId(row.id)} />
      </div>

      {selected && stats && selectedCreds && (
        <Modal title={selected.name} onClose={() => { setSelectedId(null); setNewIp(""); setError(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Bank ID", selected.id],
                ["API status", selected.status],
                ["Mandates honoured", String(stats.honoured)],
                ["Mandates received", String(stats.received)],
                ["Token expiry", selected.tokenExpiry],
                ["Institutions on scheme", String(INSTITUTIONS.length)],
              ].map(([k, v]) => (
                <div key={k} className="meta-tile">
                  <div style={{ fontSize: 12, color: "var(--text-mid)", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
            <Field label="Client ID" hint="Issued as cl_live_gdd_{bank}">
              <Input value={selectedCreds.clientId} readOnly />
            </Field>
            <Field label="Client Secret" hint="Issued as cs_live_gdd_{bank}_{fingerprint}">
              <Input value={selectedCreds.clientSecret} readOnly />
            </Field>
            <Field label="Whitelisted IPs">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selected.ips.map(ip => (
                  <div key={ip} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Input value={ip} readOnly />
                    <button type="button" className="btn-danger" onClick={() => removeBankIp(selected.id, ip)}>Remove</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8 }}>
                  <Input value={newIp} onChange={e => setNewIp(e.target.value)} placeholder="41.58.0.1" />
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      try {
                        addBankIp(selected.id, newIp);
                        setNewIp("");
                        setError(null);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Unable to add IP.");
                      }
                    }}
                  >
                    Add IP
                  </button>
                </div>
              </div>
            </Field>
            {error && <div className="notice-error">{error}</div>}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => { setSelectedId(null); setNewIp(""); setError(null); }}>Close</button>
              <button type="button" className="btn-success" onClick={() => refreshBankToken(selected.id)}>Refresh Token</button>
            </div>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Register a bank" onClose={closeAdd}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Bank name">
              <Input
                value={bankName}
                onChange={e => {
                  const name = e.target.value;
                  const oldAuto = bankName.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 12);
                  const nextAuto = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 12);
                  setBankName(name);
                  setBankId(id => (!id || id === oldAuto) ? nextAuto : id);
                }}
                placeholder="CalBank PLC"
              />
            </Field>
            <Field label="Bank ID" hint="A provider login is created as ops@{id}.gdd.bank with password gdd-demo.">
              <Input value={bankId} onChange={e => setBankId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="CALBANK" />
            </Field>
            <Field label="Client ID" hint="Generated as cl_live_gdd_{bank}">
              <Input value={draftCreds.clientId} readOnly />
            </Field>
            <Field label="Client Secret" hint="Generated as cs_live_gdd_{bank}_{fingerprint}">
              <Input value={draftCreds.clientSecret} readOnly />
            </Field>
            <Field label="Whitelisted IPs (comma-separated)">
              <Input value={ipsText} onChange={e => setIpsText(e.target.value)} placeholder="41.58.0.1, 41.58.0.2" />
            </Field>
            {error && <div className="notice-error">{error}</div>}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={closeAdd}>Cancel</button>
              <button type="button" className="btn-primary" onClick={register}>Register bank</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function BankLogsPage() {
  const { logs } = useScheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card">
        <div className="card-head">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            <span className="card-title">Scheme API logs</span>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>Live · {logs.length} entries</span>
        </div>
        <div>
          {logs.map((l, i) => (
            <div key={`${l.ts}-${l.ref}-${l.event}-${i}`} style={{
              padding: "12px 24px", display: "flex", alignItems: "center", gap: 16,
              borderTop: "1px solid var(--border)",
              fontSize: 13, fontVariantNumeric: "tabular-nums",
            }}>
              <span style={{ color: "var(--text-dim)", minWidth: 64 }}>{l.ts}</span>
              <span style={{ color: "var(--accent)", fontWeight: 600, minWidth: 60 }}>{l.provider}</span>
              <span className="dir-chip" style={{
                color: l.direction === "IN" ? "var(--blue)" : "var(--purple)",
                background: l.direction === "IN" ? "var(--accent-dim)" : "var(--badge-throttled-bg)",
              }}>{l.direction}</span>
              <span style={{ color: "var(--text-mid)", flex: 1 }}>{l.event}</span>
              <span style={{ color: "var(--text-dim)" }}>{l.ref}</span>
              <span style={{
                color: l.status === 200 ? "var(--green)" : "var(--red)",
                background: l.status === 200 ? "var(--badge-success-bg)" : "var(--badge-failed-bg)",
                padding: "3px 8px", borderRadius: 20, fontWeight: 600, fontSize: 12,
              }}>{l.status}</span>
              <span style={{ color: "var(--text-dim)", minWidth: 48, textAlign: "right" }}>{l.ms}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RevenuePage() {
  const scheme = useScheme();
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const activated = scheme.mandates.filter(m => m.activated && inPeriod(m.activatedAt, period));
  const honouredDebits = scheme.debits.filter(d => d.status === "success" && inPeriod(d.settled ?? d.attempted, period));
  const shares = activationShares(activated.length);
  const debitVol = honouredDebits.reduce((s, d) => s + d.amount, 0);
  const sendingCounts = Object.fromEntries(
    scheme.providers.map(p => [
      p.id,
      {
        honoured: activated.filter(m => m.sendingBank === p.id).length,
        received: activated.filter(m => m.receivingBank === p.id).length,
      },
    ]),
  );
  const sendingTotal = scheme.providers.reduce((s, p) => s + sendingCounts[p.id].honoured * FEE_SENDING_BANK, 0);
  const periodLabel = period === "today" ? "today" : "all time";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <select className="filter-control" value={period} onChange={e => setPeriod(e.target.value as PeriodFilter)}>
          <option value="all">All time</option>
          <option value="today">Today</option>
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
        <StatCard label="Fees collected"     value={fmt(shares.collected)} sub={`${activated.length} × ${fmt(ACTIVATION_FEE)}`} icon="wallet" />
        <StatCard label="GDD platform"       value={fmt(shares.gdd)}       sub={`${fmt(FEE_GDD)} per activation`} accent="var(--accent)" icon="chart" />
        <StatCard label="Sending banks"      value={fmt(shares.sending)}   sub={`${fmt(FEE_SENDING_BANK)} per activation`} icon="bank" />
        <StatCard label="Receiving banks"    value={fmt(shares.receiving)} sub={`${fmt(FEE_RECEIVING_BANK)} per activation`} accent="var(--purple)" icon="swap" />
      </div>
      <div className="card">
        <div className="card-head">
          <span className="card-title">Debit volume instructed</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{fmt(debitVol)} honoured {periodLabel}</span>
        </div>
        <div style={{ padding: "8px 24px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {scheme.providers.map(p => {
            const honoured = sendingCounts[p.id].honoured;
            const share = honoured * FEE_SENDING_BANK;
            const pct = sendingTotal ? Math.round(share / sendingTotal * 100) : 0;
            return (
              <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>{p.name}</span>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>{fmt(share)}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  {honoured} honoured · {sendingCounts[p.id].received} received · {pct}% of sending-bank fees
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

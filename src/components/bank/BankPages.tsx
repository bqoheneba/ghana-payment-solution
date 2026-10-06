"use client";

import {
  fmt, institutionName, frequencyLabel, FEE_SENDING_BANK, FEE_RECEIVING_BANK,
  type Mandate, type DebitRequest, type BankActivationFee,
} from "@/lib/data";
import {
  honouredMandates, receivedMandates, debitsForBank,
  logsForBank, bankFeeIncome, bankActivationFees,
} from "@/lib/scheme";
import { useScheme } from "@/hooks/useScheme";
import { Badge, StatCard, Table, ColDef } from "@/components/ui";
import { DebitRowActions } from "@/components/bank/DebitActions";

const mandateCols: ColDef<Mandate>[] = [
  { key: "ref",           label: "Mandate Ref",  mono: true },
  { key: "institution",   label: "Institution",  render: v => <span>{institutionName(String(v))}</span> },
  { key: "customer",      label: "Customer" },
  { key: "sendingBank",   label: "Sending",      render: v => <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
  { key: "receivingBank", label: "Receiving",    render: v => <span style={{ color: "var(--purple)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
  { key: "amount",        label: "Max amount",   mono: true, render: v => fmt(v as number) },
  { key: "frequency",     label: "Frequency",    render: v => <span>{frequencyLabel(String(v))}</span> },
  { key: "status",        label: "Status",       render: v => <Badge status={String(v)} /> },
];

export function BankOverviewPage({ bankId, bankName }: { bankId: string; bankName: string }) {
  const scheme = useScheme();
  const honoured = honouredMandates(scheme, bankId);
  const received = receivedMandates(scheme, bankId);
  const debits = debitsForBank(scheme, bankId);
  const logs = logsForBank(scheme, bankId);
  const fees = bankFeeIncome(scheme, bankId);
  const failed = debits.filter(d => d.status === "failed" || d.status === "throttled");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>
        {bankName} on the GDD scheme. Honour instructions debit your customers. Received mandates credit accounts at {bankName}.
      </p>
      <div className="stat-row">
        <StatCard label="Honoured" value={honoured.length} sub="You are the sending bank" icon="swap" />
        <StatCard label="Received" value={received.length} sub="You are the corresponding bank" accent="var(--purple)" icon="check-circle" />
        <StatCard label="Instructions" value={debits.length} sub={`${debits.filter(d => d.status === "success").length} honoured`} accent="var(--blue)" icon="list" />
        <StatCard label="Fee income" value={fmt(fees.total)} sub={`${fmt(FEE_SENDING_BANK)} per activation`} accent="var(--accent)" icon="wallet" />
      </div>

      <div className="split-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Failed instructions</span></div>
          <div style={{ padding: "4px 12px 16px" }}>
            {failed.length === 0 && <div style={{ padding: 12, fontSize: 13, color: "var(--text-mid)" }}>No failed instructions.</div>}
            {failed.map(d => (
              <div key={d.id} className="stack-row" style={{ padding: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{d.customer}</div>
                  <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 3 }}>{d.id} · {d.reason}</div>
                </div>
                <Badge status={d.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">Your API log</span></div>
          <div>
            {logs.slice(0, 6).map((l, i) => (
              <div key={`${l.ts}-${l.ref}-${i}`} className="log-row">
                <span style={{ color: "var(--text-dim)", minWidth: 56 }}>{l.ts}</span>
                <span className="dir-chip" style={{
                  color: l.direction === "IN" ? "var(--blue)" : "var(--purple)",
                  background: l.direction === "IN" ? "var(--accent-dim)" : "var(--badge-throttled-bg)",
                }}>{l.direction}</span>
                <span style={{ color: "var(--text-mid)", flex: 1 }}>{l.event}</span>
                <span style={{ color: l.status === 200 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{l.status}</span>
              </div>
            ))}
            {logs.length === 0 && <div style={{ padding: "12px 24px 20px", fontSize: 13, color: "var(--text-mid)" }}>No recent API calls.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BankMandatesPage({
  bankId, kind, onSelect,
}: {
  bankId: string;
  kind: "honoured" | "received";
  onSelect: (ref: string) => void;
}) {
  const scheme = useScheme();
  const rows = kind === "honoured" ? honouredMandates(scheme, bankId) : receivedMandates(scheme, bankId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>
        {kind === "honoured"
          ? "GDD instructed you to debit these customers. You are the sending bank."
          : "These mandates credit accounts at your bank. You are the receiving bank on the scheme."}
      </p>
      <div className="card">
        <div className="card-head">
          <span className="card-title">{kind === "honoured" ? "Honoured mandates" : "Received mandates"}</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{rows.length} records</span>
        </div>
        <Table cols={mandateCols} rows={rows} onRow={row => onSelect(row.ref)} />
      </div>
    </div>
  );
}

export function BankInstructionsPage({ bankId }: { bankId: string }) {
  const scheme = useScheme();
  const rows = debitsForBank(scheme, bankId);
  const debitCols: ColDef<DebitRequest>[] = [
    { key: "id",            label: "Instruction",  mono: true },
    { key: "mandate",       label: "Mandate",      mono: true, dim: true },
    { key: "customer",      label: "Customer" },
    { key: "sendingBank",   label: "Sending",      render: v => <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "receivingBank", label: "Receiving",    render: v => <span style={{ color: "var(--purple)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "amount",        label: "Amount",       mono: true, render: v => fmt(v as number) },
    { key: "status",        label: "Status",       render: v => <Badge status={String(v)} /> },
    { key: "creditedAt",    label: "Received",     mono: true, dim: true, render: v => <span>{v ? String(v) : "—"}</span> },
    { key: "action",        label: "Action",       render: (_v, row) => <DebitRowActions debit={row} bankId={bankId} /> },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>
        If you are the sending bank, honour or decline pending instructions. If you are the receiving bank, confirm credit after a debit is honoured.
      </p>
      <div className="card">
        <div className="card-head">
          <span className="card-title">Honour instructions</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{rows.length} requests</span>
        </div>
        <Table cols={debitCols} rows={rows} />
      </div>
    </div>
  );
}

const feeCols: ColDef<BankActivationFee>[] = [
  { key: "ref",          label: "Mandate Ref",  mono: true },
  { key: "customer",     label: "Customer" },
  { key: "institution",  label: "Institution",  render: v => <span>{institutionName(String(v))}</span> },
  { key: "role",         label: "Your role",    render: v => (
    <span style={{ color: v === "Sending" ? "var(--accent)" : "var(--purple)", fontWeight: 600, fontSize: 12 }}>
      {String(v)}
    </span>
  ) },
  { key: "activatedAt",  label: "Activated",    mono: true, dim: true, render: v => <span>{v ? String(v) : "—"}</span> },
  { key: "fee",          label: "Your fee",     mono: true, render: v => <span style={{ fontWeight: 600 }}>{fmt(v as number)}</span> },
];

export function BankFeesPage({ bankId }: { bankId: string }) {
  const scheme = useScheme();
  const fees = bankFeeIncome(scheme, bankId);
  const rows = bankActivationFees(scheme, bankId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="stat-row">
        <StatCard label="Your fee income" value={fmt(fees.total)} sub={`${rows.length} activations × ${fmt(FEE_SENDING_BANK)}`} icon="wallet" />
        <StatCard label="As sending bank" value={fmt(fees.sendingFees)} sub={`${fees.sendingCount} × ${fmt(FEE_SENDING_BANK)}`} accent="var(--accent)" icon="swap" />
        <StatCard label="As receiving bank" value={fmt(fees.receivingFees)} sub={`${fees.receivingCount} × ${fmt(FEE_RECEIVING_BANK)}`} accent="var(--purple)" icon="check-circle" />
      </div>
      <div className="card">
        <div className="card-head">
          <span className="card-title">Fee per activation</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{fmt(FEE_SENDING_BANK)} each</span>
        </div>
        <Table cols={feeCols} rows={rows} />
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import {
  fmt, institutionName,
  ACTIVATION_FEE, FEE_SENDING_BANK, FEE_GDD, FEE_RECEIVING_BANK, frequencyLabel,
  type DebitRequest,
} from "@/lib/data";
import { bankName, getMandateDebits, getMandateLogs, validateMandate } from "@/lib/scheme";
import { useScheme } from "@/hooks/useScheme";
import { Badge, StatCard, Table, ColDef } from "@/components/ui";
import { Icon } from "@/components/icons";
import { DebitRowActions } from "@/components/bank/DebitActions";

interface MandateDetailPageProps {
  mandateRef: string;
  onBack: () => void;
  onEdit?: () => void;
  viewer?: "gdd" | "bank" | "institution";
  bankId?: string;
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="meta-tile">
      <div style={{ fontSize: 12, color: "var(--text-mid)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

export function MandateDetailPage({ mandateRef, onBack, onEdit, viewer = "gdd", bankId }: MandateDetailPageProps) {
  const scheme = useScheme();
  const mandate = scheme.mandates.find(m => m.ref === mandateRef);
  const regulator = viewer === "gdd";
  const bankView = viewer === "bank";

  if (!mandate) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <button type="button" className="btn-ghost" onClick={onBack}>Back</button>
        <div className="notice-error">This mandate is no longer on the scheme.</div>
      </div>
    );
  }

  const sending = scheme.providers.find(p => p.id === mandate.sendingBank);
  const receiving = scheme.providers.find(p => p.id === mandate.receivingBank);
  const debits = getMandateDebits(scheme, mandate.ref);
  const logs = getMandateLogs(scheme, mandate.ref);
  const settled = debits.filter(d => d.status === "success").reduce((s, d) => s + d.amount, 0);
  const pending = mandate.status === "pending";
  const yourFee = bankId && mandate.receivingBank === bankId ? FEE_RECEIVING_BANK : FEE_SENDING_BANK;

  const debitCols: ColDef<DebitRequest>[] = [
    { key: "id",            label: "Debit ID",        mono: true },
    { key: "amount",        label: "Amount",          mono: true, render: v => fmt(v as number) },
    { key: "sendingBank",   label: "Sending bank",    render: v => <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "receivingBank", label: "Receiving bank",  render: v => <span style={{ color: "var(--purple)", fontWeight: 600, fontSize: 12 }}>{String(v)}</span> },
    { key: "attempted",     label: "Instructed",      mono: true, dim: true },
    { key: "status",        label: "Status",          render: v => <Badge status={String(v)} /> },
    { key: "creditedAt",    label: "Credited",        mono: true, dim: true, render: v => <span>{v ? String(v) : "—"}</span> },
    { key: "reason",        label: "Reason",          render: v => v ? <span style={{ color: "var(--red)", fontSize: 12 }}>{String(v)}</span> : <span style={{ color: "var(--text-dim)" }}>—</span> },
  ];
  if (bankView && bankId) {
    debitCols.push({
      key: "action",
      label: "Action",
      render: (_v, row) => <DebitRowActions debit={row} bankId={bankId} />,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to mandates"
          style={{
            width: 40, height: 40, border: "none", borderRadius: 12,
            background: "var(--surface)", boxShadow: "var(--shadow)",
            color: "var(--text-mid)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon name="chevron-left" size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>{mandate.customer}</div>
          <div style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
            {mandate.ref} · {institutionName(mandate.institution)}
          </div>
        </div>
        <Badge status={mandate.status} />
        {onEdit && viewer !== "bank" && (
          <button type="button" className="btn-ghost" onClick={onEdit}>
            Edit
          </button>
        )}
        {regulator && pending && (
          <button type="button" className="btn-primary" onClick={() => validateMandate(mandate.ref)}>
            Validate & instruct bank
          </button>
        )}
      </div>

      {regulator && pending && (
        <div className="notice-warn">
          Submitted by {institutionName(mandate.institution)}. Validate to instruct {bankName(scheme, mandate.sendingBank)} to honour the mandate. Funds will credit {bankName(scheme, mandate.receivingBank)}. Activation fee {fmt(ACTIVATION_FEE)}: sending bank {fmt(FEE_SENDING_BANK)}, GDD {fmt(FEE_GDD)}, receiving bank {fmt(FEE_RECEIVING_BANK)}.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
        <StatCard label="Max debit" value={fmt(mandate.amount)} sub={`${frequencyLabel(mandate.frequency)} · ${mandate.start} – ${mandate.end}`} icon="wallet" />
        <StatCard label="Honour requests" value={debits.length} sub={`${debits.filter(d => d.status === "success").length} successful`} icon="swap" />
        <StatCard label="Moved to receiving bank" value={fmt(settled)} sub={bankName(scheme, mandate.receivingBank)} accent="var(--green)" icon="chart" />
        <StatCard
          label={regulator ? "Activation fee" : bankView ? "Your fee" : "GDD status"}
          value={
            regulator
              ? (mandate.activated ? fmt(ACTIVATION_FEE) : "Queued")
              : bankView
                ? (mandate.activated ? fmt(yourFee) : "Queued")
                : (mandate.activated ? "Validated" : "Sent to GDD")
          }
          sub={
            regulator
              ? (mandate.activated ? `GDD ${fmt(FEE_GDD)} · banks ${fmt(FEE_SENDING_BANK)} each` : "Charged on validation")
              : bankView
                ? (mandate.activated ? `${fmt(yourFee)} per activation` : "Earned when the mandate is activated")
                : (mandate.activated ? "GDD instructed the sending bank" : "Awaiting GDD validation")
          }
          accent={mandate.activated ? "var(--green)" : "var(--purple)"}
          icon="check-circle"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="card-head"><span className="card-title">Customer & account</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 24px 24px" }}>
            <DetailItem label="Account name" value={mandate.accountName} />
            <DetailItem label="Account number" value={mandate.account} />
            <DetailItem label="Phone" value={mandate.phone} />
            <DetailItem label="Ghana Card" value={mandate.ghanaCard} />
            <div style={{ gridColumn: "1 / -1" }}>
              <DetailItem label="Address" value={mandate.address} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Scheme parties</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 24px 24px" }}>
            <DetailItem label="Originating institution" value={institutionName(mandate.institution)} />
            <DetailItem label="Frequency" value={`${frequencyLabel(mandate.frequency)} · ${mandate.start} to ${mandate.end}`} />
            <DetailItem label="Sending bank" value={`${sending?.name ?? mandate.sendingBank} · honours the debit`} />
            <DetailItem label="Receiving bank" value={`${receiving?.name ?? mandate.receivingBank} · corresponding bank`} />
            <DetailItem label="Sending API" value={<Badge status={sending?.status ?? "inactive"} />} />
          </div>
        </div>
      </div>

      {regulator && (
        <div className="card">
          <div className="card-head">
            <span className="card-title">Activation fee split</span>
            <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{fmt(ACTIVATION_FEE)} charged to the customer</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "0 24px 24px" }}>
            <DetailItem label="Sending bank" value={fmt(FEE_SENDING_BANK)} />
            <DetailItem label="GDD platform" value={fmt(FEE_GDD)} />
            <DetailItem label="Receiving bank" value={fmt(FEE_RECEIVING_BANK)} />
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <span className="card-title">Honour instructions</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{debits.length} requests</span>
        </div>
        {debits.length
          ? <Table cols={debitCols} rows={debits} />
          : <div style={{ padding: "8px 24px 24px", fontSize: 13, color: "var(--text-mid)" }}>No honour instructions on this mandate yet.</div>}
      </div>

      {viewer !== "institution" && (
        <div className="card">
          <div className="card-head">
            <span className="card-title">Related API logs</span>
          </div>
          {logs.length ? logs.map((l, i) => (
            <div key={`${l.ts}-${l.ref}-${i}`} style={{
              padding: "12px 24px", display: "flex", alignItems: "center", gap: 16,
              borderTop: "1px solid var(--border)",
              fontSize: 13, fontVariantNumeric: "tabular-nums",
            }}>
              <span style={{ color: "var(--text-dim)", minWidth: 64 }}>{l.ts}</span>
              <span style={{ color: "var(--accent)", fontWeight: 600, minWidth: 72 }}>{l.provider}</span>
              <span className="dir-chip" style={{
                color: l.direction === "IN" ? "var(--blue)" : "var(--purple)",
                background: l.direction === "IN" ? "var(--accent-dim)" : "var(--badge-throttled-bg)",
              }}>{l.direction}</span>
              <span style={{ color: "var(--text-mid)", flex: 1 }}>{l.event}</span>
              <span style={{ color: "var(--text-dim)" }}>{l.ref}</span>
              <span style={{ color: l.status === 200 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{l.status}</span>
            </div>
          )) : (
            <div style={{ padding: "8px 24px 24px", fontSize: 13, color: "var(--text-mid)" }}>No API logs for this mandate.</div>
          )}
        </div>
      )}
    </div>
  );
}

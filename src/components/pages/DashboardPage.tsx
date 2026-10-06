"use client";

import { fmt, ACTIVATION_FEE, FEE_GDD } from "@/lib/data";
import { useScheme } from "@/hooks/useScheme";
import { StatCard, Badge } from "@/components/ui";

export function DashboardPage() {
  const { mandates, debits, providers, logs } = useScheme();
  const totalMandates   = mandates.length;
  const pending         = mandates.filter(m => m.status === "pending").length;
  const activeMandates  = mandates.filter(m => m.status === "active").length;
  const todaySuccess    = debits.filter(d => d.status === "success").length;
  const todayFailed     = debits.filter(d => d.status === "failed").length;
  const volume          = debits.filter(d => d.status === "success").reduce((s, d) => s + d.amount, 0);
  const gddFees         = mandates.filter(m => m.activated).length * FEE_GDD;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="stat-row">
        <StatCard label="Mandates received"  value={totalMandates}     sub="From institutions" icon="file" />
        <StatCard label="Pending validation" value={pending}           sub="Awaiting GDD approval" accent="var(--purple)" icon="alert" />
        <StatCard label="Active mandates"    value={activeMandates}    sub="Banks instructed to honour" accent="var(--green)" icon="check-circle" />
        <StatCard label="Honoured today"     value={todaySuccess}      sub="Successful debits" accent="var(--blue)" icon="swap" />
        <StatCard label="Failed today"       value={todayFailed}       sub="Needs attention" accent="var(--red)" icon="alert" />
        <StatCard label="Debit volume"       value={fmt(volume)}       sub="Moved to receiving banks" accent="var(--purple)" icon="chart" />
        <StatCard label="GDD fee share"      value={fmt(gddFees)}      sub={`${fmt(FEE_GDD)} of ${fmt(ACTIVATION_FEE)} activation`} accent="var(--accent)" icon="wallet" />
      </div>

      <div className="split-2">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Failed honour instructions</span>
          </div>
          <div style={{ padding: "4px 12px 16px" }}>
            {debits.filter(d => d.status === "failed" || d.status === "throttled").length === 0 && (
              <div style={{ padding: 12, fontSize: 13, color: "var(--text-mid)" }}>No failed instructions.</div>
            )}
            {debits.filter(d => d.status === "failed" || d.status === "throttled").map(d => (
              <div key={d.id} className="stack-row" style={{ padding: "12px", borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{d.customer}</div>
                  <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 3 }}>
                    {d.sendingBank} → {d.receivingBank} · {d.reason}
                  </div>
                </div>
                <Badge status={d.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title">Bank health</span>
          </div>
          <div style={{ padding: "4px 12px 16px" }}>
            {providers.map(p => (
              <div key={p.id} className="stack-row" style={{ padding: "12px", borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 3 }}>
                    API token {p.tokenExpiry}
                  </div>
                </div>
                <Badge status={p.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Live API activity</span>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>Scheme connected</span>
        </div>
        <div>
          {logs.slice(0, 5).map((l, i) => (
            <div key={`${l.ts}-${l.ref}-${i}`} className="log-row">
              <span style={{ color: "var(--text-dim)", minWidth: 64 }}>{l.ts}</span>
              <span style={{ color: "var(--accent)", fontWeight: 600, minWidth: 72 }}>{l.provider}</span>
              <span className="dir-chip" style={{
                color: l.direction === "IN" ? "var(--blue)" : "var(--purple)",
                background: l.direction === "IN" ? "var(--accent-dim)" : "var(--badge-throttled-bg)",
              }}>{l.direction}</span>
              <span style={{ color: "var(--text-mid)", flex: 1 }}>{l.event}</span>
              <span style={{ color: "var(--text-dim)" }}>{l.ref}</span>
              <span style={{ color: l.status === 200 ? "var(--green)" : "var(--red)", fontWeight: 600, minWidth: 32 }}>{l.status}</span>
              <span style={{ color: "var(--text-dim)", minWidth: 48, textAlign: "right" }}>{l.ms}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

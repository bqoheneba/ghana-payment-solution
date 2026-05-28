"use client";

import { MANDATES, DEBIT_REQUESTS, PROVIDERS, BANK_LOGS, fmt } from "@/lib/data";
import { StatCard, Badge } from "@/components/ui";

export function DashboardPage() {
  const totalMandates   = MANDATES.length;
  const activeMandates  = MANDATES.filter(m => m.status === "active").length;
  const todaySuccess    = DEBIT_REQUESTS.filter(d => d.status === "success").length;
  const todayFailed     = DEBIT_REQUESTS.filter(d => d.status === "failed").length;
  const revenue         = DEBIT_REQUESTS.filter(d => d.status === "success").reduce((s, d) => s + d.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard label="Total Mandates"  value={totalMandates}              sub="All time"                                          delta={12} />
        <StatCard label="Active Mandates" value={activeMandates}             sub={`${Math.round(activeMandates / totalMandates * 100)}% of total`} accent="var(--green)" />
        <StatCard label="Debits Today"    value={todaySuccess}               sub="Successful pulls"    accent="var(--blue)"          delta={-3} />
        <StatCard label="Failed Today"    value={todayFailed}                sub="Needs attention"     accent="var(--red)" />
        <StatCard label="Today's Volume"  value={fmt(revenue)}               sub="Settled funds"       accent="var(--purple)"        delta={8} />
        <StatCard label="Activation Fee"  value="₦50.00"                     sub="Per mandate"         accent="var(--amber)" />
      </div>

      {/* Two-col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Failed requests */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", display: "inline-block" }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Failed Requests</span>
          </div>
          <div style={{ padding: 8 }}>
            {DEBIT_REQUESTS.filter(d => d.status === "failed" || d.status === "throttled").map(d => (
              <div key={d.id} style={{ padding: 12, borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{d.customer}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'IBM Plex Mono', monospace" }}>
                    {d.id} · {d.reason}
                  </div>
                </div>
                <Badge status={d.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Provider health */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Provider Health</span>
          </div>
          <div style={{ padding: 8 }}>
            {PROVIDERS.map(p => (
              <div key={p.id} style={{ padding: 12, borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'IBM Plex Mono', monospace" }}>
                    Token: {p.tokenExpiry} · {p.mandates.toLocaleString()} mandates
                  </div>
                </div>
                <Badge status={p.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live feed */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Live Activity</span>
          <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: "auto" }}>WebSocket connected</span>
        </div>
        <div>
          {BANK_LOGS.slice(0, 5).map((l, i) => (
            <div key={i} style={{
              padding: "10px 20px", display: "flex", alignItems: "center", gap: 16,
              borderBottom: i < 4 ? "1px solid var(--border)" : "none",
              fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
            }}>
              <span style={{ color: "var(--text-dim)", minWidth: 60 }}>{l.ts}</span>
              <span style={{ color: "var(--amber)", minWidth: 56 }}>{l.provider}</span>
              <span style={{ color: l.direction === "IN" ? "var(--blue)" : "var(--purple)", minWidth: 30 }}>{l.direction}</span>
              <span style={{ color: "var(--text-mid)", flex: 1 }}>{l.event}</span>
              <span style={{ color: "var(--text-dim)" }}>{l.ref}</span>
              <span style={{ color: l.status === 200 ? "var(--green)" : "var(--red)", minWidth: 32 }}>{l.status}</span>
              <span style={{ color: "var(--text-dim)", minWidth: 48, textAlign: "right" }}>{l.ms}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

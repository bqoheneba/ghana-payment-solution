"use client";

import { NAV_ITEMS, PageId } from "./Sidebar";

interface TopbarProps {
  page: PageId;
}

export function Topbar({ page }: TopbarProps) {
  const current = NAV_ITEMS.find(n => n.id === page);

  return (
    <header style={{
      height: 60, flexShrink: 0,
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 28px", gap: 16,
      background: "var(--surface)",
    }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", lineHeight: 1 }}>
        {current?.icon} {current?.label}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
        {/* Customer search */}
        <div style={{ position: "relative" }}>
          <input
            placeholder="Search customer…"
            style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "7px 14px 7px 34px",
              color: "var(--text)", fontSize: 12, outline: "none", width: 200,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          />
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", fontSize: 14 }}>⌕</span>
        </div>

        {/* Destination account */}
        <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "'IBM Plex Mono', monospace" }}>
          <span>Dest: </span>
          <span style={{ color: "var(--amber)" }}>0123456789 · GTB</span>
        </div>

        {/* WebSocket indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--green)", display: "inline-block",
            animation: "pulse 2s infinite",
          }} />
          <span style={{ color: "var(--text-dim)" }}>Live</span>
        </div>

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--amber-dim)", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 12, color: "var(--amber)", cursor: "pointer",
        }}>AD</div>
      </div>
    </header>
  );
}

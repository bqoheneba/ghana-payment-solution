"use client";

import { useState } from "react";

export const NAV_ITEMS = [
  { id: "dashboard",   icon: "◈", label: "Dashboard" },
  { id: "mandates",    icon: "⬡", label: "Mandates" },
  { id: "activations", icon: "◉", label: "Activations" },
  { id: "debits",      icon: "⇅", label: "Debit Requests" },
  { id: "providers",   icon: "⬢", label: "Providers" },
  { id: "bank-logs",   icon: "≡",  label: "Bank Logs" },
  { id: "revenue",     icon: "◆", label: "Revenue" },
  { id: "users",       icon: "◎", label: "User Management" },
] as const;

export type PageId = typeof NAV_ITEMS[number]["id"];

interface SidebarProps {
  page: PageId;
  onNavigate: (id: PageId) => void;
}

export function Sidebar({ page, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav style={{
      width: collapsed ? 60 : 220, flexShrink: 0,
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      transition: "width 0.2s ease", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "20px 0" : "20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
        justifyContent: collapsed ? "center" : "flex-start",
        minHeight: 60,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6, flexShrink: 0,
          background: "var(--amber)", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 14, color: "#000",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>G</div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1 }}>GDD</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Direct Debit</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: collapsed ? 0 : 12,
                padding: collapsed ? "12px 0" : "11px 20px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? "rgba(245,166,35,0.1)" : "none",
                border: "none",
                borderLeft: active ? "2px solid var(--amber)" : "2px solid transparent",
                color: active ? "var(--amber)" : "var(--text-mid)",
                cursor: "pointer", fontSize: 13,
                fontWeight: active ? 600 : 400,
                transition: "all 0.15s",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            >
              <span style={{ fontSize: 16, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(p => !p)}
        style={{
          padding: 14, background: "none", border: "none",
          borderTop: "1px solid var(--border)",
          color: "var(--text-dim)", cursor: "pointer", fontSize: 14,
          display: "flex", justifyContent: "center",
        }}
      >
        {collapsed ? "→" : "←"}
      </button>
    </nav>
  );
}

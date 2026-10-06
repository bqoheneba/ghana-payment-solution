"use client";

import { useState } from "react";
import { SidebarAccount } from "@/components/SidebarAccount";
import { Icon, type IconName } from "@/components/icons";

export const NAV_ITEMS = [
  { id: "dashboard",   icon: "home" as IconName,         label: "Dashboard" },
  { id: "mandates",    icon: "file" as IconName,         label: "Mandates" },
  { id: "activations", icon: "check-circle" as IconName, label: "Activations" },
  { id: "debits",      icon: "swap" as IconName,         label: "Debit Requests" },
  { id: "providers",   icon: "bank" as IconName,         label: "Banks" },
  { id: "bank-logs",   icon: "list" as IconName,         label: "Bank Logs" },
  { id: "revenue",     icon: "chart" as IconName,        label: "Revenue" },
  { id: "users",       icon: "users" as IconName,        label: "User Management" },
] as const;

export type PageId = typeof NAV_ITEMS[number]["id"] | "settings" | "create";

export interface SidebarItem {
  id: string;
  icon: IconName;
  label: string;
}

interface SidebarProps {
  page: string;
  onNavigate: (id: string) => void;
  items?: readonly SidebarItem[];
  brand?: string;
  subtitle?: string;
}

export function Sidebar({
  page, onNavigate,
  items = NAV_ITEMS,
  brand = "GDD",
  subtitle = "Direct Debit",
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav style={{
      width: collapsed ? 84 : 250, flexShrink: 0, zIndex: 2,
      background: "var(--nav-bg)",
      display: "flex", flexDirection: "column",
      transition: "width 0.2s ease",
      overflow: "hidden",
    }}>
      <div style={{
        padding: collapsed ? "20px 12px 16px" : "20px 16px 16px",
        display: "flex", alignItems: "center", gap: 10,
        justifyContent: collapsed ? "center" : "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: "var(--accent)", display: "flex",
            alignItems: "center", justifyContent: "center", color: "var(--on-accent)",
          }}>
            <Icon name="bank" size={18} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--nav-text)", letterSpacing: "-0.03em", lineHeight: 1 }}>{brand}</div>
              <div style={{ fontSize: 11, color: "var(--nav-muted)", marginTop: 3 }}>{subtitle}</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            style={{
              width: 32, height: 32, flexShrink: 0,
              border: "none", borderRadius: 10,
              background: "var(--nav-chip)",
              color: "var(--nav-muted)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="sidebar-collapse" size={16} />
          </button>
        )}
      </div>
      {collapsed && (
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            style={{
              width: 32, height: 32,
              border: "none", borderRadius: 10,
              background: "var(--nav-chip)",
              color: "var(--nav-muted)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="sidebar-expand" size={16} />
          </button>
        </div>
      )}

      <div style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
        {items.map(item => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: collapsed ? 0 : 12,
                padding: collapsed ? "12px 0" : "11px 14px",
                marginBottom: 4,
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? "var(--nav-active-bg)" : "transparent",
                border: "none",
                borderRadius: active ? 12 : 0,
                color: active ? "var(--nav-active-text)" : "var(--nav-muted)",
                cursor: "pointer", fontSize: 15,
                fontWeight: active ? 600 : 500,
                fontFamily: "inherit",
              }}
            >
              <Icon name={item.icon} size={18} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      <SidebarAccount
        collapsed={collapsed}
        onOpenSettings={() => onNavigate("settings")}
      />
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
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
  open?: boolean;
}

export function Sidebar({
  page, onNavigate,
  items = NAV_ITEMS,
  brand = "GDD",
  subtitle = "Direct Debit",
  open = false,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1024px)");
    const apply = () => setMobile(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const compact = collapsed && !mobile;

  return (
    <nav className={`sidebar${compact ? " collapsed" : ""}${open ? " open" : ""}`}>
      <div className={`sidebar-brand${compact ? " compact" : ""}`}>
        <div className="sidebar-brand-copy">
          <div className="sidebar-mark">
            <Icon name="bank" size={18} />
          </div>
          {!compact && (
            <div>
              <div className="sidebar-title">{brand}</div>
              <div className="sidebar-sub">{subtitle}</div>
            </div>
          )}
        </div>
        {!compact && (
          <button
            type="button"
            className="sidebar-collapse"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <Icon name="sidebar-collapse" size={16} />
          </button>
        )}
      </div>
      {compact && (
        <div className="sidebar-expand-wrap">
          <button
            type="button"
            className="sidebar-collapse"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <Icon name="sidebar-expand" size={16} />
          </button>
        </div>
      )}

      <div className="sidebar-nav">
        {items.map(item => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link${active ? " active" : ""}${compact ? " compact" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon name={item.icon} size={18} />
              {!compact && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      <SidebarAccount
        collapsed={compact}
        onOpenSettings={() => onNavigate("settings")}
      />
    </nav>
  );
}

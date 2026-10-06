"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sidebar, type SidebarItem } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

interface DashShellProps {
  page: string;
  onNavigate: (id: string) => void;
  heading: string;
  badge: string;
  children: ReactNode;
  items?: readonly SidebarItem[];
  brand?: string;
  subtitle?: string;
  onSelect?: (ref: string) => void;
  portal?: "bank" | "institution";
  bankId?: string;
}

export function DashShell({
  page, onNavigate, heading, badge, children,
  items, brand, subtitle, onSelect, portal, bankId,
}: DashShellProps) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <div className="dash" data-portal={portal} data-bank={bankId}>
      {navOpen && (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      )}
      <Sidebar
        page={page}
        items={items}
        brand={brand}
        subtitle={subtitle}
        open={navOpen}
        onNavigate={id => {
          setNavOpen(false);
          onNavigate(id);
        }}
      />
      <main className="dash-main">
        <Topbar
          heading={heading}
          badge={badge}
          onSelect={onSelect}
          onMenu={() => setNavOpen(true)}
        />
        <div className="dash-body">{children}</div>
      </main>
    </div>
  );
}

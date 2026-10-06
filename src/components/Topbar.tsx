"use client";

import { CustomerSearch } from "@/components/CustomerSearch";

interface TopbarProps {
  heading: string;
  badge: string;
  onSelect?: (ref: string) => void;
}

export function Topbar({ heading, badge, onSelect }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-heading">{heading}</div>

      <div className="topbar-tools">
        {onSelect && <CustomerSearch onSelect={onSelect} />}

        <div className="topbar-chip">{badge}</div>

        <div className="topbar-chip">
          <span className="live-dot" />
          Live
        </div>
      </div>
    </header>
  );
}

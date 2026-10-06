"use client";

import { CustomerSearch } from "@/components/CustomerSearch";
import { Icon } from "@/components/icons";

interface TopbarProps {
  heading: string;
  badge: string;
  onSelect?: (ref: string) => void;
  onMenu?: () => void;
}

export function Topbar({ heading, badge, onSelect, onMenu }: TopbarProps) {
  return (
    <header className="topbar">
      {onMenu && (
        <button type="button" className="topbar-menu icon-btn" onClick={onMenu} aria-label="Open menu">
          <Icon name="menu" size={18} />
        </button>
      )}
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

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { loginPath, portalFor } from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";
import { Icon } from "@/components/icons";
import { ThemeSwitch } from "@/components/theme/ThemeSwitch";

interface SidebarAccountProps {
  collapsed: boolean;
  onOpenSettings: () => void;
}

const menuItem: CSSProperties = {
  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: 10, padding: "10px 12px", background: "none", border: "none",
  color: "var(--text-mid)", cursor: "pointer", fontSize: 13, fontWeight: 500,
  fontFamily: "inherit", borderRadius: 10, textAlign: "left",
};

export function SidebarAccount({ collapsed, onOpenSettings }: SidebarAccountProps) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const avatar = (
    <div style={{
      width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, var(--avatar-from), var(--avatar-to))",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 12, color: "#fff",
    }}>
      {user?.initials ?? "AB"}
    </div>
  );

  const menu = menuOpen && (
    <div
      role="menu"
      className="card"
      style={{
        position: "absolute",
        left: collapsed ? 56 : 0,
        bottom: collapsed ? 0 : "calc(100% + 8px)",
        width: 200, padding: 8, zIndex: 20,
      }}
    >
      <button type="button" role="menuitem" onClick={() => { close(); onOpenSettings(); }} style={menuItem}>
        Settings
      </button>
      <div style={{ ...menuItem, cursor: "default" }}>
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        <ThemeSwitch />
      </div>
      <div style={{ height: 1, background: "var(--border)", margin: "6px 8px" }} />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          close();
          const dest = user ? loginPath(portalFor(user)) : "/regulator/login";
          logout();
          router.replace(dest);
        }}
        style={{ ...menuItem, color: "var(--red)" }}
      >
        Sign out
      </button>
    </div>
  );

  return (
    <div style={{
      padding: collapsed ? "12px 0 18px" : "12px 16px 18px",
      display: "flex",
      flexDirection: "column",
      alignItems: collapsed ? "center" : "stretch",
      gap: 6,
    }}>
      <div ref={menuRef} style={{ position: "relative", width: collapsed ? "auto" : "100%" }}>
        <button
          type="button"
          onClick={() => setMenuOpen(open => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title={user?.name ?? "Account"}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10, padding: collapsed ? 0 : 8,
            background: collapsed ? "none" : "var(--nav-chip)",
            border: "none", borderRadius: 14, cursor: "pointer",
            color: "var(--nav-muted)",
            fontFamily: "inherit", textAlign: "left",
          }}
        >
          {avatar}
          {!collapsed && (
            <>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--nav-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name ?? "Ama Boateng"}
                </div>
                <div style={{ fontSize: 11, color: "var(--nav-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email ?? "ama.boateng@gdd.io"}
                </div>
              </div>
              <Icon name={menuOpen ? "chevron-down" : "chevron-right"} size={16} />
            </>
          )}
        </button>
        {menu}
      </div>
    </div>
  );
}

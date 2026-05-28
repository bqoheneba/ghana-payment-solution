"use client";

import React from "react";

// ─── BADGE ────────────────────────────────────────────────────────────────────

type BadgeStatus =
  | "active" | "pending" | "suspended" | "inactive" | "degraded"
  | "success" | "failed" | "throttled";

const BADGE_MAP: Record<BadgeStatus, { bg: string; color: string; label: string }> = {
  active:    { bg: "#0D2818", color: "#22C55E", label: "Active" },
  pending:   { bg: "#1A1500", color: "#F5A623", label: "Pending" },
  suspended: { bg: "#1A0808", color: "#EF4444", label: "Suspended" },
  inactive:  { bg: "#111318", color: "#4A5068", label: "Inactive" },
  degraded:  { bg: "#1A1000", color: "#FB923C", label: "Degraded" },
  success:   { bg: "#0D2818", color: "#22C55E", label: "Success" },
  failed:    { bg: "#1A0808", color: "#EF4444", label: "Failed" },
  throttled: { bg: "#150D1A", color: "#A855F7", label: "Throttled" },
};

export function Badge({ status }: { status: string }) {
  const s = BADGE_MAP[status as BadgeStatus] ?? BADGE_MAP.inactive;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}30`,
      borderRadius: 4, padding: "2px 8px",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
      textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace",
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  delta?: number;
}

export function StatCard({ label, value, sub, accent = "#F5A623", delta }: StatCardProps) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 6,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: accent, opacity: 0.7,
      }} />
      <span style={{ fontSize: 11, color: "var(--text-mid)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "-0.02em" }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{sub}</span>}
      {delta !== undefined && (
        <span style={{ fontSize: 12, color: delta > 0 ? "var(--green)" : "var(--red)" }}>
          {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}% today
        </span>
      )}
    </div>
  );
}

// ─── TABLE ────────────────────────────────────────────────────────────────────

export interface ColDef<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  mono?: boolean;
  dim?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
  cols: ColDef<T>[];
  rows: T[];
  onRow?: (row: T) => void;
}

export function Table<T extends Record<string, unknown>>({ cols, rows, onRow }: TableProps<T>) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={String(c.key)} style={{
                textAlign: "left", padding: "10px 16px",
                color: "var(--text-dim)", fontWeight: 600, fontSize: 11,
                letterSpacing: "0.08em", textTransform: "uppercase",
                borderBottom: "1px solid var(--border)",
                fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap",
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRow?.(row)}
              style={{ cursor: onRow ? "pointer" : "default" }}
              onMouseEnter={e => { if (onRow) (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-b)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
            >
              {cols.map(c => (
                <td key={String(c.key)} style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  color: c.dim ? "var(--text-mid)" : "var(--text)",
                  fontFamily: c.mono ? "'IBM Plex Mono', monospace" : "inherit",
                  fontSize: c.mono ? 12 : 13, whiteSpace: "nowrap",
                }}>
                  {c.render
                    ? c.render(row[c.key as string], row)
                    : String(row[c.key as string] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

interface ModalProps { title: string; onClose: () => void; children: React.ReactNode; }

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border-hi)",
        borderRadius: 12, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{title}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "var(--text-mid)",
            cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── FIELD ───────────────────────────────────────────────────────────────────

interface FieldProps { label: string; hint?: string; children: React.ReactNode; }

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: "var(--text-mid)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{hint}</span>}
    </div>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────────────────

interface InputProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}

export function Input({ value, onChange, placeholder, type = "text", readOnly }: InputProps) {
  return (
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} readOnly={readOnly}
      style={{
        background: "var(--bg)", border: "1px solid var(--border-hi)",
        borderRadius: 6, padding: "10px 12px",
        color: readOnly ? "var(--text-mid)" : "var(--text)", fontSize: 13,
        fontFamily: "'IBM Plex Mono', monospace",
        outline: "none", width: "100%",
      }}
    />
  );
}

// ─── SELECT ──────────────────────────────────────────────────────────────────

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

export function Select({ value, onChange, options }: SelectProps) {
  return (
    <select value={value} onChange={onChange} style={{
      background: "var(--bg)", border: "1px solid var(--border-hi)",
      borderRadius: 6, padding: "10px 12px",
      color: "var(--text)", fontSize: 13, outline: "none",
      width: "100%", cursor: "pointer",
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

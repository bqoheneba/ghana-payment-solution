"use client";

import React from "react";
import { Icon, type IconName } from "@/components/icons";

type BadgeStatus =
  | "active" | "pending" | "suspended" | "inactive" | "degraded"
  | "success" | "failed" | "throttled";

const BADGE_MAP: Record<BadgeStatus, { bg: string; color: string; label: string }> = {
  active:    { bg: "var(--badge-active-bg)",    color: "var(--badge-active)",    label: "Active" },
  pending:   { bg: "var(--badge-pending-bg)",   color: "var(--badge-pending)",   label: "Pending" },
  suspended: { bg: "var(--badge-suspended-bg)", color: "var(--badge-suspended)", label: "Suspended" },
  inactive:  { bg: "var(--badge-inactive-bg)",  color: "var(--badge-inactive)",  label: "Inactive" },
  degraded:  { bg: "var(--badge-degraded-bg)",  color: "var(--badge-degraded)",  label: "Degraded" },
  success:   { bg: "var(--badge-success-bg)",   color: "var(--badge-success)",   label: "Success" },
  failed:    { bg: "var(--badge-failed-bg)",    color: "var(--badge-failed)",    label: "Failed" },
  throttled: { bg: "var(--badge-throttled-bg)", color: "var(--badge-throttled)", label: "Throttled" },
};

export function Badge({ status }: { status: string }) {
  const s = BADGE_MAP[status as BadgeStatus] ?? BADGE_MAP.inactive;
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 20, padding: "4px 10px",
      fontSize: 11, fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  delta?: number;
  icon?: IconName;
}

export function StatCard({ label, value, sub, accent = "var(--accent)", delta, icon }: StatCardProps) {
  return (
    <div className="card" style={{
      padding: "22px 24px",
      display: "flex", flexDirection: "column", gap: 8,
      position: "relative",
    }}>
      {icon && (
        <span style={{
          position: "absolute", top: 18, right: 18,
          width: 36, height: 36, borderRadius: 12,
          background: "var(--accent-dim)", color: accent,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={icon} size={16} />
        </span>
      )}
      <span style={{ fontSize: 13, color: "var(--text-mid)", fontWeight: 500, paddingRight: icon ? 44 : 0 }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 18 }}>
        {sub && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{sub}</span>}
        {delta !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 600, color: delta > 0 ? "var(--green)" : "var(--red)" }}>
            {delta > 0 ? "+" : "−"}{Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );
}

export interface ColDef<T extends object = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  mono?: boolean;
  dim?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface TableProps<T extends object> {
  cols: ColDef<T>[];
  rows: T[];
  onRow?: (row: T) => void;
}

function cellValue<T extends object>(row: T, key: keyof T | string): unknown {
  return key in row ? row[key as keyof T] : undefined;
}

export function Table<T extends object>({ cols, rows, onRow }: TableProps<T>) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={String(c.key)} style={{
                textAlign: "left", padding: "12px 20px",
                color: "var(--text-mid)", fontWeight: 500, fontSize: 12,
                borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
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
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  color: c.dim ? "var(--text-mid)" : "var(--text)",
                  fontVariantNumeric: c.mono ? "tabular-nums" : "normal",
                  fontSize: 13, whiteSpace: "nowrap",
                }}>
                  {c.render
                    ? c.render(cellValue(row, c.key), row)
                    : String(cellValue(row, c.key) ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ModalProps { title: string; onClose: () => void; children: React.ReactNode; }

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "var(--overlay)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px",
        }}>
          <span style={{ fontWeight: 650, fontSize: 18, color: "var(--text)" }}>{title}</span>
          <button onClick={onClose} className="icon-btn" style={{ width: 36, height: 36, boxShadow: "none" }} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div style={{ padding: "0 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

interface FieldProps { label: string; hint?: string; children: React.ReactNode; }

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, color: "var(--text-mid)", fontWeight: 500 }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{hint}</span>}
    </div>
  );
}

interface InputProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  name?: string;
  disabled?: boolean;
}

export function Input({
  value, onChange, placeholder, type = "text", readOnly,
  required, autoComplete, minLength, name, disabled,
}: InputProps) {
  return (
    <input
      className="field-control"
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} readOnly={readOnly}
      required={required} autoComplete={autoComplete}
      minLength={minLength} name={name} disabled={disabled}
      style={{
        background: "var(--surface-b)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)", padding: "11px 14px",
        color: "var(--text)", fontSize: 13,
        outline: "none", width: "100%",
      }}
    />
  );
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

export function Select({ value, onChange, options }: SelectProps) {
  return (
    <select className="field-control" value={value} onChange={onChange} style={{
      background: "var(--surface-b)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)", padding: "11px 14px",
      color: "var(--text)", fontSize: 13, outline: "none",
      width: "100%", cursor: "pointer",
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

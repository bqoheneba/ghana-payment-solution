"use client";

import { FormEvent, useState } from "react";
import { ROLES, type DirectoryUser, type UserRole } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { INSTITUTIONS } from "@/lib/data";
import { useScheme } from "@/hooks/useScheme";
import { Badge, Table, Modal, Field, Input, Select, ColDef } from "@/components/ui";
import { Icon } from "@/components/icons";

const emptyInvite = {
  name: "",
  email: "",
  role: "Operations" as UserRole,
  bankId: "FNB",
  institutionId: "STAR",
  password: "",
  confirm: "",
};

export function UsersPage() {
  const { users, invite } = useAuth();
  const { providers } = useScheme();
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState(emptyInvite);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cols: ColDef<DirectoryUser>[] = [
    { key: "name",   label: "Name" },
    { key: "email",  label: "Email",  mono: true, dim: true },
    { key: "role",   label: "Role",   render: v => <span className="role-chip">{String(v)}</span> },
    { key: "org",    label: "Org",    render: (_, row) => {
      const org = row.bankId ?? row.institutionId;
      return org
        ? <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{org}</span>
        : <span style={{ color: "var(--text-dim)" }}>—</span>;
    } },
    { key: "status", label: "Status", render: v => <Badge status={String(v)} /> },
    { key: "last",   label: "Last Active", mono: true, dim: true },
  ];

  const close = () => {
    setShowInvite(false);
    setForm(emptyInvite);
    setError(null);
  };

  const onInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await invite({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        bankId: form.role === "Provider API" ? form.bankId : undefined,
        institutionId: form.role === "Institution" ? form.institutionId : undefined,
      });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="split-aside">
        <div className="card" style={{ padding: 8 }}>
          <div className="card-head">
            <span className="card-title">RBAC Roles</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 12px 16px" }}>
            {ROLES.map(r => (
              <div key={r} className="meta-tile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{r}</span>
                <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{users.filter(u => u.role === r).length}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <span className="card-title">Users</span>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowInvite(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Icon name="plus" size={14} /> Invite User
            </button>
          </div>
          <Table cols={cols} rows={users} />
        </div>
      </div>

      {showInvite && (
        <Modal title="Invite user" onClose={close}>
          <form onSubmit={onInvite} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Full name">
              <Input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Kojo Ampofo"
                autoComplete="name"
                required
              />
            </Field>
            <Field label="Work email" hint="They will sign in with this email">
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="kojo.ampofo@gdd.io"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Role">
              <Select
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                options={ROLES.map(role => ({ value: role, label: role }))}
              />
            </Field>
            {form.role === "Provider API" && (
              <Field label="Bank" hint="This user signs in to the bank dashboard">
                <Select
                  value={form.bankId}
                  onChange={e => setForm(p => ({ ...p, bankId: e.target.value }))}
                  options={providers.map(p => ({ value: p.id, label: p.name }))}
                />
              </Field>
            )}
            {form.role === "Institution" && (
              <Field label="Institution" hint="This user signs in to the institution app">
                <Select
                  value={form.institutionId}
                  onChange={e => setForm(p => ({ ...p, institutionId: e.target.value }))}
                  options={INSTITUTIONS.map(i => ({ value: i.id, label: i.name }))}
                />
              </Field>
            )}
            <Field label="Password" hint="At least 8 characters. Share this with them to sign in.">
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Set a password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field label="Confirm password">
              <Input
                type="password"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            {error && <div className="notice-error">{error}</div>}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={close}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

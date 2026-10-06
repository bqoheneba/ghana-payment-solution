"use client";

import { FormEvent, useEffect, useState } from "react";
import { INSTITUTIONS, institutionName, MANDATE_FREQUENCIES, type Mandate, type MandateFrequency } from "@/lib/data";
import { createMandate, updateMandate } from "@/lib/scheme";
import { useScheme } from "@/hooks/useScheme";
import { Field, Input, Select } from "@/components/ui";

interface CreateMandatePageProps {
  institutionId?: string;
  mandateRef?: string;
  onBehalf?: boolean;
  onCreated: (ref: string) => void;
  onBack?: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextYear(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

const empty = {
  institution: "STAR",
  customer: "",
  accountName: "",
  account: "",
  phone: "",
  ghanaCard: "",
  address: "",
  sendingBank: "FNB",
  receivingBank: "ECOBANK",
  amount: "",
  frequency: "monthly" as MandateFrequency,
  start: today(),
  end: nextYear(),
};

function formFromMandate(mandate: Mandate) {
  return {
    institution: mandate.institution,
    customer: mandate.customer,
    accountName: mandate.accountName,
    account: mandate.account,
    phone: mandate.phone,
    ghanaCard: mandate.ghanaCard,
    address: mandate.address,
    sendingBank: mandate.sendingBank,
    receivingBank: mandate.receivingBank,
    amount: (mandate.amount / 100).toFixed(2),
    frequency: mandate.frequency,
    start: mandate.start,
    end: mandate.end,
  };
}

export function CreateMandatePage({
  institutionId, mandateRef, onBehalf, onCreated, onBack,
}: CreateMandatePageProps) {
  const { providers, mandates } = useScheme();
  const existing = mandateRef ? mandates.find(row => row.ref === mandateRef) : undefined;
  const editing = Boolean(existing);
  const lockedInstitution = institutionId ?? null;
  const [form, setForm] = useState({
    ...empty,
    institution: lockedInstitution ?? empty.institution,
    ...(existing ? formFromMandate(existing) : null),
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bankOptions = providers.map(p => ({ value: p.id, label: p.name }));
  const origin = lockedInstitution ?? form.institution;
  const existingKey = existing
    ? [existing.ref, existing.customer, existing.account, existing.amount, existing.frequency, existing.start, existing.end, existing.phone].join("|")
    : "";

  useEffect(() => {
    if (!existing) return;
    setForm(formFromMandate(existing));
    // Field fingerprint only — other scheme writes must not wipe in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingKey]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const pesewas = Math.round(Number(form.amount) * 100);
    if (!origin) {
      setError("Select an institution.");
      return;
    }
    if (!Number.isFinite(pesewas) || pesewas <= 0) {
      setError("Enter a maximum debit amount in GHS.");
      return;
    }
    if (form.sendingBank === form.receivingBank) {
      setError("Sending and receiving banks must be different.");
      return;
    }
    if (form.end < form.start) {
      setError("End date must be after the start date.");
      return;
    }
    const draft = {
      institution: origin,
      customer: form.customer,
      accountName: form.accountName || form.customer,
      account: form.account,
      sendingBank: form.sendingBank,
      receivingBank: form.receivingBank,
      amount: pesewas,
      frequency: form.frequency,
      start: form.start,
      end: form.end,
      phone: form.phone,
      ghanaCard: form.ghanaCard,
      address: form.address,
    };
    setLoading(true);
    try {
      const mandate = existing
        ? updateMandate(existing.ref, draft, { onBehalf: Boolean(onBehalf) })
        : createMandate(draft, { onBehalf: Boolean(onBehalf) });
      if (!editing) setForm({ ...empty, institution: lockedInstitution ?? empty.institution, start: today(), end: nextYear() });
      onCreated(mandate.ref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the mandate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
      <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>
        {editing
          ? `Update ${existing?.ref}. Customer, banks, amount, frequency and validity can be changed.`
          : onBehalf
            ? "Create a mandate on behalf of an originating institution. It is queued for GDD validation, then the sending bank is instructed to honour it."
            : `Create a mandate for ${institutionName(origin)} and send it to GDD. GDD validates it, then instructs the sending bank.`}
      </p>

      <section className="card card-pad">
        <div className="card-title" style={{ marginBottom: 18 }}>Customer</div>
        <div className="form-grid">
          {onBehalf && (
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Institution" hint="The originator this mandate is created for">
                <Select
                  value={form.institution}
                  onChange={e => setForm(p => ({ ...p, institution: e.target.value }))}
                  options={INSTITUTIONS.map(i => ({ value: i.id, label: `${i.name} · ${i.type}` }))}
                />
              </Field>
            </div>
          )}
          <Field label="Customer name">
            <Input value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} placeholder="Ama Boateng" required />
          </Field>
          <Field label="Account name">
            <Input value={form.accountName} onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))} placeholder="AMA BOATENG" />
          </Field>
          <Field label="Account number">
            <Input value={form.account} onChange={e => setForm(p => ({ ...p, account: e.target.value }))} placeholder="0012345678901" required />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+233 24 000 0000" required />
          </Field>
          <Field label="Ghana Card">
            <Input value={form.ghanaCard} onChange={e => setForm(p => ({ ...p, ghanaCard: e.target.value }))} placeholder="GHA-000000000-0" required />
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Street, city" required />
          </Field>
        </div>
      </section>

      <section className="card card-pad">
        <div className="card-title" style={{ marginBottom: 18 }}>Mandate</div>
        <div className="form-grid">
          <Field label="Sending bank" hint="Customer’s bank. Honours the debit after GDD validates.">
            <Select
              value={form.sendingBank}
              onChange={e => setForm(p => ({ ...p, sendingBank: e.target.value }))}
              options={bankOptions}
            />
          </Field>
          <Field label="Receiving bank" hint="Corresponding bank on the scheme.">
            <Select
              value={form.receivingBank}
              onChange={e => setForm(p => ({ ...p, receivingBank: e.target.value }))}
              options={bankOptions}
            />
          </Field>
          <Field label="Max debit (GHS)">
            <Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="500.00" required />
          </Field>
          <Field label="Frequency" hint="How often the sending bank is instructed to honour this mandate.">
            <Select
              value={form.frequency}
              onChange={e => setForm(p => ({ ...p, frequency: e.target.value as MandateFrequency }))}
              options={MANDATE_FREQUENCIES.map(row => ({ value: row.value, label: row.label }))}
            />
          </Field>
          <Field label="Start date">
            <Input type="date" value={form.start} onChange={e => setForm(p => ({ ...p, start: e.target.value }))} required />
          </Field>
          <Field label="End date">
            <Input type="date" value={form.end} onChange={e => setForm(p => ({ ...p, end: e.target.value }))} required />
          </Field>
        </div>
      </section>

      {error && <div className="notice-error">{error}</div>}

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {onBack && (
          <button type="button" className="btn-ghost" onClick={onBack}>
            Back
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px 18px" }}>
          {loading ? "Saving…" : editing ? "Save changes" : onBehalf ? "Create on behalf of institution" : "Send to GDD"}
        </button>
      </div>
    </form>
  );
}

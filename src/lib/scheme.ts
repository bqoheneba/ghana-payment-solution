import {
  BANK_LOGS,
  DEBIT_REQUESTS,
  FEE_RECEIVING_BANK,
  FEE_SENDING_BANK,
  MANDATE_FREQUENCIES,
  MANDATES,
  PROVIDERS,
  type BankActivationFee,
  type BankLog,
  type DebitRequest,
  type Mandate,
  type MandateDraft,
  type Provider,
} from "@/lib/data";
import { ensureProviderAccount } from "@/lib/auth";

const SCHEME_KEY = "gdd.scheme.v1";
const LEGACY_MANDATES_KEY = "gdd.mandates";

export interface SchemeSnapshot {
  providers: Provider[];
  mandates: Mandate[];
  debits: DebitRequest[];
  logs: BankLog[];
}

const listeners = new Set<() => void>();
let cache: SchemeSnapshot | null = null;
let ready = false;

const SERVER: SchemeSnapshot = {
  providers: structuredClone(PROVIDERS),
  mandates: structuredClone(MANDATES),
  debits: structuredClone(DEBIT_REQUESTS),
  logs: structuredClone(BANK_LOGS),
};

function seed(): SchemeSnapshot {
  return structuredClone(SERVER);
}

function stamp(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return { at: `${day} ${time}`, ts: time, ms: 80 + Math.floor(Math.random() * 240) };
}

function readLegacyMandates(): Mandate[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LEGACY_MANDATES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Mandate[];
    return Array.isArray(parsed) ? parsed.filter(row => Boolean(row?.ref)) : [];
  } catch {
    return [];
  }
}

function mergeMandates(base: Mandate[], extras: Mandate[]): Mandate[] {
  const byRef = new Map(base.map(row => [row.ref, row]));
  for (const row of extras) byRef.set(row.ref, row);
  return Array.from(byRef.values());
}

function isSnapshot(value: unknown): value is SchemeSnapshot {
  if (!value || typeof value !== "object") return false;
  const row = value as SchemeSnapshot;
  return Array.isArray(row.providers) && Array.isArray(row.mandates) && Array.isArray(row.debits) && Array.isArray(row.logs);
}

function normalizeMandate(row: Mandate): Mandate {
  const allowed = MANDATE_FREQUENCIES.some(item => item.value === row.frequency);
  return { ...row, frequency: allowed ? row.frequency : "monthly" };
}

function normalizeDebit(row: DebitRequest): DebitRequest {
  return { ...row, creditedAt: row.creditedAt ?? (row.status === "success" ? row.settled : null) };
}

function readStored(): SchemeSnapshot {
  const next = seed();
  if (typeof window === "undefined") return next;
  const raw = window.localStorage.getItem(SCHEME_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isSnapshot(parsed)) {
        return {
          providers: parsed.providers.length ? parsed.providers : next.providers,
          mandates: parsed.mandates.map(normalizeMandate),
          debits: parsed.debits.map(normalizeDebit),
          logs: parsed.logs,
        };
      }
    } catch {
      /* fall through to seed + legacy */
    }
  }
  next.mandates = mergeMandates(next.mandates, readLegacyMandates()).map(normalizeMandate);
  return next;
}

function emit() {
  listeners.forEach(fn => fn());
}

function commit(next: SchemeSnapshot) {
  cache = next;
  ready = true;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SCHEME_KEY, JSON.stringify(next));
    window.localStorage.removeItem(LEGACY_MANDATES_KEY);
  }
  emit();
}

function live(): SchemeSnapshot {
  if (!cache) cache = readStored();
  return cache;
}

export function getSchemeSnapshot(): SchemeSnapshot {
  return ready ? live() : SERVER;
}

export function getServerSchemeSnapshot(): SchemeSnapshot {
  return SERVER;
}

export function subscribeScheme(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (typeof window === "undefined") return () => listeners.delete(onStoreChange);

  if (!ready) {
    queueMicrotask(() => {
      cache = readStored();
      ready = true;
      listeners.forEach(fn => fn());
    });
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== SCHEME_KEY) return;
    cache = readStored();
    ready = true;
    onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function update(mutator: (draft: SchemeSnapshot) => void) {
  const draft = structuredClone(live());
  mutator(draft);
  commit(draft);
}

function pushLog(s: SchemeSnapshot, partial: Omit<BankLog, "ts" | "ms"> & { ts?: string; ms?: number }) {
  const now = stamp();
  s.logs.unshift({
    ts: partial.ts ?? now.ts,
    ms: partial.ms ?? now.ms,
    provider: partial.provider,
    direction: partial.direction,
    event: partial.event,
    ref: partial.ref,
    status: partial.status,
  });
}

function nextMandateRef(rows: Mandate[]): string {
  const nums = rows.map(row => {
    const match = row.ref.match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
  });
  return `MND-2024-${String(Math.max(0, ...nums) + 1).padStart(6, "0")}`;
}

function nextDebitId(rows: DebitRequest[]): string {
  const nums = rows.map(row => {
    const match = row.id.match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
  });
  return `DBT-${String(Math.max(88820, ...nums) + 1)}`;
}

export function bankName(s: SchemeSnapshot, id: string): string {
  return s.providers.find(p => p.id === id)?.name ?? id;
}

export function mandatesForInstitution(s: SchemeSnapshot, institutionId: string): Mandate[] {
  return s.mandates.filter(m => m.institution === institutionId);
}

export function honouredMandates(s: SchemeSnapshot, bankId: string): Mandate[] {
  return s.mandates.filter(m => m.sendingBank === bankId);
}

export function receivedMandates(s: SchemeSnapshot, bankId: string): Mandate[] {
  return s.mandates.filter(m => m.receivingBank === bankId);
}

export function mandatesForBank(s: SchemeSnapshot, bankId: string): Mandate[] {
  return s.mandates.filter(m => m.sendingBank === bankId || m.receivingBank === bankId);
}

export function searchMandates(rows: Mandate[], query: string): Mandate[] {
  const needle = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!needle) return [];
  return rows.filter(row => {
    const hay = [row.customer, row.accountName, row.account, row.ref, row.phone, row.ghanaCard]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    return hay.includes(needle);
  });
}

export function bankMandateStats(s: SchemeSnapshot, bankId: string) {
  return {
    honoured: honouredMandates(s, bankId).length,
    received: receivedMandates(s, bankId).length,
  };
}

export function debitsForBank(s: SchemeSnapshot, bankId: string): DebitRequest[] {
  return s.debits.filter(d => d.sendingBank === bankId || d.receivingBank === bankId);
}

export function logsForBank(s: SchemeSnapshot, bankId: string): BankLog[] {
  return s.logs.filter(l => l.provider === bankId);
}

export function bankFeeIncome(s: SchemeSnapshot, bankId: string) {
  const sending = honouredMandates(s, bankId).filter(m => m.activated).length;
  const receiving = receivedMandates(s, bankId).filter(m => m.activated).length;
  return {
    sendingCount: sending,
    receivingCount: receiving,
    sendingFees: sending * FEE_SENDING_BANK,
    receivingFees: receiving * FEE_RECEIVING_BANK,
    total: sending * FEE_SENDING_BANK + receiving * FEE_RECEIVING_BANK,
  };
}

export function bankActivationFees(s: SchemeSnapshot, bankId: string): BankActivationFee[] {
  const sending: BankActivationFee[] = honouredMandates(s, bankId)
    .filter(m => m.activated)
    .map(m => ({
      ref: m.ref,
      customer: m.customer,
      institution: m.institution,
      role: "Sending",
      activatedAt: m.activatedAt,
      fee: FEE_SENDING_BANK,
    }));
  const receiving: BankActivationFee[] = receivedMandates(s, bankId)
    .filter(m => m.activated)
    .map(m => ({
      ref: m.ref,
      customer: m.customer,
      institution: m.institution,
      role: "Receiving",
      activatedAt: m.activatedAt,
      fee: FEE_RECEIVING_BANK,
    }));
  return [...sending, ...receiving].sort((a, b) => (b.activatedAt ?? "").localeCompare(a.activatedAt ?? ""));
}

export function getMandate(s: SchemeSnapshot, ref: string): Mandate | undefined {
  return s.mandates.find(m => m.ref === ref);
}

export function getMandateDebits(s: SchemeSnapshot, ref: string): DebitRequest[] {
  return s.debits.filter(d => d.mandate === ref);
}

export function getMandateLogs(s: SchemeSnapshot, ref: string): BankLog[] {
  const debitIds = new Set(getMandateDebits(s, ref).map(d => d.id));
  return s.logs.filter(l => l.ref === ref || debitIds.has(l.ref));
}

export function addBank(input: { id: string; name: string; ips?: string[] }): Provider {
  const id = input.id.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const name = input.name.trim();
  if (!name) throw new Error("Enter a bank name.");
  if (!id) throw new Error("Enter a bank ID.");
  const ips = (input.ips ?? []).map(ip => ip.trim()).filter(Boolean);
  update(s => {
    if (s.providers.some(p => p.id === id)) throw new Error("A bank with this ID is already on the scheme.");
    s.providers = [...s.providers, { id, name, status: "active", tokenExpiry: "60m", ips }];
    pushLog(s, { provider: id, direction: "IN", event: "BANK_REGISTER", ref: id, status: 200 });
  });
  ensureProviderAccount(id, name);
  const created = live().providers.find(p => p.id === id);
  if (!created) throw new Error("Unable to register the bank.");
  return created;
}

export function addBankIp(bankId: string, ip: string) {
  const value = ip.trim();
  if (!value) throw new Error("Enter an IP address.");
  update(s => {
    const bank = s.providers.find(p => p.id === bankId);
    if (!bank) throw new Error("Bank not found.");
    if (bank.ips.includes(value)) throw new Error("That IP is already whitelisted.");
    bank.ips = [...bank.ips, value];
  });
}

export function removeBankIp(bankId: string, ip: string) {
  update(s => {
    const bank = s.providers.find(p => p.id === bankId);
    if (!bank) throw new Error("Bank not found.");
    bank.ips = bank.ips.filter(row => row !== ip);
  });
}

export function refreshBankToken(bankId: string) {
  update(s => {
    const bank = s.providers.find(p => p.id === bankId);
    if (!bank) throw new Error("Bank not found.");
    bank.tokenExpiry = "60m";
    bank.status = "active";
    pushLog(s, { provider: bankId, direction: "OUT", event: "TOKEN_REFRESH", ref: "—", status: 200 });
  });
}

export function createMandate(draft: MandateDraft, options?: { onBehalf?: boolean }): Mandate {
  const now = stamp();
  let ref = "";
  update(s => {
    if (!draft.institution.trim()) throw new Error("Select an institution.");
    if (!s.providers.some(p => p.id === draft.sendingBank)) throw new Error("Select a sending bank.");
    if (!s.providers.some(p => p.id === draft.receivingBank)) throw new Error("Select a receiving bank.");
    if (draft.sendingBank === draft.receivingBank) throw new Error("Sending and receiving banks must be different.");
    const created: Mandate = {
      ...draft,
      institution: draft.institution.trim(),
      accountName: draft.accountName.trim().toUpperCase(),
      customer: draft.customer.trim(),
      account: draft.account.trim(),
      ref: nextMandateRef(s.mandates),
      status: "pending",
      activated: false,
      activatedAt: null,
    };
    ref = created.ref;
    s.mandates = [created, ...s.mandates];
    pushLog(s, {
      provider: options?.onBehalf ? "GDD" : draft.institution,
      direction: "IN",
      event: options?.onBehalf ? "MANDATE_ON_BEHALF" : "MANDATE_SUBMIT",
      ref: created.ref,
      status: 200,
      ts: now.ts,
    });
  });
  const created = live().mandates.find(m => m.ref === ref);
  if (!created) throw new Error("Unable to submit the mandate.");
  return created;
}

export function updateMandate(ref: string, draft: MandateDraft, options?: { onBehalf?: boolean }): Mandate {
  const now = stamp();
  update(s => {
    const mandate = s.mandates.find(m => m.ref === ref);
    if (!mandate) throw new Error("Mandate not found.");
    if (!draft.institution.trim()) throw new Error("Select an institution.");
    if (!s.providers.some(p => p.id === draft.sendingBank)) throw new Error("Select a sending bank.");
    if (!s.providers.some(p => p.id === draft.receivingBank)) throw new Error("Select a receiving bank.");
    if (draft.sendingBank === draft.receivingBank) throw new Error("Sending and receiving banks must be different.");
    if (draft.end < draft.start) throw new Error("End date must be after the start date.");
    mandate.institution = draft.institution.trim();
    mandate.customer = draft.customer.trim();
    mandate.accountName = draft.accountName.trim().toUpperCase();
    mandate.account = draft.account.trim();
    mandate.sendingBank = draft.sendingBank;
    mandate.receivingBank = draft.receivingBank;
    mandate.amount = draft.amount;
    mandate.frequency = draft.frequency;
    mandate.start = draft.start;
    mandate.end = draft.end;
    mandate.phone = draft.phone;
    mandate.ghanaCard = draft.ghanaCard;
    mandate.address = draft.address;
    pushLog(s, {
      provider: options?.onBehalf ? "GDD" : draft.institution,
      direction: "IN",
      event: "MANDATE_UPDATE",
      ref: mandate.ref,
      status: 200,
      ts: now.ts,
    });
  });
  const updated = live().mandates.find(m => m.ref === ref);
  if (!updated) throw new Error("Unable to save the mandate.");
  return updated;
}

export function validateMandate(ref: string): Mandate {
  const now = stamp();
  update(s => {
    const mandate = s.mandates.find(m => m.ref === ref);
    if (!mandate) throw new Error("Mandate not found.");
    if (mandate.status !== "pending") throw new Error("This mandate has already been actioned.");
    mandate.status = "active";
    mandate.activated = true;
    mandate.activatedAt = now.at;
    const debit: DebitRequest = {
      id: nextDebitId(s.debits),
      mandate: mandate.ref,
      customer: mandate.customer,
      amount: mandate.amount,
      status: "pending",
      attempted: now.at,
      settled: null,
      creditedAt: null,
      sendingBank: mandate.sendingBank,
      receivingBank: mandate.receivingBank,
    };
    s.debits = [debit, ...s.debits];
    pushLog(s, {
      provider: mandate.sendingBank,
      direction: "OUT",
      event: "HONOUR_INSTRUCTION",
      ref: debit.id,
      status: 200,
      ts: now.ts,
    });
  });
  const updated = live().mandates.find(m => m.ref === ref);
  if (!updated) throw new Error("Unable to validate the mandate.");
  return updated;
}

export function honourDebit(id: string) {
  const now = stamp();
  update(s => {
    const debit = s.debits.find(d => d.id === id);
    if (!debit) throw new Error("Instruction not found.");
    if (debit.status !== "pending") throw new Error("This instruction has already been actioned.");
    debit.status = "success";
    debit.settled = now.at;
    debit.reason = undefined;
    pushLog(s, {
      provider: debit.sendingBank,
      direction: "IN",
      event: "DEBIT_HONOURED",
      ref: debit.id,
      status: 200,
      ts: now.ts,
    });
  });
}

export function failDebit(id: string, reason = "Insufficient funds") {
  const now = stamp();
  update(s => {
    const debit = s.debits.find(d => d.id === id);
    if (!debit) throw new Error("Instruction not found.");
    if (debit.status !== "pending") throw new Error("This instruction has already been actioned.");
    debit.status = "failed";
    debit.settled = null;
    debit.creditedAt = null;
    debit.reason = reason;
    pushLog(s, {
      provider: debit.sendingBank,
      direction: "IN",
      event: "DEBIT_DECLINED",
      ref: debit.id,
      status: 402,
      ts: now.ts,
    });
  });
}

export function confirmReceipt(id: string) {
  const now = stamp();
  update(s => {
    const debit = s.debits.find(d => d.id === id);
    if (!debit) throw new Error("Instruction not found.");
    if (debit.status !== "success") throw new Error("Honour this debit before confirming receipt.");
    if (debit.creditedAt) throw new Error("This credit has already been posted.");
    debit.creditedAt = now.at;
    pushLog(s, {
      provider: debit.receivingBank,
      direction: "IN",
      event: "CREDIT_POSTED",
      ref: debit.id,
      status: 200,
      ts: now.ts,
    });
  });
}

export interface Provider {
  id: string;
  name: string;
  status: "active" | "degraded" | "inactive";
  tokenExpiry: string;
  ips: string[];
}

export interface Institution {
  id: string;
  name: string;
  type: "Insurer" | "MFI" | "Pension";
}

export type MandateFrequency = "once" | "weekly" | "fortnightly" | "monthly" | "quarterly" | "annually";

export const MANDATE_FREQUENCIES: { value: MandateFrequency; label: string }[] = [
  { value: "once",         label: "Once" },
  { value: "weekly",       label: "Weekly" },
  { value: "fortnightly",  label: "Fortnightly" },
  { value: "monthly",      label: "Monthly" },
  { value: "quarterly",    label: "Quarterly" },
  { value: "annually",     label: "Annually" },
];

export function frequencyLabel(value: string | undefined): string {
  return MANDATE_FREQUENCIES.find(row => row.value === value)?.label ?? "Monthly";
}

export interface Mandate {
  ref: string;
  institution: string;
  customer: string;
  account: string;
  accountName: string;
  sendingBank: string;
  receivingBank: string;
  amount: number; // pesewas
  frequency: MandateFrequency;
  status: "active" | "pending" | "suspended";
  start: string;
  end: string;
  activated: boolean;
  activatedAt: string | null;
  phone: string;
  ghanaCard: string;
  address: string;
}

export interface DebitRequest {
  id: string;
  mandate: string;
  customer: string;
  amount: number;
  status: "success" | "failed" | "throttled" | "pending";
  attempted: string;
  settled: string | null;
  creditedAt: string | null;
  sendingBank: string;
  receivingBank: string;
  reason?: string;
}

export interface BankLog {
  ts: string;
  provider: string;
  direction: "IN" | "OUT";
  event: string;
  ref: string;
  status: number;
  ms: number;
}

/** Customer pays GHS 50.00 on activation. */
export const ACTIVATION_FEE = 5000;
/** Sending bank (honours the debit) */
export const FEE_SENDING_BANK = 1000;
/** GDD scheme */
export const FEE_GDD = 3000;
/** Receiving / corresponding bank */
export const FEE_RECEIVING_BANK = 1000;

export const INSTITUTIONS: Institution[] = [
  { id: "STAR",       name: "Star Assurance",    type: "Insurer" },
  { id: "SIC",        name: "SIC Insurance",     type: "Insurer" },
  { id: "ENTERPRISE", name: "Enterprise Life",   type: "Insurer" },
  { id: "GLICO",      name: "GLICO General",     type: "Insurer" },
];

export const PROVIDERS: Provider[] = [
  { id: "FNB",      name: "First National Bank", status: "active",   tokenExpiry: "47m", ips: ["154.160.12.1", "154.160.12.2"] },
  { id: "ECOBANK",  name: "Ecobank Ghana",      status: "active",   tokenExpiry: "12m", ips: ["41.66.82.10"] },
  { id: "ABSA",     name: "Absa Bank Ghana",    status: "degraded", tokenExpiry: "—",   ips: ["196.3.80.1", "196.3.80.2"] },
  { id: "STANBIC",  name: "Stanbic Bank Ghana", status: "inactive", tokenExpiry: "—",   ips: [] },
  { id: "FIDELITY", name: "Fidelity Bank Ghana",status: "active",   tokenExpiry: "58m", ips: ["154.160.40.10"] },
];

export const MANDATES: Mandate[] = [
  { ref: "MND-2024-001847", institution: "STAR",       customer: "Ama Boateng",  accountName: "AMA BOATENG",  account: "0012345678901", sendingBank: "FNB",      receivingBank: "ECOBANK",  amount: 50000,  frequency: "monthly",     status: "active",    start: "2024-01-15", end: "2025-01-14", activated: true,  activatedAt: "2024-01-15 09:23:11", phone: "+233 24 111 0001", ghanaCard: "GHA-123456789-0", address: "14 Independence Avenue, Accra" },
  { ref: "MND-2024-001848", institution: "ENTERPRISE", customer: "Kwame Mensah", accountName: "KWAME MENSAH", account: "0023456789012", sendingBank: "ECOBANK",  receivingBank: "FNB",      amount: 25000,  frequency: "monthly",     status: "active",    start: "2024-01-16", end: "2025-01-15", activated: true,  activatedAt: "2024-01-16 11:04:33", phone: "+233 20 555 0142", ghanaCard: "GHA-234567890-1", address: "8 Liberation Road, Kumasi" },
  { ref: "MND-2024-001849", institution: "SIC",        customer: "Akosua Darko", accountName: "AKOSUA DARKO", account: "0034567890123", sendingBank: "ABSA",     receivingBank: "FNB",      amount: 100000, frequency: "quarterly",   status: "pending",   start: "2024-01-17", end: "2025-01-16", activated: false, activatedAt: null,                phone: "+233 27 440 8810", ghanaCard: "GHA-345678901-2", address: "22 Ring Road Central, Accra" },
  { ref: "MND-2024-001850", institution: "STAR",       customer: "Yaw Owusu",    accountName: "YAW OWUSU",    account: "0045678901234", sendingBank: "FNB",      receivingBank: "FIDELITY", amount: 75000,  frequency: "monthly",     status: "suspended", start: "2024-01-10", end: "2024-12-31", activated: true,  activatedAt: "2024-01-10 14:55:02", phone: "+233 24 900 2218", ghanaCard: "GHA-456789012-3", address: "3 Beach Road, Takoradi" },
  { ref: "MND-2024-001851", institution: "GLICO",      customer: "Efua Adjei",   accountName: "EFUA ADJEI",   account: "0056789012345", sendingBank: "STANBIC",  receivingBank: "FNB",      amount: 15000,  frequency: "annually",    status: "active",    start: "2024-01-18", end: "2025-01-17", activated: true,  activatedAt: "2024-01-18 08:12:44", phone: "+233 26 318 7744", ghanaCard: "GHA-567890123-4", address: "11 University Avenue, Legon" },
  { ref: "MND-2024-001852", institution: "ENTERPRISE", customer: "Kofi Asante",  accountName: "KOFI ASANTE",  account: "0067890123456", sendingBank: "FIDELITY", receivingBank: "ECOBANK",  amount: 200000, frequency: "weekly",      status: "active",    start: "2024-01-19", end: "2025-01-18", activated: true,  activatedAt: "2024-01-19 10:30:15", phone: "+233 55 102 3390", ghanaCard: "GHA-678901234-5", address: "19 Avenor Street, Tamale" },
];

export interface MandateDraft {
  institution: string;
  customer: string;
  accountName: string;
  account: string;
  sendingBank: string;
  receivingBank: string;
  amount: number;
  frequency: MandateFrequency;
  start: string;
  end: string;
  phone: string;
  ghanaCard: string;
  address: string;
}

export const DEBIT_REQUESTS: DebitRequest[] = [
  { id: "DBT-88821", mandate: "MND-2024-001847", customer: "Ama Boateng",   amount: 50000,  status: "success",   attempted: "2024-01-28 09:00:00", settled: "2024-01-28 09:00:44", creditedAt: "2024-01-28 09:00:44", sendingBank: "FNB",      receivingBank: "ECOBANK" },
  { id: "DBT-88822", mandate: "MND-2024-001848", customer: "Kwame Mensah",  amount: 25000,  status: "failed",    attempted: "2024-01-28 09:01:12", settled: null,                  creditedAt: null, sendingBank: "ECOBANK",  receivingBank: "FNB",      reason: "Insufficient funds" },
  { id: "DBT-88823", mandate: "MND-2024-001851", customer: "Efua Adjei",    amount: 15000,  status: "success",   attempted: "2024-01-28 09:02:05", settled: "2024-01-28 09:02:51", creditedAt: "2024-01-28 09:02:51", sendingBank: "STANBIC",  receivingBank: "FNB" },
  { id: "DBT-88824", mandate: "MND-2024-001852", customer: "Kofi Asante",   amount: 200000, status: "throttled", attempted: "2024-01-28 09:03:00", settled: null,                  creditedAt: null, sendingBank: "FIDELITY", receivingBank: "ECOBANK",  reason: "Partial debit rule: max GHS 1,500/day" },
  { id: "DBT-88825", mandate: "MND-2024-001847", customer: "Ama Boateng",   amount: 50000,  status: "pending",   attempted: "2024-01-28 09:04:30", settled: null,                  creditedAt: null, sendingBank: "FNB",      receivingBank: "ECOBANK" },
];

export const BANK_LOGS: BankLog[] = [
  { ts: "09:04:31", provider: "FNB",        direction: "OUT", event: "HONOUR_INSTRUCTION", ref: "DBT-88825",       status: 200, ms: 143 },
  { ts: "09:03:01", provider: "FIDELITY",   direction: "OUT", event: "HONOUR_INSTRUCTION", ref: "DBT-88824",       status: 429, ms: 88  },
  { ts: "09:02:06", provider: "STANBIC",    direction: "OUT", event: "HONOUR_INSTRUCTION", ref: "DBT-88823",       status: 200, ms: 201 },
  { ts: "09:01:13", provider: "ECOBANK",    direction: "OUT", event: "HONOUR_INSTRUCTION", ref: "DBT-88822",       status: 402, ms: 312 },
  { ts: "09:00:01", provider: "FNB",        direction: "OUT", event: "HONOUR_INSTRUCTION", ref: "DBT-88821",       status: 200, ms: 97  },
  { ts: "08:55:00", provider: "SIC",        direction: "IN",  event: "MANDATE_SUBMIT",     ref: "MND-2024-001849", status: 200, ms: 44  },
  { ts: "08:44:12", provider: "FNB",        direction: "OUT", event: "TOKEN_REFRESH",      ref: "—",               status: 200, ms: 211 },
];

export function fmt(pesewas: number): string {
  return `GHS ${(pesewas / 100).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;
}

export function fmtK(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function bankSlug(id: string, name = ""): string {
  const source = (id.trim() || name.trim()).toLowerCase();
  return source.replace(/[^a-z0-9]+/g, "").slice(0, 16);
}

function credentialFingerprint(slug: string): string {
  let hash = 2166136261;
  for (let i = 0; i < slug.length; i += 1) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function bankApiCredentials(id: string, name = "") {
  const slug = bankSlug(id, name);
  if (!slug) return { clientId: "", clientSecret: "" };
  return {
    clientId: `cl_live_gdd_${slug}`,
    clientSecret: `cs_live_gdd_${slug}_${credentialFingerprint(slug)}`,
  };
}

export function institutionName(id: string): string {
  return INSTITUTIONS.find(i => i.id === id)?.name ?? id;
}

export interface BankActivationFee {
  ref: string;
  customer: string;
  institution: string;
  role: "Sending" | "Receiving";
  activatedAt: string | null;
  fee: number;
}

export type PeriodFilter = "today" | "all";

export function todayKey(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function inPeriod(stamp: string | null | undefined, period: PeriodFilter): boolean {
  if (period === "all") return true;
  if (!stamp) return false;
  return stamp.startsWith(todayKey());
}

export function activationShares(count: number) {
  return {
    collected: count * ACTIVATION_FEE,
    sending: count * FEE_SENDING_BANK,
    gdd: count * FEE_GDD,
    receiving: count * FEE_RECEIVING_BANK,
  };
}

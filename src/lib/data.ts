// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface Provider {
  id: string;
  name: string;
  status: "active" | "degraded" | "inactive";
  tokenExpiry: string;
  mandates: number;
  ips: string[];
}

export interface Mandate {
  ref: string;
  customer: string;
  account: string;
  bank: string;
  amount: number; // kobo
  status: "active" | "pending" | "suspended";
  start: string;
  end: string;
  activated: boolean;
  activatedAt: string | null;
}

export interface DebitRequest {
  id: string;
  mandate: string;
  customer: string;
  amount: number; // kobo
  status: "success" | "failed" | "throttled" | "pending";
  attempted: string;
  settled: string | null;
  provider: string;
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

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

export const PROVIDERS: Provider[] = [
  { id: "GTB",   name: "Guaranty Trust Bank",       status: "active",   tokenExpiry: "47m", mandates: 1842, ips: ["41.58.23.1", "41.58.23.2"] },
  { id: "ACCESS",name: "Access Bank",               status: "active",   tokenExpiry: "12m", mandates: 3201, ips: ["154.120.0.1"] },
  { id: "ZENITH",name: "Zenith Bank",               status: "degraded", tokenExpiry: "—",   mandates: 987,  ips: ["197.255.248.1", "197.255.248.2"] },
  { id: "UBA",   name: "United Bank for Africa",    status: "inactive", tokenExpiry: "—",   mandates: 412,  ips: [] },
  { id: "FCMB",  name: "First City Monument Bank",  status: "active",   tokenExpiry: "58m", mandates: 674,  ips: ["154.66.0.10"] },
];

export const MANDATES: Mandate[] = [
  { ref: "MND-2024-001847", customer: "Amara Okonkwo",      account: "0123456789", bank: "GTB",    amount: 50000,  status: "active",    start: "2024-01-15", end: "2025-01-14", activated: true,  activatedAt: "2024-01-15 09:23:11" },
  { ref: "MND-2024-001848", customer: "Chukwuemeka Eze",    account: "0987654321", bank: "ACCESS", amount: 25000,  status: "active",    start: "2024-01-16", end: "2025-01-15", activated: true,  activatedAt: "2024-01-16 11:04:33" },
  { ref: "MND-2024-001849", customer: "Funmilayo Adeyemi",  account: "1122334455", bank: "ZENITH", amount: 100000, status: "pending",   start: "2024-01-17", end: "2025-01-16", activated: false, activatedAt: null },
  { ref: "MND-2024-001850", customer: "Ibrahim Musa",        account: "5544332211", bank: "GTB",    amount: 75000,  status: "suspended", start: "2024-01-10", end: "2024-12-31", activated: true,  activatedAt: "2024-01-10 14:55:02" },
  { ref: "MND-2024-001851", customer: "Ngozi Obi",          account: "6677889900", bank: "UBA",    amount: 15000,  status: "active",    start: "2024-01-18", end: "2025-01-17", activated: true,  activatedAt: "2024-01-18 08:12:44" },
  { ref: "MND-2024-001852", customer: "Taiwo Adeleke",      account: "3344556677", bank: "FCMB",   amount: 200000, status: "active",    start: "2024-01-19", end: "2025-01-18", activated: true,  activatedAt: "2024-01-19 10:30:15" },
];

export const DEBIT_REQUESTS: DebitRequest[] = [
  { id: "DBT-88821", mandate: "MND-2024-001847", customer: "Amara Okonkwo",     amount: 50000,  status: "success",  attempted: "2024-01-28 09:00:00", settled: "2024-01-28 09:00:44", provider: "GTB" },
  { id: "DBT-88822", mandate: "MND-2024-001848", customer: "Chukwuemeka Eze",   amount: 25000,  status: "failed",   attempted: "2024-01-28 09:01:12", settled: null,                  provider: "ACCESS", reason: "Insufficient funds" },
  { id: "DBT-88823", mandate: "MND-2024-001851", customer: "Ngozi Obi",         amount: 15000,  status: "success",  attempted: "2024-01-28 09:02:05", settled: "2024-01-28 09:02:51", provider: "UBA" },
  { id: "DBT-88824", mandate: "MND-2024-001852", customer: "Taiwo Adeleke",     amount: 200000, status: "throttled",attempted: "2024-01-28 09:03:00", settled: null,                  provider: "FCMB",   reason: "Partial debit rule: max ₦150,000/day" },
  { id: "DBT-88825", mandate: "MND-2024-001847", customer: "Amara Okonkwo",     amount: 50000,  status: "pending",  attempted: "2024-01-28 09:04:30", settled: null,                  provider: "GTB" },
];

export const BANK_LOGS: BankLog[] = [
  { ts: "09:04:31", provider: "GTB",    direction: "OUT", event: "DEBIT_REQUEST",   ref: "DBT-88825",       status: 200, ms: 143 },
  { ts: "09:03:01", provider: "FCMB",   direction: "OUT", event: "DEBIT_REQUEST",   ref: "DBT-88824",       status: 429, ms: 88  },
  { ts: "09:02:06", provider: "UBA",    direction: "OUT", event: "DEBIT_REQUEST",   ref: "DBT-88823",       status: 200, ms: 201 },
  { ts: "09:01:13", provider: "ACCESS", direction: "OUT", event: "DEBIT_REQUEST",   ref: "DBT-88822",       status: 402, ms: 312 },
  { ts: "09:00:01", provider: "GTB",    direction: "OUT", event: "DEBIT_REQUEST",   ref: "DBT-88821",       status: 200, ms: 97  },
  { ts: "08:55:00", provider: "ZENITH", direction: "IN",  event: "MANDATE_CALLBACK",ref: "MND-2024-001849", status: 200, ms: 44  },
  { ts: "08:44:12", provider: "GTB",    direction: "OUT", event: "TOKEN_REFRESH",   ref: "—",               status: 200, ms: 211 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function fmt(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export function fmtK(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function genMandateRef(): string {
  const y = new Date().getFullYear();
  const n = String(Math.floor(Math.random() * 90000) + 10000);
  return `MND-${y}-${n}`;
}

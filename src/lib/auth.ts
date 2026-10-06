export type UserRole = "Super Admin" | "Operations" | "Finance Viewer" | "Provider API" | "Institution" | "Read Only";
export type UserStatus = "active" | "inactive";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  bankId?: string;
  institutionId?: string;
}

export interface DirectoryUser extends AuthUser {
  status: UserStatus;
  last: string;
}

export interface StoredUser extends DirectoryUser {
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  portal?: Portal;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface InviteRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  bankId?: string;
  institutionId?: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export const ROLES: UserRole[] = [
  "Super Admin",
  "Operations",
  "Finance Viewer",
  "Provider API",
  "Institution",
  "Read Only",
];

export type Portal = "gdd" | "bank" | "institution";

const LEGACY_SESSION_KEY = "gdd.session";
const USERS_KEY = "gdd.users";
const SESSION_KEYS: Record<Portal, string> = {
  gdd: "gdd.session.gdd",
  bank: "gdd.session.bank",
  institution: "gdd.session.institution",
};

export const PORTALS: Portal[] = ["gdd", "bank", "institution"];

export const DEMO_ACCOUNT = {
  name: "Ama Boateng",
  email: "ama.boateng@gdd.io",
  password: "gdd-demo",
} as const;

export const DEMO_BANK_ACCOUNT = {
  name: "Kojo Ampofo",
  email: "kojo.ampofo@fnb.com.gh",
  password: "gdd-demo",
  bankId: "FNB",
} as const;

export const DEMO_INSTITUTION_ACCOUNT = {
  name: "Adwoa Frimpong",
  email: "adwoa.frimpong@starassurance.com.gh",
  password: "gdd-demo",
  institutionId: "STAR",
} as const;

const SEED_USERS: StoredUser[] = [
  { id: "usr_demo",  name: "Ama Boateng",   email: "ama.boateng@gdd.io",     password: "gdd-demo", initials: "AB", role: "Super Admin",    status: "active",   last: "2024-01-28 09:00" },
  { id: "usr_kwame", name: "Kwame Mensah",  email: "kwame.mensah@gdd.io",    password: "gdd-demo", initials: "KM", role: "Operations",     status: "active",   last: "2024-01-28 08:44" },
  { id: "usr_akosua",name: "Akosua Darko",  email: "akosua.darko@gdd.io",    password: "gdd-demo", initials: "AD", role: "Finance Viewer", status: "active",   last: "2024-01-27 17:30" },
  { id: "usr_yaw",   name: "Yaw Owusu",     email: "yaw.owusu@fnb.com.gh",   password: "gdd-demo", initials: "YO", role: "Provider API",   status: "inactive", last: "2024-01-20 12:00", bankId: "FNB" },
  { id: "usr_kojo",  name: "Kojo Ampofo",   email: "kojo.ampofo@fnb.com.gh", password: "gdd-demo", initials: "KA", role: "Provider API",   status: "active",   last: "2024-01-28 09:12", bankId: "FNB" },
  { id: "usr_abena", name: "Abena Sarpong", email: "abena.sarpong@ecobank.com.gh", password: "gdd-demo", initials: "AS", role: "Provider API", status: "active", last: "2024-01-28 08:50", bankId: "ECOBANK" },
  { id: "usr_nana",  name: "Nana Yeboah",   email: "nana.yeboah@absa.com.gh", password: "gdd-demo", initials: "NY", role: "Provider API", status: "active", last: "2024-01-28 08:40", bankId: "ABSA" },
  { id: "usr_adwoa", name: "Adwoa Frimpong", email: "adwoa.frimpong@starassurance.com.gh", password: "gdd-demo", initials: "AF", role: "Institution", status: "active", last: "2024-01-28 09:05", institutionId: "STAR" },
];

function migrateEmail(email: string): string {
  return email.replace(/@gcb\.com\.gh$/i, "@fnb.com.gh");
}

function migrateBankId(id?: string): string | undefined {
  return id === "GCB" ? "FNB" : id;
}

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("");
}

function stamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id, name: user.name, email: user.email, initials: user.initials,
    role: user.role, bankId: user.bankId, institutionId: user.institutionId,
  };
}

function toDirectoryUser(user: StoredUser): DirectoryUser {
  return {
    id: user.id, name: user.name, email: user.email, initials: user.initials,
    role: user.role, status: user.status, last: user.last, bankId: user.bankId,
    institutionId: user.institutionId,
  };
}

function normalizeUser(raw: Partial<StoredUser> & Pick<StoredUser, "email" | "name" | "password">): StoredUser {
  const email = migrateEmail(raw.email);
  const seed = SEED_USERS.find(s => s.email.toLowerCase() === email.toLowerCase());
  return {
    id: raw.id ?? seed?.id ?? `usr_${Date.now()}`,
    name: raw.name,
    email,
    password: raw.password,
    initials: raw.initials || toInitials(raw.name),
    role: raw.role ?? seed?.role ?? "Operations",
    status: raw.status ?? seed?.status ?? "active",
    last: raw.last ?? seed?.last ?? stamp(),
    bankId: migrateBankId(raw.bankId ?? seed?.bankId),
    institutionId: raw.institutionId ?? seed?.institutionId,
  };
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return SEED_USERS;
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) {
    writeUsers(SEED_USERS);
    return SEED_USERS;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredUser>[];
    const byEmail = new Map<string, StoredUser>();
    for (const row of parsed) {
      if (!row?.email || !row.name || !row.password) continue;
      const user = normalizeUser(row as StoredUser);
      byEmail.set(user.email.toLowerCase(), user);
    }
    for (const seed of SEED_USERS) {
      if (!byEmail.has(seed.email.toLowerCase())) byEmail.set(seed.email.toLowerCase(), seed);
    }
    const users = Array.from(byEmail.values());
    writeUsers(users);
    return users;
  } catch {
    writeUsers(SEED_USERS);
    return SEED_USERS;
  }
}

function writeUsers(users: StoredUser[]): void {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function writeSession(user: AuthUser): void {
  const portal = portalFor(user);
  window.localStorage.setItem(SESSION_KEYS[portal], JSON.stringify(user));
}

function parseSession(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email) return null;
    const email = migrateEmail(parsed.email);
    const stored = readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    return stored ? toPublicUser(stored) : {
      id: parsed.id,
      name: parsed.name,
      email,
      initials: parsed.initials,
      role: parsed.role ?? "Operations",
      bankId: migrateBankId(parsed.bankId),
      institutionId: parsed.institutionId,
    };
  } catch {
    return null;
  }
}

function migrateLegacySession(): void {
  if (typeof window === "undefined") return;
  const legacy = parseSession(window.localStorage.getItem(LEGACY_SESSION_KEY));
  if (!legacy) return;
  const portal = portalFor(legacy);
  if (!window.localStorage.getItem(SESSION_KEYS[portal])) {
    window.localStorage.setItem(SESSION_KEYS[portal], JSON.stringify(legacy));
  }
  window.localStorage.removeItem(LEGACY_SESSION_KEY);
}

export function getSession(portal: Portal): AuthUser | null {
  if (typeof window === "undefined") return null;
  migrateLegacySession();
  const user = parseSession(window.localStorage.getItem(SESSION_KEYS[portal]));
  if (!user) return null;
  if (portalFor(user) !== portal) {
    window.localStorage.removeItem(SESSION_KEYS[portal]);
    return null;
  }
  return user;
}

export function listSessions(): Partial<Record<Portal, AuthUser>> {
  const sessions: Partial<Record<Portal, AuthUser>> = {};
  for (const portal of PORTALS) {
    const user = getSession(portal);
    if (user) sessions[portal] = user;
  }
  return sessions;
}

export function clearSession(portal: Portal): void {
  window.localStorage.removeItem(SESSION_KEYS[portal]);
}

export function isSessionKey(key: string | null): key is string {
  return Boolean(key && (Object.values(SESSION_KEYS) as string[]).includes(key));
}

function validateIdentity(name: string, email: string, password: string): { name: string; email: string } {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedName) throw new Error("Enter a full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) throw new Error("Enter a valid work email.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  return { name: trimmedName, email: trimmedEmail };
}

function createUser(payload: InviteRequest, status: UserStatus = "active"): StoredUser {
  const { name, email } = validateIdentity(payload.name, payload.email, payload.password);
  if (payload.role === "Provider API" && !payload.bankId) {
    throw new Error("Select a bank for provider accounts.");
  }
  if (payload.role === "Institution" && !payload.institutionId) {
    throw new Error("Select an institution for this account.");
  }
  const users = readUsers();
  if (users.some(u => u.email.toLowerCase() === email)) {
    throw new Error("An account with this email already exists.");
  }
  const user: StoredUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    password: payload.password,
    initials: toInitials(name),
    role: payload.role,
    status,
    last: stamp(),
    bankId: payload.role === "Provider API" ? payload.bankId : undefined,
    institutionId: payload.role === "Institution" ? payload.institutionId : undefined,
  };
  writeUsers([...users, user]);
  return user;
}

export function listDirectory(): DirectoryUser[] {
  return readUsers().map(toDirectoryUser);
}

export function portalFor(user: AuthUser): Portal {
  if (user.role === "Provider API" && user.bankId) return "bank";
  if (user.role === "Institution" && user.institutionId) return "institution";
  return "gdd";
}

export function homePath(user: AuthUser): string {
  const portal = portalFor(user);
  if (portal === "bank") return "/bank";
  if (portal === "institution") return "/institution";
  return "/dashboard";
}

export function loginPath(portal: Portal): string {
  if (portal === "bank") return "/bank/login";
  if (portal === "institution") return "/institution/login";
  return "/regulator/login";
}

export function portalFromPath(pathname: string): Portal | null {
  if (
    pathname === "/login"
    || pathname === "/signup"
    || pathname === "/regulator/login"
    || pathname === "/bank/login"
    || pathname === "/institution/login"
  ) return null;
  if (pathname === "/bank" || pathname.startsWith("/bank/")) return "bank";
  if (pathname === "/institution" || pathname.startsWith("/institution/")) return "institution";
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return "gdd";
  return null;
}

export function portalLabel(portal: Portal): string {
  if (portal === "bank") return "Bank";
  if (portal === "institution") return "Institution";
  return "Regulator";
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  await delay(400);
  const email = migrateEmail(payload.email.trim().toLowerCase());
  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email);
  if (!user || user.password !== payload.password) {
    throw new Error("Invalid email or password.");
  }
  if (user.status === "inactive") {
    throw new Error("This account is inactive. Ask an admin to restore access.");
  }
  const candidate = toPublicUser(user);
  if (payload.portal && portalFor(candidate) !== payload.portal) {
    throw new Error("This account belongs to a different app.");
  }
  const next = { ...user, last: stamp() };
  writeUsers(users.map(u => u.id === user.id ? next : u));
  const publicUser = toPublicUser(next);
  writeSession(publicUser);
  return { user: publicUser };
}

export async function signup(payload: SignupRequest): Promise<AuthResponse> {
  await delay(500);
  const user = createUser({ ...payload, role: "Super Admin" });
  const publicUser = toPublicUser(user);
  writeSession(publicUser);
  return { user: publicUser };
}

export async function inviteUser(payload: InviteRequest): Promise<DirectoryUser> {
  await delay(400);
  return toDirectoryUser(createUser(payload));
}

export function ensureProviderAccount(bankId: string, bankName: string): void {
  const email = `ops@${bankId.toLowerCase()}.gdd.bank`;
  const users = readUsers();
  if (users.some(u => u.bankId === bankId || u.email.toLowerCase() === email)) return;
  const name = `${bankName} Ops`;
  const user: StoredUser = {
    id: `usr_${bankId.toLowerCase()}`,
    name,
    email,
    password: "gdd-demo",
    initials: toInitials(name),
    role: "Provider API",
    status: "active",
    last: stamp(),
    bankId,
  };
  writeUsers([...users, user]);
  window.dispatchEvent(new Event("gdd-users"));
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

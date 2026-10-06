"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  AuthUser,
  DirectoryUser,
  InviteRequest,
  LoginRequest,
  SignupRequest,
  type Portal,
  clearSession,
  inviteUser as inviteRequest,
  isSessionKey,
  listDirectory,
  listSessions,
  login as loginRequest,
  portalFromPath,
  signup as signupRequest,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  sessions: Partial<Record<Portal, AuthUser>>;
  portal: Portal | null;
  users: DirectoryUser[];
  isReady: boolean;
  login: (payload: LoginRequest) => Promise<AuthUser>;
  signup: (payload: SignupRequest) => Promise<AuthUser>;
  invite: (payload: InviteRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const portal = portalFromPath(pathname);
  const [sessions, setSessions] = useState<Partial<Record<Portal, AuthUser>>>({});
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [isReady, setIsReady] = useState(false);
  const user = portal ? sessions[portal] ?? null : null;

  const refreshDirectory = useCallback(() => {
    setUsers(listDirectory());
  }, []);

  const refreshSessions = useCallback(() => {
    setSessions(listSessions());
  }, []);

  useEffect(() => {
    refreshSessions();
    refreshDirectory();
    setIsReady(true);
    const onUsers = () => refreshDirectory();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "gdd.users") refreshDirectory();
      if (isSessionKey(event.key)) refreshSessions();
    };
    window.addEventListener("gdd-users", onUsers);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("gdd-users", onUsers);
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshDirectory, refreshSessions]);

  const login = useCallback(async (payload: LoginRequest) => {
    const { user: next } = await loginRequest(payload);
    refreshSessions();
    refreshDirectory();
    return next;
  }, [refreshDirectory, refreshSessions]);

  const signup = useCallback(async (payload: SignupRequest) => {
    const { user: next } = await signupRequest(payload);
    refreshSessions();
    refreshDirectory();
    return next;
  }, [refreshDirectory, refreshSessions]);

  const invite = useCallback(async (payload: InviteRequest) => {
    await inviteRequest(payload);
    refreshDirectory();
  }, [refreshDirectory]);

  const logout = useCallback(() => {
    if (portal) clearSession(portal);
    refreshSessions();
  }, [portal, refreshSessions]);

  const value = useMemo(
    () => ({ user, sessions, portal, users, isReady, login, signup, invite, logout }),
    [user, sessions, portal, users, isReady, login, signup, invite, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

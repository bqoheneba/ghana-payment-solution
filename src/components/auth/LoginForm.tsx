"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEMO_ACCOUNT,
  DEMO_BANK_ACCOUNT,
  DEMO_INSTITUTION_ACCOUNT,
  homePath,
  loginPath,
  portalLabel,
  type Portal,
} from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { Field, Input } from "@/components/ui";

const DEMO = {
  gdd: DEMO_ACCOUNT,
  bank: DEMO_BANK_ACCOUNT,
  institution: DEMO_INSTITUTION_ACCOUNT,
} as const;

const HINT: Record<Portal, string> = {
  gdd: "GDD operators validating mandates and instructing banks.",
  bank: "Provider banks that honour debits or confirm credit.",
  institution: "Originating institutions that submit mandates to GDD.",
};

export function LoginForm({ portal }: { portal: Portal }) {
  const router = useRouter();
  const { login } = useAuth();
  const demo = DEMO[portal];
  const [email, setEmail] = useState<string>(demo.email);
  const [password, setPassword] = useState<string>(demo.password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const next = await login({ email, password, portal });
      router.replace(homePath(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Work email">
        <Input
          type="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={demo.email}
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          required
        />
      </Field>

      {error && <div className="notice-error">{error}</div>}

      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ padding: "12px 16px", fontSize: 14, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.55 }}>
        {HINT[portal]}<br />
        Demo: {demo.email} / {demo.password}
      </p>

      {portal === "gdd" && (
        <p style={{ fontSize: 13, color: "var(--text-mid)" }}>
          New to GDD?{" "}
          <Link href="/signup" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      )}

      <p style={{ fontSize: 12, color: "var(--text-dim)", display: "flex", gap: 10, flexWrap: "wrap" }}>
        {(["gdd", "bank", "institution"] as Portal[]).map(item => (
          item === portal
            ? <span key={item} style={{ fontWeight: 600, color: "var(--text-mid)" }}>{portalLabel(item)}</span>
            : <Link key={item} href={loginPath(item)} style={{ color: "var(--accent)", textDecoration: "none" }}>{portalLabel(item)}</Link>
        ))}
      </p>
    </form>
  );
}

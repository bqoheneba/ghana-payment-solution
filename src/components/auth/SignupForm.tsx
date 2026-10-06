"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Field, Input } from "@/components/ui";

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signup({ name, email, password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Full name">
        <Input
          name="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Kwame Mensah"
          autoComplete="name"
          required
        />
      </Field>
      <Field label="Work email">
        <Input
          type="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="kwame.mensah@gdd.io"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Password" hint="At least 8 characters. You will use this to sign in.">
        <Input
          type="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <Field label="Confirm password">
        <Input
          type="password"
          name="confirm"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repeat password"
          autoComplete="new-password"
          minLength={8}
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
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p style={{ fontSize: 13, color: "var(--text-mid)" }}>
        Already have an account?{" "}
        <Link href="/regulator/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </form>
  );
}

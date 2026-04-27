"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { login } from "../lib/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <div className="space-y-3">
          <Link href="/session" className="text-sm text-emerald-300 hover:text-emerald-200">
            Back to live monitor
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm text-slate-300">
            Use your account to sync dashboard sessions through the new API.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              placeholder="At least 8 characters"
              required
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-300">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-emerald-300 hover:text-emerald-200">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

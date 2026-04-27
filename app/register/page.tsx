"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { register } from "../lib/apiClient";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await register(email, password, age ? Number(age) : undefined);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <div className="space-y-3">
          <Link href="/" className="text-sm text-emerald-300 hover:text-emerald-200">
            Back to home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create account
          </h1>
          <p className="text-sm text-slate-300">
            Set up API-backed storage for sessions, stats, and future chatbot context.
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

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Age (optional)</span>
            <input
              type="number"
              min="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              placeholder="25"
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
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-300">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

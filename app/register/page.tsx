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
      router.push("/session");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-100 via-white to-emerald-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="space-y-3">
          <Link href="/session" className="text-sm text-slate-500 hover:text-slate-700">
            Back to live monitor
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Create account
          </h1>
          <p className="text-sm text-slate-600">
            Set up API-backed storage for sessions, stats, and future chatbot context.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              placeholder="At least 8 characters"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Age (optional)</span>
            <input
              type="number"
              min="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              placeholder="25"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

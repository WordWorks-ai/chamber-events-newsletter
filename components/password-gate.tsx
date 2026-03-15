"use client";

import { type ReactNode, useEffect, useState } from "react";

interface PasswordGateProps {
  children: ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [state, setState] = useState<"loading" | "locked" | "unlocked">("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("app_authed");
    if (stored === "1") {
      setState("unlocked");
      return;
    }

    // Check if password protection is even enabled
    void (async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: "" })
        });
        if (res.ok) {
          // No password configured — skip gate
          sessionStorage.setItem("app_authed", "1");
          setState("unlocked");
        } else {
          setState("locked");
        }
      } catch {
        setState("locked");
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(false);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        sessionStorage.setItem("app_authed", "1");
        setState("unlocked");
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  }

  if (state === "loading") {
    return null;
  }

  if (state === "unlocked") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form
        className="w-full max-w-sm space-y-5 rounded-3xl border border-indigo-100 bg-white p-8 shadow-xl"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
            Chamber Events Newsletter
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Enter password</h1>
        </div>

        <input
          autoFocus
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          type="password"
          value={password}
        />

        {error && (
          <p className="text-center text-sm text-red-600">Incorrect password. Please try again.</p>
        )}

        <button
          className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          disabled={checking || !password}
          type="submit"
        >
          {checking ? "Checking..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoricoLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/lorico/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.message || "Invalid username or password");
      }
    } catch {
      setError("Something went wrong");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-lg p-8 shadow-xl border border-white/20">
        <div className="mb-6 flex justify-center">
          <div
            className="h-20 w-full rounded-lg bg-cover bg-center"
            style={{ backgroundImage: "url('/hideoutbanner.jpg')" }}
          />
        </div>

        <h1 className="font-display text-2xl font-semibold text-white text-center mb-6">
          Hideout Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-blue-200 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-blue-200/50 outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-blue-200 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-blue-200/50 outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose-400/50 bg-rose-500/20 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
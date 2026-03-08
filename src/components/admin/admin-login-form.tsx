"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter email and password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message || "Login failed.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl border border-slate-300 bg-white p-8 shadow-md"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-950">
          Organizer Login
        </h1>
        <p className="mt-2 text-slate-700">
          Sign in to access the Gami Gedara admin dashboard.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white ${
          loading ? "bg-slate-500" : "bg-slate-950 hover:opacity-90"
        }`}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
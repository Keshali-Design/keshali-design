"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass rounded-card p-8">
        <h1 className="text-xl font-bold gold-text mb-1">Keshali Admin</h1>
        <p className="text-muted text-sm mb-8">Panel de administración</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-white/5 border border-subtle rounded-lg px-3 py-2.5 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-white/5 border border-subtle rounded-lg px-3 py-2.5 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

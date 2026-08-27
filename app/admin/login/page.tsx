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
    <div className="min-h-screen bg-section flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-subtle p-8">
        <div className="font-extrabold text-xl tracking-tight text-gold-700 leading-tight">
          KESHALI
        </div>
        <div className="text-[10px] font-normal tracking-[0.34em] uppercase text-label mb-6">
          Design
        </div>

        <h1 className="text-lg font-bold text-ink mb-1">Panel de administración</h1>
        <p className="text-body text-sm mb-8">Ingresa con tu cuenta de administrador</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && (
            <p className="text-red-700 text-sm bg-red-50 border border-red-200 px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="label-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-[#FDFBF7] border border-subtle px-3 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-sm">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-[#FDFBF7] border border-subtle px-3 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
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

"use client";

export default function TamañosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-4">Tipos de tamaño</h1>
      <div className="glass rounded-card p-6 border border-red-400/20">
        <p className="text-red-400 text-sm font-semibold mb-1">Error inesperado</p>
        <p className="text-muted text-xs font-mono break-all">{error.message}</p>
        {error.digest && (
          <p className="text-muted text-[10px] mt-1 font-mono">digest: {error.digest}</p>
        )}
        <p className="text-muted text-xs mt-3">
          Verifica que las migraciones SQL estén ejecutadas en Supabase y que
          las variables de entorno estén configuradas en Vercel.
        </p>
        <button
          onClick={reset}
          className="btn-ghost text-xs mt-4 py-1.5 px-3"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

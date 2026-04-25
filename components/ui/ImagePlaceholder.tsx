export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-surface-gradient ${className ?? ""}`}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        className="opacity-20"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#caa45a" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" stroke="#caa45a" strokeWidth="1.5" />
        <path
          d="M3 16l5-5 4 4 3-3 6 6"
          stroke="#caa45a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xs text-muted/50">Sin imagen</span>
    </div>
  );
}

import { PROMO_MESSAGES } from "@/lib/site";

// Pure-CSS marquee: the track holds two identical halves and slides by -50%,
// so the loop is seamless. Each half repeats the list so it's wider than any
// screen. Pauses on hover; static for users who prefer reduced motion.
export function PromoBar() {
  const half = [...PROMO_MESSAGES, ...PROMO_MESSAGES];

  return (
    <div className="promo-marquee bg-[#0A1B2F] text-[#E6C77D] text-[11px] font-semibold tracking-wide overflow-hidden">
      <p className="sr-only">{PROMO_MESSAGES.join(". ")}</p>
      <div className="promo-track flex w-max" aria-hidden>
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {half.map((msg, i) => (
              <li key={i} className="flex items-center whitespace-nowrap py-2">
                <span className="px-5">{msg}</span>
                <span className="text-[#E6C77D]/50">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

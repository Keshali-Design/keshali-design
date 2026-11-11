export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "Keshali Design Sublimación";
export const SITE_TAGLINE = "Tu esencia en cada diseño";

export const SITE_DESCRIPTION =
  "Keshali Design Sublimación: sublimación, estampación DTF y personalización de mugs, camisetas, buzos, gorras, cojines y regalos en Colombia. Diseños únicos con acabado premium.";

export const SITE_KEYWORDS = [
  "Keshali Design",
  "Keshali Design Sublimación",
  "sublimación",
  "estampación",
  "estampado",
  "personalización",
  "productos personalizados",
  "estampado DTF",
  "mugs personalizados",
  "camisetas personalizadas",
  "buzos personalizados",
  "gorras personalizadas",
  "regalos personalizados",
  "sublimación Colombia",
];

export const WHATSAPP_NUMBER = "573159635343";
export const WHATSAPP_DISPLAY = "+57 315 9635343";
export const INSTAGRAM = {
  handle: "keshalidesign_sublimacion",
  url: "https://www.instagram.com/keshalidesign_sublimacion/",
};
export const TIKTOK = {
  handle: "keshalidesignsublimacion",
  url: "https://www.tiktok.com/@keshalidesignsublimacion",
};
export const SOCIAL_LINKS = [INSTAGRAM.url, TIKTOK.url];

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

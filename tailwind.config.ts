import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f10",
        gold: {
          DEFAULT: "#caa45a",
          light: "#d4b57a",
          dark: "#b08940",
        },
        surface: "rgba(255,255,255,0.04)",
        muted: "#9a9a9a",
      },
      textColor: {
        base: "#e8e8e8",
        muted: "#9a9a9a",
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.08)",
        gold: "#caa45a",
      },
      boxShadow: {
        card: "0 8px 32px rgba(0,0,0,0.5)",
        gold: "0 0 24px rgba(202,164,90,0.25)",
      },
      borderRadius: {
        card: "16px",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse at 60% 40%, #1a1408 0%, #0f0f10 70%)",
        "gold-gradient": "linear-gradient(135deg, #caa45a, #f0d080)",
        "surface-gradient":
          "linear-gradient(135deg, rgba(202,164,90,0.08), rgba(202,164,90,0.02))",
      },
    },
  },
  plugins: [],
};

export default config;

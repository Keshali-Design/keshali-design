import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#FBF7F0",
        page: "#EFEAE1",
        nav: "#FFFFFF",
        ink: "#2B2420",
        surface: "#FFFFFF",
        section: "#FBF7F0",
        sidebar: "#221D19",
        sidebarText: "#F5EFE4",
        gold: {
          50: "#FBF3E4",
          100: "#F3E4C6",
          200: "#E7CE9B",
          300: "#D6B36C",
          DEFAULT: "#C09449",
          500: "#C09449",
          light: "#D6B36C",
          dark: "#8A6323",
          600: "#A97C33",
          700: "#8A6323",
          800: "#664819",
          900: "#443111",
        },
        muted: "#8A7C6C",
        body: "#6B5D4E",
        label: "#B09B78",
        subtle: "#E6D9BF",
        subtle2: "#F2EAD9",
      },
      textColor: {
        muted: "#8A7C6C",
      },
      borderColor: {
        gold: "#C09449",
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,36,32,.10)",
        md: "0 3px 12px rgba(43,36,32,.10)",
        gold: "0 0 24px rgba(192,148,73,0.2)",
      },
      borderRadius: {
        card: "0px",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(180deg,#FBF7F0 0%,#F6EFE1 100%)",
        "gold-gradient": "linear-gradient(135deg, #C09449, #D6B36C)",
      },
    },
  },
  plugins: [],
};

export default config;

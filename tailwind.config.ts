import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sab: {
          ink: "#0f172a",
          forest: "#1e40af",
          "forest-light": "#2563eb",
          terracotta: "#2563eb",
          "terracotta-dark": "#1d4ed8",
          rose: "#e11d8f",
          "rose-light": "#fce7f3",
          "rose-dark": "#be185d",
          cream: "#f8fafc",
          mist: "#f0f9ff",
          sand: "#e2e8f0",
          gold: "#93c5fd",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        sab: "0 4px 24px rgba(37, 99, 235, 0.08)",
        "sab-lg": "0 12px 40px rgba(15, 23, 42, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;

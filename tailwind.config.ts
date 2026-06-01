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
          ink: "#1a1612",
          forest: "#1b4332",
          "forest-light": "#2d6a4f",
          terracotta: "#c4683a",
          "terracotta-dark": "#9e4f2a",
          cream: "#faf6f0",
          mist: "#f3ede4",
          sand: "#e3d5c4",
          gold: "#d4a24e",
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
        sab: "0 4px 24px rgba(27, 67, 50, 0.08)",
        "sab-lg": "0 12px 40px rgba(26, 22, 18, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;

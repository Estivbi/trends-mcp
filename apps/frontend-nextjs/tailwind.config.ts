import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "stibios-bg": "#0a0a0f",
        "stibios-surface": "#111118",
        "stibios-border": "#1e1e2e",
        "stibios-text": "#e2e8f0",
        "stibios-muted": "#64748b",
        "stibios-accent": "#6366f1",
        "stibios-accent-glow": "rgba(99,102,241,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
